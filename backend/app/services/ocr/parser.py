"""
Tesseract が返す生テキストから「店舗名・日付・金額」を抜き出す簡易パーサー。

正規表現によるヒューリスティックであり、レシートのレイアウト次第では
認識に失敗する（None を返す）。認識できなかった項目はフロントエンドで
手入力してもらう前提の設計。

将来マルチモーダルLLM（Claude / GPT-4V 等）によるAI OCRに置き換える場合は、
この parser.py 自体が不要になる想定（LLM に構造化 JSON で直接返させるため）。
詳細は backend/app/services/ocr/engine.py のコメントを参照。
"""

import re
from dataclasses import dataclass
from datetime import date

# 「合計」を優先し、「小計」はあえて含めない（お預かり前の金額を誤って拾わないため）。
# 駐車場の領収書等では「料金」「TOTAL」表記が使われることもあるため対応する。
# 金額の桁区切りカンマ「,」は感熱紙レシートの粗い印字だとTesseractがピリオド「.」と
# 誤認識することが多い（実機テストで確認済み）ため、両方を許容してパース時に取り除く。
_AMOUNT_LABEL_PATTERNS = [
    re.compile(
        r"(?:合計|総額|ご請求額?|お会計|ご利用金額|お支払い?金額?|料金|TOTAL)[^\d]{0,10}([\d,.]{3,})",
        re.IGNORECASE,
    ),
]
_AMOUNT_FALLBACK_PATTERN = re.compile(r"[¥￥Y]\s*([\d,.]{3,})|([\d,.]{3,})\s*円")

# 年・月・日の区切り文字の直後にOCRが余分な空白を挿入することがある
# （例:「2026年 7月30日」）ため、区切り文字と数字の間の空白を許容する。
_DATE_PATTERNS = [
    re.compile(r"(20\d{2})[年/\-.]\s*(\d{1,2})[月/\-.]\s*(\d{1,2})"),
]

# 店舗名候補から除外する行のパターン群。店舗名そのものに市区町村名が含まれることも多い
# （例:「エコパーキング上本町」）ため、住所らしさの判定は郵便番号・都道府県レベルに留める。
_STORE_NAME_EXCLUDE_PATTERNS = [
    re.compile(r"^[\d\s\-:./TEL#*＊№No.]*$", re.IGNORECASE),  # 数字・記号のみの行
    re.compile(r"\d{2,4}[年/\-.]\d{1,2}[月/\-.]\d{1,2}"),  # 日付
    re.compile(r"\d{1,2}:\d{2}(:\d{2})?"),  # 時刻
    re.compile(r"合計|小計|総額|お会計|ご利用金額|お支払|お預かり|お釣り|税込|税抜|消費税|料金"),  # 金額系ラベル
    re.compile(r"[¥￥]|円$"),  # 金額表記そのもの
    re.compile(r"TEL|電話|FAX", re.IGNORECASE),  # 電話番号系
    re.compile(r"〒|(都|道|府|県)[^\s]{2,}(市|区|郡)"),  # 郵便番号・「東京都渋谷区」のような住所表記
    re.compile(r"領収書|レシート|ありがとうございました|またお越しください|明細"),  # 定型文
]


@dataclass
class ParsedReceipt:
    store_name: str | None
    date: date | None
    amount: int | None


def _clean_amount_digits(raw: str) -> str:
    # 桁区切り「,」だけでなく、OCRがそれを誤認識した「.」も区切り文字として取り除く。
    # 末尾の「.-」（＝「◯◯円ちょうど」を表す表記）が付く場合も同様にここで落ちる。
    return raw.replace(",", "").replace(".", "")


def _parse_amount(text: str) -> int | None:
    for pattern in _AMOUNT_LABEL_PATTERNS:
        match = pattern.search(text)
        if match:
            digits = _clean_amount_digits(match.group(1))
            if digits.isdigit():
                return int(digits)

    # ラベル付きの金額が見つからない場合、円/¥表記の数値のうち最大のものを合計額とみなす
    candidates: list[int] = []
    for match in _AMOUNT_FALLBACK_PATTERN.finditer(text):
        raw = _clean_amount_digits(match.group(1) or match.group(2) or "")
        if raw.isdigit():
            candidates.append(int(raw))
    return max(candidates) if candidates else None


def _parse_date(text: str) -> date | None:
    for pattern in _DATE_PATTERNS:
        match = pattern.search(text)
        if match:
            year, month, day = (int(value) for value in match.groups())
            try:
                return date(year, month, day)
            except ValueError:
                continue
    return None


def _is_store_name_candidate(line: str) -> bool:
    if len(line) < 2:
        return False
    return not any(pattern.search(line) for pattern in _STORE_NAME_EXCLUDE_PATTERNS)


def _parse_store_name(text: str) -> str | None:
    for line in text.splitlines():
        stripped = line.strip()
        if _is_store_name_candidate(stripped):
            return stripped
    return None


def parse_receipt_text(text: str) -> ParsedReceipt:
    return ParsedReceipt(
        store_name=_parse_store_name(text),
        date=_parse_date(text),
        amount=_parse_amount(text),
    )
