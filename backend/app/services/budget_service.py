from app.models.budget import Budget
from app.repositories.budget_repository import BudgetRepository


class BudgetService:
    """業務ロジック層。API 層は Repository を直接触らず、必ずここを経由する。"""

    def __init__(self, repository: BudgetRepository) -> None:
        self.repository = repository

    def list_budgets(self) -> list[Budget]:
        return self.repository.list_all()

    def set_budget(self, category: str, amount: int) -> Budget:
        return self.repository.upsert(category, amount)
