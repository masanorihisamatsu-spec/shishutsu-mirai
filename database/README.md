# database

SQLite のデータファイルを格納するディレクトリです。

- コンテナ起動時、`backend` サービスがこのディレクトリを `/app/database` にマウントします。
- `app.db` はアプリケーション実行時に自動生成されます（Git 管理外、`.gitignore` 参照）。
- 保存場所・ファイル名は `.env` の `DATABASE_URL` で変更できます（デフォルト: `sqlite:///./database/app.db`）。
- スキーマ変更（マイグレーション）は [backend/alembic](../backend/alembic) で管理します。
