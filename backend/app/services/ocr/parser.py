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
from collections import Counter
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
# これらは _is_store_name_candidate 内で「空白を除去した行（core）」に対して適用する。
# Tesseractは「領 収 書」のように全角文字の間に空白を誤って挿入することがあり、
# 元の行（空白入り）のままだと文字列が分断されて除外パターンにマッチしなくなるため。
_STORE_NAME_EXCLUDE_PATTERNS = [
    re.compile(r"^[\d\-:./TEL#*＊№No.]*$", re.IGNORECASE),  # 数字・記号のみの行
    re.compile(r"\d{2,4}[年/\-.]\d{1,2}[月/\-.]\d{1,2}"),  # 日付
    re.compile(r"\d{1,2}:\d{2}(:\d{2})?"),  # 時刻
    re.compile(r"合計|小計|総額|お会計|ご利用金額|お支払|お預かり|お釣り|税込|税抜|消費税|料金|お買上"),  # 金額系ラベル
    re.compile(r"[¥￥]|円$"),  # 金額表記そのもの
    re.compile(r"TEL|電話|FAX", re.IGNORECASE),  # 電話番号系
    re.compile(r"〒|(都|道|府|県)?[^\s]{2,6}(市|区|郡)[^\s]{0,10}(市|区|町|村)?"),  # 郵便番号・住所表記
    # 帳票タイトル（店舗名ではなく「これは領収書です」という書類種別を表すだけの語）
    re.compile(r"領収書|領収証|レシート|RECEIPT|明細書|明細|ありがとうございました|またお越しください", re.IGNORECASE),
]

# 店舗名として想定される文字種（ひらがな・カタカナ・漢字・英数字・記号少々）。
# これ以外の文字（Tesseractがノイズを無理やり別の記号にしてしまった場合等）が
# 多く混ざる行は店舗名候補から除外する。
_UNEXPECTED_STORE_NAME_CHAR = re.compile(
    r"[^぀-ゟ゠-ヿ一-鿿ｦ-ﾟ0-9A-Za-z()（）・.,&/\- ]"
)
# 「実際に意味を持つ文字」（ひらがな・カタカナ・漢字・英数字）のみにマッチする。
# 記号ばかりで構成される行（低画質時にTesseractが記号の羅列を返すケース）を
# _UNEXPECTED_STORE_NAME_CHAR だけでは検出しきれないため、こちらも別途チェックする。
_STORE_NAME_LETTER_CHAR = re.compile(r"[぀-ゟ゠-ヿ一-鿿ｦ-ﾟ0-9A-Za-z]")
# 数字を除いた「文字」。登録番号（T+数字等）にノイズの記号が混ざった行が
# 上の2つのチェックをすり抜けることがあるため、店舗名には数字以外の文字が
# 一定数含まれることを別途要求する（実在の店舗名は数字の羅列だけにはならない）。
_STORE_NAME_NON_DIGIT_LETTER = re.compile(r"[぀-ゟ゠-ヿ一-鿿ｦ-ﾟA-Za-z]")
# 店名（チェーン名等）はカタカナを含む固有名詞であることが多いため、
# 複数の候補行がある場合はカタカナを含む行を優先する。
_KATAKANA_CHAR = re.compile(r"[゠-ヿｦ-ﾟ]")
# レシート上部だけを見れば十分なため、候補として集める行数の上限。
_STORE_NAME_CANDIDATE_SCAN_LIMIT = 8
# カタカナ優先を適用するのは上位の候補に限る（離れた場所にある無関係な行が
# たまたまカタカナを含んでいた場合に、正しい先頭候補を上書きしないようにするため）。
_STORE_NAME_KATAKANA_PREFERENCE_WINDOW = 3


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


def _is_garbage_line(line: str) -> bool:
    """
    低解像度・ノイズの多い画像に対してTesseractがそれらしい文字（特にひらがな）を
    強引に当てはめてしまう典型的な誤認識パターンを検出する。
    実例:「ももそよすそそすするるるるるをすするすすするすもるするする1」のように、
    少数の文字が高頻度で繰り返される。
    """
    core = re.sub(r"\s", "", line)
    if len(core) < 6:
        return False

    most_common_count = Counter(core).most_common(1)[0][1]
    if most_common_count / len(core) > 0.35:
        return True

    if len(set(core)) / len(core) < 0.35:
        return True

    return False


def _is_store_name_candidate(line: str) -> bool:
    if len(line) < 2:
        return False

    core = re.sub(r"\s", "", line)
    if not core:
        return False

    if any(pattern.search(core) for pattern in _STORE_NAME_EXCLUDE_PATTERNS):
        return False

    unexpected_chars = _UNEXPECTED_STORE_NAME_CHAR.findall(core)
    if len(unexpected_chars) / len(core) > 0.2:
        return False

    # 記号ばかりで「意味のある文字」がほとんど無い行（低画質時にTesseractが
    # 記号の羅列を返すケース）を除外する。
    letter_chars = _STORE_NAME_LETTER_CHAR.findall(core)
    if len(letter_chars) / len(core) < 0.7:
        return False

    # 数字（登録番号等）にノイズの記号が混ざっただけの行を除外する。
    if len(_STORE_NAME_NON_DIGIT_LETTER.findall(core)) < 2:
        return False

    return not _is_garbage_line(line)


def find_store_name_candidate(text: str) -> str | None:
    """
    テキストから店舗名候補を選ぶ。
    レシート全文からのフォールバック抽出（parse_receipt_text）だけでなく、
    店舗名領域だけを切り出した専用OCR（store_name.py）からも共通で使う。

    優先順位:
      1. レシート上部（先頭）に近い行を優先する（先頭からスキャンし、一定数見つかった時点で打ち切る）
      2. その中でカタカナを含む行があれば優先する（店名はカタカナを含む固有名詞であることが多いため）
      3. 住所・電話番号・帳票タイトル（「領収書」等）・金額行は _is_store_name_candidate 側で除外済み
    """
    candidates: list[str] = []
    for line in text.splitlines():
        stripped = line.strip()
        if _is_store_name_candidate(stripped):
            candidates.append(stripped)
            if len(candidates) >= _STORE_NAME_CANDIDATE_SCAN_LIMIT:
                break

    if not candidates:
        return None

    for candidate in candidates[:_STORE_NAME_KATAKANA_PREFERENCE_WINDOW]:
        if _KATAKANA_CHAR.search(candidate):
            return candidate

    return candidates[0]


def parse_receipt_text(text: str) -> ParsedReceipt:
    return ParsedReceipt(
        store_name=find_store_name_candidate(text),
        date=_parse_date(text),
        amount=_parse_amount(text),
    )
