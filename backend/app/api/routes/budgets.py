from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.db.deps import get_db
from app.models.budget import Budget
from app.repositories.budget_repository import BudgetRepository
from app.schemas.budget import BudgetRead, BudgetUpsert
from app.services.budget_service import BudgetService

router = APIRouter(prefix="/budgets", tags=["budgets"])


def get_budget_service(db: Session = Depends(get_db)) -> BudgetService:
    return BudgetService(BudgetRepository(db))


@router.get("", response_model=list[BudgetRead])
def list_budgets(
    service: BudgetService = Depends(get_budget_service),
) -> list[Budget]:
    return service.list_budgets()


@router.put("/{category}", response_model=BudgetRead)
def set_budget(
    category: str,
    payload: BudgetUpsert,
    service: BudgetService = Depends(get_budget_service),
) -> Budget:
    return service.set_budget(category, payload.amount)
