FROM python:3.12-slim

WORKDIR /app

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1

# OCR（テキスト抽出）に使う Tesseract 本体と日本語データ。pytesseract は CLI ラッパーのため別途必要。
RUN apt-get update && apt-get install -y --no-install-recommends \
    tesseract-ocr \
    tesseract-ocr-jpn \
    && rm -rf /var/lib/apt/lists/*

# Renderのダッシュボード上のDocker設定はビルドコンテキストをリポジトリルートとして扱うため、
# COPY元はリポジトリルート基準の backend/ 配下として明示する（docker-compose.yml側もこれに合わせている）。
COPY backend/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY backend/ .

EXPOSE 8000

# Render等、PORT環境変数でリッスンポートを指定するプラットフォーム向けに対応しつつ、
# ローカル（docker-compose、PORT未設定）では従来通り8000で待ち受ける。
CMD ["sh", "-c", "exec uvicorn app.main:app --host 0.0.0.0 --port ${PORT:-8000} --reload"]
