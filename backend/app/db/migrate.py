from pathlib import Path

from alembic import command
from alembic.config import Config

# backend/app/db/migrate.py -> backend/alembic.ini
_ALEMBIC_INI_PATH = Path(__file__).resolve().parent.parent.parent / "alembic.ini"


def run_migrations() -> None:
    """
    未適用のAlembicマイグレーションを全て適用する（`alembic upgrade head` 相当）。

    Render等、デプロイ時に対話的にコマンドを実行できない環境でもテーブルが
    自動作成されるよう、アプリ起動時（lifespan）から呼び出す想定。
    既に最新状態なら何もしないため、ローカル/Docker Compose で都度呼んでも副作用はない。
    """
    alembic_cfg = Config(str(_ALEMBIC_INI_PATH))
    command.upgrade(alembic_cfg, "head")
