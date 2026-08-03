from pathlib import Path

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from app.core.config import settings

is_sqlite = settings.database_url.startswith("sqlite")

if is_sqlite:
    # SQLite は接続先ファイルの親ディレクトリを自動作成しないため、事前に用意しておく。
    # ローカル/Docker Compose では database/ が既に存在するため実質何もしない（副作用なし）。
    # Render 等、ボリュームマウントに頼らない環境で "unable to open database file" を防ぐための対応。
    sqlite_path = settings.database_url.removeprefix("sqlite:///")
    if sqlite_path != ":memory:":
        Path(sqlite_path).parent.mkdir(parents=True, exist_ok=True)

connect_args = {"check_same_thread": False} if is_sqlite else {}

engine = create_engine(settings.database_url, connect_args=connect_args)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
