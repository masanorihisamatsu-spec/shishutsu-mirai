# 新しいモデルはここでインポートし、
# Alembic の autogenerate が Base.metadata 経由で検出できるようにする。
from app.models.budget import Budget  # noqa: F401
from app.models.category import Category  # noqa: F401
from app.models.payment_method import PaymentMethod  # noqa: F401
from app.models.transaction import Transaction  # noqa: F401
