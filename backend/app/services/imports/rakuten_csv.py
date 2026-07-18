"""
楽天カードの利用明細CSVを解析する。

想定ヘッダー: 利用日,利用店名,利用者,支払方法,利用金額

注意: 楽天カードの実際のエクスポート形式は変更される可能性がある。
実データに合わせてヘッダー名や列の対応関係を調整すること。
"""

import csv
import io
from datetime import date, datetime

from app.services.imports.base import ParsedTransaction, ParseResult, decode_csv_bytes

REQUIRED_HEADERS = {"利用日", "利用店名", "利用者", "支払方法", "利用金額"}


def can_parse(header: list[str]) -> bool:
    return REQUIRED_HEADERS.issubset(set(header))


def parse(content: bytes) -> ParseResult:
    text = decode_csv_bytes(content)
    reader = csv.DictReader(io.StringIO(text))

    transactions: list[ParsedTransaction] = []
    errors: list[str] = []

    for index, row in enumerate(reader, start=2):
        try:
            transactions.append(
                ParsedTransaction(
                    date=_parse_date(row["利用日"]),
                    store_name=row["利用店名"].strip(),
                    amount=_parse_amount(row["利用金額"]),
                    category="その他",
                    payment_method="楽天カード",
                )
            )
        except (KeyError, ValueError) as exc:
            errors.append(f"{index}行目: {exc}")

    return ParseResult(transactions=transactions, errors=errors)


def _parse_date(raw: str) -> date:
    normalized = raw.strip().replace("/", "-")
    return datetime.strptime(normalized, "%Y-%m-%d").date()


def _parse_amount(raw: str) -> int:
    digits = raw.strip().replace(",", "").replace("円", "")
    return int(digits)
