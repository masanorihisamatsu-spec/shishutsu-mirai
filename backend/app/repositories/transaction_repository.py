from datetime import date

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.transaction import Transaction
from app.schemas.transaction import TransactionCreate, TransactionUpdate


class TransactionRepository:
    """Transaction テーブルへの直接アクセスのみを担当する層。業務ルールは持たない。"""

    def __init__(self, db: Session) -> None:
        self.db = db

    def list_all(self) -> list[Transaction]:
        statement = select(Transaction).order_by(Transaction.date.desc(), Transaction.id.desc())
        return list(self.db.scalars(statement).all())

    def exists_duplicate(self, transaction_date: date, store_name: str, amount: int) -> bool:
        """日付・店舗名・金額が完全一致する取引が既に存在するかどうか（取込機能の重複判定に使用）。"""
        statement = (
            select(Transaction.id)
            .where(
                Transaction.date == transaction_date,
                Transaction.store_name == store_name,
                Transaction.amount == amount,
            )
            .limit(1)
        )
        return self.db.scalar(statement) is not None

    def get(self, transaction_id: int) -> Transaction | None:
        return self.db.get(Transaction, transaction_id)

    def create(self, data: TransactionCreate) -> Transaction:
        transaction = Transaction(**data.model_dump())
        self.db.add(transaction)
        self.db.commit()
        self.db.refresh(transaction)
        return transaction

    def update(self, transaction: Transaction, data: TransactionUpdate) -> Transaction:
        for field, value in data.model_dump().items():
            setattr(transaction, field, value)
        self.db.commit()
        self.db.refresh(transaction)
        return transaction

    def delete(self, transaction: Transaction) -> None:
        self.db.delete(transaction)
        self.db.commit()
