"""
汎用CSVを解析する。

想定ヘッダー: 日付,店舗,金額

PayPay・楽天カード・JCBのいずれの形式にも一致しない、一般的な3列CSVを
取り込むための受け皿。カテゴリ・支払方法の情報を持たないため、
どちらも「その他」として登録する。
"""

import csv
import io
from datetime import date, datetime

from app.services.imports.base import ParsedTransaction, ParseResult, decode_csv_bytes

REQUIRED_HEADERS = {"日付", "店舗", "金額"}
DEFAULT_CATEGORY = "その他"
DEFAULT_PAYMENT_METHOD = "その他"


def can_parse(header: list[str]) -> bool:
    return REQUIRED_HEADERS.issubset(set(header))


def parse(content: bytes) -> ParseResult:
    text = decode_csv_bytes(content)
    reader = csv.DictReader(io.StringIO(text))

    transactions: list[ParsedTransaction] = []
    errors: list[str] = []

    for index, row in enumerate(reader, start=2):  # 1行目はヘッダーのため2行目から
        try:
            transactions.append(
                ParsedTransaction(
                    date=_parse_date(row["日付"]),
                    store_name=row["店舗"].strip(),
                    amount=_parse_amount(row["金額"]),
                    category=DEFAULT_CATEGORY,
                    payment_method=DEFAULT_PAYMENT_METHOD,
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
