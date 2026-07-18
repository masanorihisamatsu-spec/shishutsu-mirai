# CLAUDE.md

このファイルは、このリポジトリで Claude Code（AIコーディングアシスタント）が作業する際のガイドです。

## プロジェクト概要

「支出管理みらい」— AI支出管理アプリ。Sprint 0（環境構築）・Sprint 1（デザインシステム）・Sprint 2-1（ホーム画面）・Sprint 3（取引一覧画面）・Sprint 4（データ取込センター）・Sprint 5（取引登録フォーム）に続き、**Sprint 6（バックエンド永続化: Transaction CRUD API）** が完了した状態です。フロントエンドとバックエンドの接続はまだ未実装（フロントエンドはダミーデータのまま）です。

## 技術構成

- Frontend: Next.js 15 (App Router) / TypeScript / Tailwind CSS / shadcn/ui / React Hook Form / Zod / TanStack Query / Recharts
- Backend: FastAPI / SQLAlchemy / Alembic / Pydantic
- Database: SQLite
- Development: Docker / Docker Compose
- Package Manager: pnpm（frontend のみ。backend は pip + requirements.txt）

## ディレクトリ構成と原則

```
frontend/   Next.js アプリケーションコード（Dockerfile は置かない）
backend/    FastAPI アプリケーションコード（Dockerfile は置かない）
database/   SQLite の実データ（Git 管理外、コードは置かない）
docker/     各サービスの Dockerfile（frontend/ backend/ にコードとして混在させない）
docs/       設計ドキュメント・ADR
```

- インフラ定義（Dockerfile）とアプリケーションコードを分離する。`frontend/` `backend/` に Dockerfile を追加しない。
- DB接続文字列は `backend/app/core/config.py`（Pydantic Settings）に一元化する。Alembic の `env.py` もここから読み込む。接続文字列をハードコードで二重管理しない。
- 新しい SQLAlchemy モデルは `backend/app/models/` に追加し、`backend/app/models/__init__.py` でインポートして `Base.metadata` から見えるようにする（Alembic autogenerate の前提）。
- backend は `api/routes/`（HTTP⇔例外変換）→ `services/`（業務ロジック、HTTPを知らない）→ `repositories/`（DBクエリのみ）→ `models/` の4層構成。新しいリソースを追加する際もこの構成に従う。詳細は [docs/architecture.md](./docs/architecture.md)。
- `frontend/src/components/` は4層構造。`ui/`（shadcn/ui プリミティブ、新規追加は `pnpm dlx shadcn@latest add <component>`）→ `common/`（複数画面で使う複合コンポーネント。`ui/` を組み合わせて作る）→ `layout/`（ヘッダー・ボトムナビ等ページの骨格）→ `<feature>/`（例: `home/`。特定の画面専用のコンポーネント。他画面で使う汎用性が出てきたら `common/` に昇格させる）。新規コンポーネントはこの4層のどこに属するか判断してから配置する。詳細は [docs/design-system.md](./docs/design-system.md)。
- 画面（ページ）は `src/app/<route>/page.tsx` を薄く保ち、実体は `src/components/<feature>/<feature>-screen.tsx` に置いて呼び出す（例: `src/app/page.tsx` → `HomeScreen`）。
- カラー・角丸・フォントなどのデザイントークンは `frontend/src/app/globals.css` の CSS 変数と `frontend/tailwind.config.ts` に一元化する。コンポーネント側で色や角丸の値を直接ハードコードしない。
- ダミーデータは `frontend/src/data/` にまとめ、コンポーネントへは props で渡す（コンポーネント内にハードコードしない）。型は `frontend/src/types/` に定義し、ダミーデータと将来の API レスポンス型を共通化する。

## コマンド

```bash
# 起動（Docker）
docker compose up

# Frontend（ローカル）
cd frontend && pnpm install && pnpm dev
cd frontend && pnpm lint
cd frontend && pnpm build

# Backend（ローカル）
cd backend && pip install -r requirements.txt
cd backend && uvicorn app.main:app --reload

# マイグレーション
docker compose exec backend alembic revision --autogenerate -m "message"
docker compose exec backend alembic upgrade head
```

## 制約・注意事項

- 環境変数はコード内にハードコードしない。`.env.example` を更新した場合は README の環境変数表も合わせて更新する。
- `.env` および `database/*.db` は Git 管理外（`.gitignore` 参照）。誤ってコミットしない。
- Sprint 0 の時点では画面・APIエンドポイント・ダミーデータを実装しない方針。実装する際は Sprint 番号を切って着手する。
- 詳細な設計判断の背景は [docs/architecture.md](./docs/architecture.md) を参照。新しい構成上の判断をした場合はここに追記する。
