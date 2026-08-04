from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.payment_method import PaymentMethod


class PaymentMethodRepository:
    """PaymentMethod テーブルへの直接アクセスのみを担当する層。業務ルールは持たない。"""

    def __init__(self, db: Session) -> None:
        self.db = db

    def list_all(self) -> list[PaymentMethod]:
        statement = select(PaymentMethod).order_by(PaymentMethod.id)
        return list(self.db.scalars(statement).all())

    def get(self, payment_method_id: int) -> PaymentMethod | None:
        return self.db.get(PaymentMethod, payment_method_id)

    def exists_by_name(self, name: str, exclude_id: int | None = None) -> bool:
        statement = select(PaymentMethod.id).where(PaymentMethod.name == name)
        if exclude_id is not None:
            statement = statement.where(PaymentMethod.id != exclude_id)
        return self.db.scalar(statement.limit(1)) is not None

    def create(self, name: str) -> PaymentMethod:
        payment_method = PaymentMethod(name=name)
        self.db.add(payment_method)
        self.db.commit()
        self.db.refresh(payment_method)
        return payment_method

    def update(self, payment_method: PaymentMethod, name: str) -> PaymentMethod:
        payment_method.name = name
        self.db.commit()
        self.db.refresh(payment_method)
        return payment_method

    def delete(self, payment_method: PaymentMethod) -> None:
        self.db.delete(payment_method)
        self.db.commit()
