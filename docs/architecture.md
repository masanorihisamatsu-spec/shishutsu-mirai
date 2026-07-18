# アーキテクチャ（Sprint 0）

## ディレクトリ構成の方針

```
支出管理みらい/
├── frontend/   # Next.js アプリケーションコード
├── backend/    # FastAPI アプリケーションコード
├── database/   # SQLite の実データ（Git 管理外）
├── docs/       # 設計ドキュメント
└── docker/     # 各サービスの Dockerfile
```

- **frontend / backend にはアプリケーションコードのみを置く。**
  ビルド定義（Dockerfile）は `docker/` にまとめ、コンテナ実行環境の変更がアプリケーションコードの差分に混ざらないようにしている。
- **database はコードから分離する。**
  SQLite のファイルは Docker ボリュームとして `backend` コンテナにマウントされる。DB ファイルを Git 管理外にしつつ、ローカルでも参照しやすい場所に置くための構成。
- **docs は判断理由を残す場所。**
  「なぜこの構成にしたか」はコードから読み取れないため、ここに残す。

## 環境変数の方針

`.env` は必須にしていない。`docker-compose.yml` は `${VAR:-default}` 形式で開発用のデフォルト値を持つため、`.env` を用意しなくても `docker compose up` だけで起動できる。`.env.example` は値を変更したい場合のテンプレートとして用意している。

## DB 接続 / マイグレーション

- SQLAlchemy の接続設定は `backend/app/core/config.py` に一元化し、`DATABASE_URL` 環境変数から読み込む。
- Alembic (`backend/alembic`) はこの設定を再利用し、DB 接続文字列を二重管理しない。
- モデルは `backend/app/models` 配下に追加し、`Base.metadata` 経由で Alembic の autogenerate が検出できるようにする。

## バックエンドの層構成（Sprint 6〜）

`backend/app` は以下の層に分割している。上から下へ一方向にのみ依存する（API層 → Service層 → Repository層 → Model）。

```
backend/app/
├── api/routes/       # FastAPI の APIRouter。HTTPリクエスト/レスポンスとステータスコードの変換のみ担当
├── services/          # 業務ロジック。Not Found 等のドメイン例外を送出する（HTTPは知らない）
├── repositories/       # SQLAlchemy Session を使った DB アクセスのみ担当
├── models/             # SQLAlchemy モデル（テーブル定義）
├── schemas/            # Pydantic スキーマ（リクエスト/レスポンスの型）
├── db/                 # engine・SessionLocal・get_db 依存関数・Base
└── core/config.py      # 環境変数の一元管理
```

- **Repository は DB クエリのみ**を持ち、業務ルールを持たない。
- **Service は Repository を呼び出し、業務ルール（存在チェック等）を持つ**。HTTPステータスコードのような Web 層の関心事は持ち込まない（`TransactionNotFoundError` のような素の例外を送出する）。
- **API 層（`api/routes/`）は Service の例外を HTTPException に変換する**責務のみを持つ。
- 新しいリソース（例: カテゴリ、予算）を追加する場合も、この4層構成（`models` → `schemas` → `repositories` → `services` → `api/routes`）を踏襲する。

## フロントエンドの初期構成

- `create-next-app` 相当の App Router 構成 + TypeScript + Tailwind CSS。
- `shadcn/ui` はセットアップ済み（`components.json` / CSS 変数 / `cn()` ヘルパー）。実際のコンポーネント追加は今後 `pnpm dlx shadcn@latest add <component>` で行う。
- React Hook Form / Zod / TanStack Query / Recharts は依存関係として導入済みだが、Sprint 0 では画面・API を実装しないため未使用。

## OCR機能の構成（Sprint 9〜）

レシート画像から店舗名・日付・金額を自動認識する機能。バックエンド・フロントエンドの両方に
`services/ocr` という新しいディレクトリを追加した。

### バックエンド: `backend/app/services/ocr/`

既存の4層構成（`api/routes` → `services` → `repositories` → `models`）とは別枠の、
「OCRという1つの外部処理能力」をカプセル化した内部モジュール。DBには触らない。

```
backend/app/services/ocr/
├── engine.py         # OcrEngine（抽象）と TesseractOcrEngine（実装）
├── preprocessing.py  # 回転補正・リサイズなどOCR前処理
├── parser.py         # OCRの生テキストから店舗名/日付/金額を正規表現で抽出
└── service.py         # 画像保存 → 前処理 → OCR実行 → パースまでを統括する OcrService
```

- `OcrEngine` を抽象基底クラスとして切り出しているのは、**将来AI OCR（Google Cloud Vision や
  Claude/GPT-4V のようなマルチモーダルLLM）に差し替える際に、`OcrService` 以降のコードを
  一切変更せずに済むようにするため**。詳細は `engine.py` のコメントを参照。
- レシート画像は `backend/app/core/config.py` の `uploads_dir`（既定値 `uploads/receipts`、
  `backend/` からの相対パス）に保存する。DB の `receipt_image` カラムにも同じ形式の
  相対パスを保存する。アップロード画像は Git 管理外（`.gitignore` の `backend/uploads/`）。

### フロントエンド: `frontend/src/services/`

`lib/api/`（自前バックエンドのCRUD呼び出し）とは別に、外部の1機能をAPI呼び出し・型・
結果の反映ロジックまで含めて丸ごとカプセル化したいときに使う置き場所。

```
frontend/src/services/ocr/
├── types.ts           # バックエンドのレスポンス型（snake_case）
├── api.ts              # scanReceipt(file) の実際のHTTP呼び出し（multipart/form-data）
├── mapper.ts            # OCR結果 → TransactionFormValues への反映ロジック
├── prefill-storage.ts    # データ取込センター→取引登録画面の一度きりの受け渡し（sessionStorage）
└── index.ts              # バレルエクスポート
```

- `lib/api-client.ts` の `apiFetch` は `FormData` を渡した場合、JSON化せず
  `Content-Type` もブラウザに任せる（multipart boundary の自動付与のため）。
