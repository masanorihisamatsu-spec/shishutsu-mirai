from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.db.deps import get_db
from app.models.category import Category
from app.repositories.category_repository import CategoryRepository
from app.schemas.category import CategoryRead, CategoryUpsert
from app.services.category_service import (
    CategoryDuplicateNameError,
    CategoryNotFoundError,
    CategoryService,
)

router = APIRouter(prefix="/categories", tags=["categories"])


def get_category_service(db: Session = Depends(get_db)) -> CategoryService:
    return CategoryService(CategoryRepository(db))


@router.get("", response_model=list[CategoryRead])
def list_categories(
    service: CategoryService = Depends(get_category_service),
) -> list[Category]:
    return service.list_categories()


@router.post("", response_model=CategoryRead, status_code=status.HTTP_201_CREATED)
def create_category(
    payload: CategoryUpsert,
    service: CategoryService = Depends(get_category_service),
) -> Category:
    try:
        return service.create_category(payload.name)
    except CategoryDuplicateNameError as exc:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail=str(exc)) from exc


@router.put("/{category_id}", response_model=CategoryRead)
def update_category(
    category_id: int,
    payload: CategoryUpsert,
    service: CategoryService = Depends(get_category_service),
) -> Category:
    try:
        return service.update_category(category_id, payload.name)
    except CategoryNotFoundError as exc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(exc)) from exc
    except CategoryDuplicateNameError as exc:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail=str(exc)) from exc


@router.delete("/{category_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_category(
    category_id: int,
    service: CategoryService = Depends(get_category_service),
) -> None:
    try:
        service.delete_category(category_id)
    except CategoryNotFoundError as exc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(exc)) from exc
