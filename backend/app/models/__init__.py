# 新しいモデルはここでインポートし、
# Alembic の autogenerate が Base.metadata 経由で検出できるようにする。
from app.models.budget import Budget  # noqa: F401
from app.models.transaction import Transaction  # noqa: F401
