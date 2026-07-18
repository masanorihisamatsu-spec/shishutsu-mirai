# docker

各サービスの Dockerfile を格納するディレクトリです。アプリケーションコード（`frontend/` `backend/`）とビルド定義を分離し、インフラの変更がアプリコードの差分に混ざらないようにしています。

- `frontend/Dockerfile` — Next.js 開発用コンテナ
- `backend/Dockerfile` — FastAPI 開発用コンテナ

ビルド設定はルートの [docker-compose.yml](../docker-compose.yml) から参照されます。
