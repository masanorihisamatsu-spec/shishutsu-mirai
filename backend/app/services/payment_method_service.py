from app.models.payment_method import PaymentMethod
from app.repositories.payment_method_repository import PaymentMethodRepository


class PaymentMethodNotFoundError(Exception):
    """指定した支払方法が存在しない場合に送出する。HTTPへの変換は API 層の責務。"""

    def __init__(self, payment_method_id: int) -> None:
        self.payment_method_id = payment_method_id
        super().__init__(f"PaymentMethod {payment_method_id} not found")


class PaymentMethodDuplicateNameError(Exception):
    """同名の支払方法が既に存在する場合に送出する。"""

    def __init__(self, name: str) -> None:
        self.name = name
        super().__init__(f"PaymentMethod '{name}' already exists")


class PaymentMethodService:
    """業務ロジック層。API 層は Repository を直接触らず、必ずここを経由する。"""

    def __init__(self, repository: PaymentMethodRepository) -> None:
        self.repository = repository

    def list_payment_methods(self) -> list[PaymentMethod]:
        return self.repository.list_all()

    def create_payment_method(self, name: str) -> PaymentMethod:
        if self.repository.exists_by_name(name):
            raise PaymentMethodDuplicateNameError(name)
        return self.repository.create(name)

    def update_payment_method(self, payment_method_id: int, name: str) -> PaymentMethod:
        payment_method = self._get_or_raise(payment_method_id)
        if self.repository.exists_by_name(name, exclude_id=payment_method_id):
            raise PaymentMethodDuplicateNameError(name)
        return self.repository.update(payment_method, name)

    def delete_payment_method(self, payment_method_id: int) -> None:
        payment_method = self._get_or_raise(payment_method_id)
        self.repository.delete(payment_method)

    def _get_or_raise(self, payment_method_id: int) -> PaymentMethod:
        payment_method = self.repository.get(payment_method_id)
        if payment_method is None:
            raise PaymentMethodNotFoundError(payment_method_id)
        return payment_method
