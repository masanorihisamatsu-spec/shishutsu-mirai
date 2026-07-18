"""
PayPay の取引履歴CSVを解析する。

想定ヘッダー: 利用日,利用店舗,利用金額,取引区分
「取引区分」が「支払い」の行のみを支出として取り込む（チャージ・送金・受取・返金は対象外）。

注意: PayPay の実際のエクスポート形式は変更される可能性がある。
実データに合わせてヘッダー名や列の対応関係を調整すること。
"""

import csv
import io
from datetime import date, datetime

from app.services.imports.base import ParsedTransaction, ParseResult, decode_csv_bytes

REQUIRED_HEADERS = {"利用日", "利用店舗", "利用金額", "取引区分"}
EXPENSE_TRANSACTION_TYPE = "支払い"


def can_parse(header: list[str]) -> bool:
    return REQUIRED_HEADERS.issubset(set(header))


def parse(content: bytes) -> ParseResult:
    text = decode_csv_bytes(content)
    reader = csv.DictReader(io.StringIO(text))

    transactions: list[ParsedTransaction] = []
    errors: list[str] = []

    for index, row in enumerate(reader, start=2):  # 1行目はヘッダーのため2行目から
        if row.get("取引区分") != EXPENSE_TRANSACTION_TYPE:
            continue
        try:
            transactions.append(
                ParsedTransaction(
                    date=_parse_date(row["利用日"]),
                    store_name=row["利用店舗"].strip(),
                    amount=_parse_amount(row["利用金額"]),
                    category="その他",
                    payment_method="PayPay",
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
