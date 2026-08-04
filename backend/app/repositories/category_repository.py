from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.category import Category


class CategoryRepository:
    """Category テーブルへの直接アクセスのみを担当する層。業務ルールは持たない。"""

    def __init__(self, db: Session) -> None:
        self.db = db

    def list_all(self) -> list[Category]:
        statement = select(Category).order_by(Category.id)
        return list(self.db.scalars(statement).all())

    def get(self, category_id: int) -> Category | None:
        return self.db.get(Category, category_id)

    def exists_by_name(self, name: str, exclude_id: int | None = None) -> bool:
        statement = select(Category.id).where(Category.name == name)
        if exclude_id is not None:
            statement = statement.where(Category.id != exclude_id)
        return self.db.scalar(statement.limit(1)) is not None

    def create(self, name: str) -> Category:
        category = Category(name=name)
        self.db.add(category)
        self.db.commit()
        self.db.refresh(category)
        return category

    def update(self, category: Category, name: str) -> Category:
        category.name = name
        self.db.commit()
        self.db.refresh(category)
        return category

    def delete(self, category: Category) -> None:
        self.db.delete(category)
        self.db.commit()
