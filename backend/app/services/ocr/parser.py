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

_AMOUNT_LABEL_PATTERNS = [
    re.compile(r"(?:合計|総額|ご請求額?|お会計|ご利用金額|お支払い?金額?)[^\d]{0,10}([\d,]{3,})"),
]
_AMOUNT_FALLBACK_PATTERN = re.compile(r"[¥￥]\s*([\d,]{3,})|([\d,]{3,})\s*円")

_DATE_PATTERNS = [
    re.compile(r"(20\d{2})[年/\-.](\d{1,2})[月/\-.](\d{1,2})"),
]

_NON_STORE_NAME_LINE = re.compile(r"^[\d\s\-:./TEL#*＊№No.]*$", re.IGNORECASE)


@dataclass
class ParsedReceipt:
    store_name: str | None
    date: date | None
    amount: int | None


def _parse_amount(text: str) -> int | None:
    for pattern in _AMOUNT_LABEL_PATTERNS:
        match = pattern.search(text)
        if match:
            digits = match.group(1).replace(",", "")
            if digits.isdigit():
                return int(digits)

    # ラベル付きの金額が見つからない場合、円/¥表記の数値のうち最大のものを合計額とみなす
    candidates: list[int] = []
    for match in _AMOUNT_FALLBACK_PATTERN.finditer(text):
        raw = (match.group(1) or match.group(2) or "").replace(",", "")
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


def _parse_store_name(text: str) -> str | None:
    for line in text.splitlines():
        stripped = line.strip()
        if len(stripped) < 2:
            continue
        if _NON_STORE_NAME_LINE.match(stripped):
            continue
        return stripped
    return None


def parse_receipt_text(text: str) -> ParsedReceipt:
    return ParsedReceipt(
        store_name=_parse_store_name(text),
        date=_parse_date(text),
        amount=_parse_amount(text),
    )
