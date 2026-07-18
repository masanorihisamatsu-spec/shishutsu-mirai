"""
PayPay の利用明細PDF（テキストベースの取引一覧）を解析する。

想定される行フォーマット: "YYYY/M/D 店舗名 金額円"
（例: "2026/07/01 セブンイレブン渋谷店 650円"）

注意: PDFのレイアウトはツールやバージョンによって崩れやすい。
実データに合わせて正規表現を調整すること。
"""

import re
from datetime import date
from io import BytesIO

from pypdf import PdfReader

from app.services.imports.base import ParsedTransaction, ParseResult

LINE_PATTERN = re.compile(r"(\d{4}/\d{1,2}/\d{1,2})\s+(.+?)\s+([\d,]+)\s*円")


def parse(content: bytes) -> ParseResult:
    try:
        reader = PdfReader(BytesIO(content))
    except Exception as exc:  # noqa: BLE001 - 壊れたPDF等を一律ドメイン例外相当として扱う
        return ParseResult(transactions=[], errors=[f"PDFを読み込めませんでした: {exc}"])

    transactions: list[ParsedTransaction] = []
    errors: list[str] = []

    line_number = 0
    for page in reader.pages:
        text = page.extract_text() or ""
        for line in text.splitlines():
            line_number += 1
            match = LINE_PATTERN.search(line)
            if not match:
                continue
            try:
                transactions.append(
                    ParsedTransaction(
                        date=_parse_date(match.group(1)),
                        store_name=match.group(2).strip(),
                        amount=int(match.group(3).replace(",", "")),
                        category="その他",
                        payment_method="PayPay",
                    )
                )
            except ValueError as exc:
                errors.append(f"{line_number}行目: {exc}")

    if not transactions and not errors:
        errors.append("取引明細を検出できませんでした")

    return ParseResult(transactions=transactions, errors=errors)


def _parse_date(raw: str) -> date:
    year, month, day = (int(part) for part in raw.split("/"))
    return date(year, month, day)
