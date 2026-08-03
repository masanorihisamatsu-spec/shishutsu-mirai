from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field


class BudgetUpsert(BaseModel):
    amount: int = Field(..., gt=0)


class BudgetRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    category: str
    amount: int
    created_at: datetime
    updated_at: datetime
