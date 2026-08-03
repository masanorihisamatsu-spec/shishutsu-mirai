from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.budget import Budget


class BudgetRepository:
    """Budget テーブルへの直接アクセスのみを担当する層。業務ルールは持たない。"""

    def __init__(self, db: Session) -> None:
        self.db = db

    def list_all(self) -> list[Budget]:
        statement = select(Budget).order_by(Budget.category)
        return list(self.db.scalars(statement).all())

    def get_by_category(self, category: str) -> Budget | None:
        statement = select(Budget).where(Budget.category == category)
        return self.db.scalar(statement)

    def upsert(self, category: str, amount: int) -> Budget:
        budget = self.get_by_category(category)
        if budget is None:
            budget = Budget(category=category, amount=amount)
            self.db.add(budget)
        else:
            budget.amount = amount
        self.db.commit()
        self.db.refresh(budget)
        return budget
