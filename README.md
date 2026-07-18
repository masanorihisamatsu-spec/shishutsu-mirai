# 支出管理みらい

AI支出管理アプリ「支出管理みらい」。本リポジトリは **Sprint 0（環境構築）** の成果物です。

Sprint 0 のスコープは環境構築のみです。画面・API・ダミーデータは含まれません。

## 技術構成

| 領域 | 技術 |
| --- | --- |
| Frontend | Next.js 15 (App Router) / TypeScript / Tailwind CSS / shadcn/ui / React Hook Form / Zod / TanStack Query / Recharts |
| Backend | FastAPI / SQLAlchemy / Alembic / Pydantic |
| Database | SQLite |
| Development | Docker / Docker Compose |
| Package Manager | pnpm |

## ディレクトリ構成

```
支出管理みらい/
├── frontend/   # Next.js アプリケーションコード
├── backend/    # FastAPI アプリケーションコード
├── database/   # SQLite の実データ（Git 管理外）
├── docs/       # 設計ドキュメント
├── docker/     # 各サービスの Dockerfile
├── docker-compose.yml
├── .env.example
├── .gitignore
└── CLAUDE.md
```

詳細な構成方針は [docs/architecture.md](./docs/architecture.md)、AI コーディングアシスタント向けの規約は [CLAUDE.md](./CLAUDE.md) を参照してください。

## セットアップ

前提: Docker Desktop（Docker Compose v2 / BuildKit 有効）がインストールされていること。

```bash
docker compose up
```

これだけで以下が起動します。

- Frontend: http://localhost:3000
- Backend: http://localhost:8000 （Swagger UI: http://localhost:8000/docs）

`.env` は必須ではありません。ポートや接続先を変更したい場合のみ、`.env.example` をコピーして `.env` を作成してください。

```bash
cp .env.example .env
```

## 起動確認方法

1. コンテナが起動していることを確認する

   ```bash
   docker compose ps
   ```

   `frontend` `backend` の 2 サービスが `running` になっていること。

2. Frontend の起動確認

   ブラウザで http://localhost:3000 を開き、`支出管理みらい — Sprint 0` の文字列が表示されることを確認する。

   ```bash
   curl -I http://localhost:3000
   ```

   `HTTP/1.1 200 OK` が返ればOK。

3. Backend の起動確認

   ブラウザで http://localhost:8000/docs を開き、Swagger UI が表示されることを確認する（Sprint 0 ではエンドポイント未実装のためスキーマは空）。

   ```bash
   curl -I http://localhost:8000/docs
   ```

4. SQLite 接続確認

   Backend はアプリ起動時（lifespan）に SQLite へ接続確認（`SELECT 1`）を行う。接続に失敗するとコンテナが起動しないため、`docker compose ps` で `backend` が起動していれば接続成功とみなせる。また初回起動後、以下のファイルが生成される。

   ```bash
   ls database/app.db
   ```

5. 終了

   ```bash
   docker compose down
   ```

## 環境変数

| 変数名 | 用途 | デフォルト |
| --- | --- | --- |
| `DATABASE_URL` | Backend が接続する SQLite の接続文字列 | `sqlite:///./database/app.db` |
| `BACKEND_PORT` | Backend の公開ポート | `8000` |
| `NEXT_PUBLIC_API_URL` | Frontend から見た Backend の URL | `http://localhost:8000` |
| `FRONTEND_PORT` | Frontend の公開ポート | `3000` |

## データベース / マイグレーション

SQLite のファイルは `database/` にマウントされます（詳細は [database/README.md](./database/README.md)）。マイグレーションは Alembic で管理します（`backend/alembic`）。モデル追加後は以下を実行してください。

```bash
docker compose exec backend alembic revision --autogenerate -m "message"
docker compose exec backend alembic upgrade head
```

## ローカル開発（Docker を使わない場合）

```bash
# Frontend
cd frontend
pnpm install
pnpm dev

# Backend
cd backend
python -m venv .venv
.venv/Scripts/activate  # Windows
pip install -r requirements.txt
uvicorn app.main:app --reload
```

## Sprint 0 でやらないこと

- 画面（UI コンポーネント）の実装
- API エンドポイントの実装
- ダミーデータ・シードデータの投入

これらは Sprint 1 以降で着手します。
