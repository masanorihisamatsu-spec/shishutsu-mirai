from datetime import date, datetime

from pydantic import BaseModel, ConfigDict, Field


class TransactionBase(BaseModel):
    date: date
    store_name: str = Field(..., min_length=1, max_length=255)
    amount: int = Field(..., gt=0)
    category: str = Field(..., min_length=1, max_length=50)
    payment_method: str = Field(..., min_length=1, max_length=50)
    memo: str | None = Field(default=None, max_length=1000)
    # 画像本体ではなく保存先パスのみ（例: uploads/receipts/20260716_001.jpg）
    receipt_image: str | None = Field(default=None, max_length=500)


class TransactionCreate(TransactionBase):
    pass


class TransactionUpdate(TransactionBase):
    pass


class TransactionRead(TransactionBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    created_at: datetime
    updated_at: datetime
