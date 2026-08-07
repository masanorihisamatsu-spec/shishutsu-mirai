from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    app_name: str = "支出管理みらい API"
    database_url: str = "sqlite:///./database/app.db"
    cors_origins: list[str] = [
        "http://localhost:3000",
        "https://shishutsu-mirai-frontend.onrender.com",
        "https://shishutsu-mirai-frontend-prod.onrender.com",
    ]
    # レシート画像の保存先（backend/ からの相対パス）。DB の receipt_image には同じ形式の相対パスを保存する。
    uploads_dir: str = "uploads/receipts"

    # OCR（Tesseract）の認識言語・ページ分割モード。コード変更なしに比較検証できるよう環境変数化している。
    # 詳細は backend/app/services/ocr/engine.py、比較用ツールは backend/scripts/ocr_compare.py を参照。
    ocr_lang: str = "jpn"
    ocr_psm: int = 6
    # Trueにすると、前処理後（OCR直前）の画像を receipt_image と同じディレクトリに
    # `_preprocessed` 付きで保存し、生のOCRテキストをINFOログにも出力する（本番デフォルトはFalse）。
    ocr_debug_save_preprocessed: bool = False


settings = Settings()
