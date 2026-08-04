from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.db.deps import get_db
from app.models.payment_method import PaymentMethod
from app.repositories.payment_method_repository import PaymentMethodRepository
from app.schemas.payment_method import PaymentMethodRead, PaymentMethodUpsert
from app.services.payment_method_service import (
    PaymentMethodDuplicateNameError,
    PaymentMethodNotFoundError,
    PaymentMethodService,
)

router = APIRouter(prefix="/payment-methods", tags=["payment-methods"])


def get_payment_method_service(db: Session = Depends(get_db)) -> PaymentMethodService:
    return PaymentMethodService(PaymentMethodRepository(db))


@router.get("", response_model=list[PaymentMethodRead])
def list_payment_methods(
    service: PaymentMethodService = Depends(get_payment_method_service),
) -> list[PaymentMethod]:
    return service.list_payment_methods()


@router.post("", response_model=PaymentMethodRead, status_code=status.HTTP_201_CREATED)
def create_payment_method(
    payload: PaymentMethodUpsert,
    service: PaymentMethodService = Depends(get_payment_method_service),
) -> PaymentMethod:
    try:
        return service.create_payment_method(payload.name)
    except PaymentMethodDuplicateNameError as exc:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail=str(exc)) from exc


@router.put("/{payment_method_id}", response_model=PaymentMethodRead)
def update_payment_method(
    payment_method_id: int,
    payload: PaymentMethodUpsert,
    service: PaymentMethodService = Depends(get_payment_method_service),
) -> PaymentMethod:
    try:
        return service.update_payment_method(payment_method_id, payload.name)
    except PaymentMethodNotFoundError as exc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(exc)) from exc
    except PaymentMethodDuplicateNameError as exc:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail=str(exc)) from exc


@router.delete("/{payment_method_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_payment_method(
    payment_method_id: int,
    service: PaymentMethodService = Depends(get_payment_method_service),
) -> None:
    try:
        service.delete_payment_method(payment_method_id)
    except PaymentMethodNotFoundError as exc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(exc)) from exc
