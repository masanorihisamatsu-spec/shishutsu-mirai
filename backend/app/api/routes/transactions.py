from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.db.deps import get_db
from app.models.transaction import Transaction
from app.repositories.transaction_repository import TransactionRepository
from app.schemas.transaction import TransactionCreate, TransactionRead, TransactionUpdate
from app.services.transaction_service import TransactionNotFoundError, TransactionService

router = APIRouter(prefix="/transactions", tags=["transactions"])


def get_transaction_service(db: Session = Depends(get_db)) -> TransactionService:
    return TransactionService(TransactionRepository(db))


@router.post("", response_model=TransactionRead, status_code=status.HTTP_201_CREATED)
def create_transaction(
    payload: TransactionCreate,
    service: TransactionService = Depends(get_transaction_service),
) -> Transaction:
    return service.create_transaction(payload)


@router.get("", response_model=list[TransactionRead])
def list_transactions(
    service: TransactionService = Depends(get_transaction_service),
) -> list[Transaction]:
    return service.list_transactions()


@router.get("/{transaction_id}", response_model=TransactionRead)
def get_transaction(
    transaction_id: int,
    service: TransactionService = Depends(get_transaction_service),
) -> Transaction:
    try:
        return service.get_transaction(transaction_id)
    except TransactionNotFoundError as exc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(exc)) from exc


@router.put("/{transaction_id}", response_model=TransactionRead)
def update_transaction(
    transaction_id: int,
    payload: TransactionUpdate,
    service: TransactionService = Depends(get_transaction_service),
) -> Transaction:
    try:
        return service.update_transaction(transaction_id, payload)
    except TransactionNotFoundError as exc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(exc)) from exc


@router.delete("/{transaction_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_transaction(
    transaction_id: int,
    service: TransactionService = Depends(get_transaction_service),
) -> None:
    try:
        service.delete_transaction(transaction_id)
    except TransactionNotFoundError as exc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(exc)) from exc
