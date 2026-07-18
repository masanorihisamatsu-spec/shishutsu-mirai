"""
各Parser（paypay_csv / rakuten_csv / jcb_csv / paypay_pdf / excel）が
共通で使う型とユーティリティ。
"""

from dataclasses import dataclass, field
from datetime import date


@dataclass
class ParsedTransaction:
    """ファイルから読み取った1件の取引。TransactionCreate に変換される前の中間表現。"""

    date: date
    store_name: str
    amount: int
    category: str
    payment_method: str
    memo: str | None = None


@dataclass
class ParseResult:
    transactions: list[ParsedTransaction] = field(default_factory=list)
    # 行番号+理由 の形式の人が読めるメッセージ（パースできなかった行など）
    errors: list[str] = field(default_factory=list)


def decode_csv_bytes(content: bytes) -> str:
    """
    日本の金融系サービスのCSVは Shift-JIS（CP932）で出力されることが多いため、
    UTF-8 → CP932 の順に試す。
    """
    for encoding in ("utf-8-sig", "utf-8", "cp932"):
        try:
            return content.decode(encoding)
        except UnicodeDecodeError:
            continue
    raise ValueError("CSVの文字コードを判定できませんでした")
