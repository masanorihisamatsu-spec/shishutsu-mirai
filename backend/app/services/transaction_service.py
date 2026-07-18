from app.models.transaction import Transaction
from app.repositories.transaction_repository import TransactionRepository
from app.schemas.transaction import TransactionCreate, TransactionUpdate


class TransactionNotFoundError(Exception):
    """指定した取引が存在しない場合に送出する。HTTPへの変換は API 層の責務。"""

    def __init__(self, transaction_id: int) -> None:
        self.transaction_id = transaction_id
        super().__init__(f"Transaction {transaction_id} not found")


class TransactionService:
    """業務ロジック層。API 層は Repository を直接触らず、必ずここを経由する。"""

    def __init__(self, repository: TransactionRepository) -> None:
        self.repository = repository

    def list_transactions(self) -> list[Transaction]:
        return self.repository.list_all()

    def get_transaction(self, transaction_id: int) -> Transaction:
        transaction = self.repository.get(transaction_id)
        if transaction is None:
            raise TransactionNotFoundError(transaction_id)
        return transaction

    def create_transaction(self, data: TransactionCreate) -> Transaction:
        return self.repository.create(data)

    def update_transaction(self, transaction_id: int, data: TransactionUpdate) -> Transaction:
        transaction = self.get_transaction(transaction_id)
        return self.repository.update(transaction, data)

    def delete_transaction(self, transaction_id: int) -> None:
        transaction = self.get_transaction(transaction_id)
        self.repository.delete(transaction)
