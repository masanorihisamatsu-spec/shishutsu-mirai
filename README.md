# 支出管理みらい

AIを活用した支出管理アプリです。

レシートOCR・CSV/PDF取込・AI分析・AIチャットにより、
日々の支出を簡単に記録・分析できます。

---

## 主な機能

### 取引管理

- 支出の登録・編集・削除
- カテゴリ管理
- 支払方法管理
- 重複登録防止

### レシートOCR

- レシート画像から自動入力
- 店舗名・日付・金額を抽出
- 回転画像にも対応

### 明細インポート

対応形式

- PayPay CSV
- PayPay PDF
- 楽天カードCSV
- JCB CSV
- Excel家計簿

重複チェックを行い、安全に取り込みできます。

### レポート

- 月別推移
- カテゴリ別円グラフ
- 支出ランキング
- 集計表示

### AI分析

AIが自動で

- 使い過ぎカテゴリ
- 支出増加
- コンビニ利用
- 平均利用額

などを分析します。

### AIチャット

例えば

- 食費はいくら？
- コンビニはいくら？
- Amazonはいくら使った？
- 今月使いすぎは？

など自然な日本語で質問できます。

---

# 使用技術

## Frontend

- Next.js 15
- TypeScript
- Tailwind CSS
- TanStack Query
- Recharts

## Backend

- FastAPI
- SQLAlchemy
- Alembic
- Pydantic

## Database

- SQLite

## OCR

- Tesseract OCR

## 開発環境

- Docker
- Docker Compose

---

# 今後追加予定

- AI OCR
- LLMによるAIチャット
- 銀行口座連携
- クレジットカード自動連携
- 家計予算管理
- 支出予測
- 資産管理

---

# スクリーンショット

（今後追加予定）

---

# 開発者

久松 正倫

GitHub

https://github.com/masanorihisamatsu-spec

---

# Version

Version 1.0
