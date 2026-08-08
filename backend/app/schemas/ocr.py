from datetime import date as date_type

from pydantic import BaseModel, Field


class OcrReceiptResult(BaseModel):
    store_name: str | None = Field(default=None, description="OCRで認識した店舗名")
    # フィールド名を型名と同じ "date" にすると、Pydantic の型解決時に
    # このフィールド自身（FieldInfo）と型名 date が衝突するため、型は date_type としてimportする。
    date: date_type | None = Field(default=None, description="OCRで認識した日付")
    amount: int | None = Field(default=None, description="OCRで認識した金額")
    payment_method: str | None = Field(default=None, description="OCRで認識した支払方法")
    receipt_image: str = Field(description="保存されたレシート画像の相対パス")
    raw_text: str = Field(description="OCRで抽出した生テキスト（デバッグ・手動確認用）")
