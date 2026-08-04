from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import text

from app.api.routes.budgets import router as budgets_router
from app.api.routes.categories import router as categories_router
from app.api.routes.imports import router as imports_router
from app.api.routes.ocr import router as ocr_router
from app.api.routes.payment_methods import router as payment_methods_router
from app.api.routes.transactions import router as transactions_router
from app.core.config import settings
from app.db.migrate import run_migrations
from app.db.session import engine


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Render等、対話的にマイグレーションコマンドを実行できない環境でも
    # テーブルが自動作成されるよう、起動時に alembic upgrade head 相当を実行する。
    run_migrations()
    with engine.connect() as connection:
        connection.execute(text("SELECT 1"))
    yield


app = FastAPI(title=settings.app_name, lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(transactions_router)
app.include_router(budgets_router)
app.include_router(categories_router)
app.include_router(payment_methods_router)
app.include_router(ocr_router)
app.include_router(imports_router)
