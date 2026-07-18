from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    app_name: str = "支出管理みらい API"
    database_url: str = "sqlite:///./database/app.db"
    cors_origins: list[str] = ["http://localhost:3000"]
    # レシート画像の保存先（backend/ からの相対パス）。DB の receipt_image には同じ形式の相対パスを保存する。
    uploads_dir: str = "uploads/receipts"


settings = Settings()
