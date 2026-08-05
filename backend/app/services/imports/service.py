"""
アップロードされたファイルを判定し、対応するParserでTransactionへ変換してDBへ登録する。
"""

import csv
import io
from dataclasses import dataclass, field

from pydantic import ValidationError

from app.repositories.transaction_repository import TransactionRepository
from app.schemas.transaction import TransactionCreate
from app.services.imports import excel, generic_csv, jcb_csv, paypay_csv, paypay_pdf, rakuten_csv
from app.services.imports.base import ParseResult, decode_csv_bytes

CSV_DETECTORS = (
    ("jcb_csv", jcb_csv.can_parse),
    ("rakuten_csv", rakuten_csv.can_parse),
    ("paypay_csv", paypay_csv.can_parse),
    # 汎用CSVは他形式に一致しない場合の最後の受け皿として最後に判定する
    ("generic_csv", generic_csv.can_parse),
)

PARSERS = {
    "paypay_csv": paypay_csv.parse,
    "rakuten_csv": rakuten_csv.parse,
    "jcb_csv": jcb_csv.parse,
    "generic_csv": generic_csv.parse,
    "paypay_pdf": paypay_pdf.parse,
    "excel": excel.parse,
}


class UnsupportedFileFormatError(Exception):
    """アップロードされたファイルの形式を判定できなかった場合に送出する。HTTPへの変換はAPI層の責務。"""


@dataclass
class ImportResult:
    source_format: str
    registered_count: int = 0
    duplicate_count: int = 0
    error_count: int = 0
    errors: list[str] = field(default_factory=list)


class ImportService:
    def __init__(self, repository: TransactionRepository) -> None:
        self.repository = repository

    def import_file(self, filename: str, content: bytes) -> ImportResult:
        source_format = self._detect_format(filename, content)
        parse_result: ParseResult = PARSERS[source_format](content)

        registered = 0
        duplicates = 0
        errors = list(parse_result.errors)
        seen_in_batch: set[tuple[str, str, int]] = set()

        for parsed in parse_result.transactions:
            key = (parsed.date.isoformat(), parsed.store_name, parsed.amount)
            if key in seen_in_batch or self.repository.exists_duplicate(
                parsed.date, parsed.store_name, parsed.amount
            ):
                duplicates += 1
                continue

            try:
                payload = TransactionCreate(
                    date=parsed.date,
                    store_name=parsed.store_name,
                    amount=parsed.amount,
                    category=parsed.category,
                    payment_method=parsed.payment_method,
                    memo=parsed.memo,
                    receipt_image=None,
                )
            except ValidationError as exc:
                errors.append(f"{parsed.store_name}: {exc.errors()[0]['msg']}")
                continue

            self.repository.create(payload)
            seen_in_batch.add(key)
            registered += 1

        return ImportResult(
            source_format=source_format,
            registered_count=registered,
            duplicate_count=duplicates,
            error_count=len(errors),
            errors=errors,
        )

    def _detect_format(self, filename: str, content: bytes) -> str:
        lower = filename.lower()

        if lower.endswith(".pdf"):
            return "paypay_pdf"
        if lower.endswith((".xlsx", ".xlsm")):
            return "excel"
        if lower.endswith(".csv"):
            return self._detect_csv_format(content)

        raise UnsupportedFileFormatError(
            "対応していないファイル形式です（CSV / PDF / Excelのみ対応しています）"
        )

    def _detect_csv_format(self, content: bytes) -> str:
        header = self._read_csv_header(content)
        for source_format, can_parse in CSV_DETECTORS:
            if can_parse(header):
                return source_format
        raise UnsupportedFileFormatError(
            "対応していないCSV形式です"
            "（PayPay / 楽天カード / JCB / 汎用CSV「日付,店舗,金額」のみ対応しています）"
        )

    def _read_csv_header(self, content: bytes) -> list[str]:
        text = decode_csv_bytes(content)
        lines = text.splitlines()
        if not lines:
            return []
        return next(csv.reader([lines[0]]))
