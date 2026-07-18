from datetime import date, datetime

from sqlalchemy import Date, DateTime, String, func
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base


class Transaction(Base):
    __tablename__ = "transactions"

    id: Mapped[int] = mapped_column(primary_key=True)
    date: Mapped[date] = mapped_column(Date, index=True)
    store_name: Mapped[str] = mapped_column(String(255))
    amount: Mapped[int]
    category: Mapped[str] = mapped_column(String(50), index=True)
    payment_method: Mapped[str] = mapped_column(String(50))
    memo: Mapped[str | None] = mapped_column(String(1000), default=None)
    receipt_image: Mapped[str | None] = mapped_column(String(500), default=None)
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(
        DateTime, server_default=func.now(), onupdate=func.now()
    )
