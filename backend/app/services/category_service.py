from app.models.category import Category
from app.repositories.category_repository import CategoryRepository


class CategoryNotFoundError(Exception):
    """指定したカテゴリが存在しない場合に送出する。HTTPへの変換は API 層の責務。"""

    def __init__(self, category_id: int) -> None:
        self.category_id = category_id
        super().__init__(f"Category {category_id} not found")


class CategoryDuplicateNameError(Exception):
    """同名のカテゴリが既に存在する場合に送出する。"""

    def __init__(self, name: str) -> None:
        self.name = name
        super().__init__(f"Category '{name}' already exists")


class CategoryService:
    """業務ロジック層。API 層は Repository を直接触らず、必ずここを経由する。"""

    def __init__(self, repository: CategoryRepository) -> None:
        self.repository = repository

    def list_categories(self) -> list[Category]:
        return self.repository.list_all()

    def create_category(self, name: str) -> Category:
        if self.repository.exists_by_name(name):
            raise CategoryDuplicateNameError(name)
        return self.repository.create(name)

    def update_category(self, category_id: int, name: str) -> Category:
        category = self._get_or_raise(category_id)
        if self.repository.exists_by_name(name, exclude_id=category_id):
            raise CategoryDuplicateNameError(name)
        return self.repository.update(category, name)

    def delete_category(self, category_id: int) -> None:
        category = self._get_or_raise(category_id)
        self.repository.delete(category)

    def _get_or_raise(self, category_id: int) -> Category:
        category = self.repository.get(category_id)
        if category is None:
            raise CategoryNotFoundError(category_id)
        return category
