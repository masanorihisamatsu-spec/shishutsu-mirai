# デザインシステム（Sprint 1〜）

## コンセプト

毎日開きたくなる / シンプル / 余白を広く / 北欧風 / やさしい印象 / 高級感

## カラートークン

`frontend/src/app/globals.css` の `:root` で HSL 値として定義し、`tailwind.config.ts` で `hsl(var(--x) / <alpha-value>)` 形式でマッピングしている。この形式にすることで `bg-primary/10` のような透明度指定がそのまま使え、北欧風の淡いトーン（薄いピンクのバッジ背景など）を表現しやすくしている。

| トークン | 役割 | 値（HSL） |
| --- | --- | --- |
| `background` | 背景（オフホワイト） | `36 38% 97%` |
| `card` | カード（ホワイト） | `0 0% 100%` |
| `foreground` | 文字（ダークグレー） | `25 12% 20%` |
| `primary` | アクセント（くすみピンク） | `350 40% 55%` |
| `secondary` / `muted` | 補助色（グレージュ） | `32 16% 90%` / `33 20% 94%` |
| `success` | 成功（セージグリーン） | `104 18% 46%` |
| `destructive` | 破壊的操作（暖色系の落ち着いた赤） | `8 55% 54%` |

`.dark` のトーンは未定義（今回のスコープ外）。将来ダークモードを追加する場合は `docs/design-system.md` を更新し、`globals.css` に `.dark` ブロックを追加する。

## タイポグラフィ

`next/font/google` の `Noto_Sans_JP` を `frontend/src/app/layout.tsx` で読み込み、CSS変数 `--font-noto-sans-jp` として `tailwind.config.ts` の `fontFamily.sans` に接続している。コンポーネント側は `font-sans`（Tailwind標準クラス）を使うだけでよい。

## アイコン

`lucide-react` を使用する。サイズは `size-4`（16px, 本文中/入力欄内）、`size-5`（20px, ナビゲーション）を基準にする。

## 角丸スケール

余白を広く・やさしい印象を出すため、標準の shadcn/ui より大きめの半径を採用している。

| 用途 | クラス |
| --- | --- |
| Button / Badge / SearchBar | `rounded-full`（ピル型） |
| Card | `rounded-2xl` |
| Dialog | `rounded-3xl` |
| Input | `rounded-xl` |

## コンポーネントのディレクトリ規約

```
frontend/src/components/
├── ui/                 # shadcn/ui プリミティブ（Button, Card, Input, Dialog, Badge, Textarea）
│                       # 新規追加は `pnpm dlx shadcn@latest add <component>` を使う
├── common/             # 複数画面で使う再利用可能な複合コンポーネント（SearchBar, FabMenu 等）
├── layout/             # ページの骨格を構成するコンポーネント（Header, HeaderDefaultActions, BottomNavigation）
├── home/               # ホーム画面専用コンポーネント（Sprint 2〜）
├── transactions/       # 取引一覧画面専用コンポーネント（Sprint 3〜）
├── import/             # データ取込センター専用コンポーネント（Sprint 4〜）
└── transaction-form/   # 取引登録フォーム専用コンポーネント（Sprint 5〜）
```

- `ui/` はスタイル・バリアントのみを持ち、業務ロジックを持たない。
- `common/` は `ui/` を組み合わせて作る(例: `SearchBar` は `Input` を合成している)。スタイルの重複を避けるため、独自にマークアップを書き直さない。
- `layout/` はページ間で共通の配置(ヘッダー、ボトムナビゲーション)を担当し、ページ固有のロジックは持たない。
- 画面専用コンポーネントは `<feature>/`（例: `home/`, `transactions/`）に置く。他画面でも使う汎用性が出てきたら `common/` に昇格させる（Sprint 3 で `FabMenu` を `home/` → `common/` に昇格し、`transactions/` `transaction-form/` からも使い回せるようにした）。
- 全画面で共有する定数は `frontend/src/lib/` と `frontend/src/data/` に置き、画面側でハードコードしない。
  - `lib/navigation.ts` — Bottom Navigation の項目
  - `data/expense-options-dummy-data.ts` — カテゴリ・支払方法の選択肢（`transactions/` の絞り込みと `transaction-form/` の入力の両方で使用。将来 `/categories` `/payment-methods` API に置き換わる想定のため `data/` に置いている）
  - `lib/option-icons.ts` — 上記の選択肢名 → `LucideIcon` のマッピング（表示専用の実装詳細なので `data/`・`types/` には含めない）
- フォーム画面（例: `transaction-form/`）はメインの `Header` / `BottomNavigation` を使わず、戻るボタンのみの軽量な画面固有ヘッダーを持つ。タスクに集中させたい入力画面ではタブ移動の導線を出さない方針。

この4層構造により、新しい画面を作る際は `ui/` → `common/` → `layout/` → 該当 `<feature>/` の順で再利用できる部品を探せばよく、重複実装を避けやすい。

### 画面の組み立て方（Sprint 2〜）

`src/app/<route>/page.tsx` は薄く保ち、実体は `src/components/<feature>/<feature>-screen.tsx` に置く。

```
src/app/page.tsx                  → <HomeScreen /> を呼ぶだけ
src/app/transactions/page.tsx     → <TransactionsScreen /> を呼ぶだけ
src/app/transactions/new/page.tsx → <TransactionFormScreen /> を呼ぶだけ
src/app/import/page.tsx           → <ImportScreen /> を呼ぶだけ

src/components/home/
├── home-screen.tsx           # Header / 各カード / FabMenu / BottomNavigation を組み立てる
├── greeting-section.tsx
├── today-expense-card.tsx
├── monthly-expense-card.tsx
├── category-breakdown-card.tsx
├── mirai-insight-card.tsx
└── recent-transactions-card.tsx

src/components/transactions/
├── transactions-screen.tsx   # Header / フィルター / 並び替え / 一覧 / FabMenu / BottomNavigation
├── transaction-filter-bar.tsx  # 検索・絞り込みUI（制御コンポーネント。状態は screen 側が保持）
├── filter-transactions.ts    # TransactionFilters 型 + 純粋関数 filterTransactions()
├── transaction-list.tsx
└── transaction-card.tsx

src/components/import/
├── import-screen.tsx         # Header / 取込方法カード一覧 / 今後対応予定 / BottomNavigation（FABなし）
├── import-method-card.tsx
└── upcoming-integrations.tsx

src/components/transaction-form/
├── transaction-form-screen.tsx  # 戻るボタンのみの軽量ヘッダー / フォーム本体 / 保存・キャンセル（Header・BottomNavigation・FABなし）
├── form-field.tsx               # label + 入力 + エラーメッセージの共通レイアウト
├── option-tile-grid.tsx         # アイコン付き単一選択タイル（カテゴリ・支払方法で共用）
└── receipt-image-picker.tsx     # レシート画像のローカル選択・プレビュー（アップロードなし）
```

`transaction-filter-bar.tsx` は `filters` / `onFiltersChange` を props で受け取る制御コンポーネント。フィルター状態は `transactions-screen.tsx` が持ち、`filterTransactions()`（純粋関数、`filter-transactions.ts`）でリアルタイムに一覧へ反映する。チップ表示は状態から都度導出するため、チップ用の別状態は持たない。

`import-method-card.tsx` / `upcoming-integrations.tsx` はアイコン（`LucideIcon`）を props で受け取る設計にしている。`types/import.ts` の `ImportMethod` / `UpcomingIntegration` はアイコンを持たず id 文字列のみを持つため、将来 API 化してもドメイン型がフロントエンド専用の実装詳細（アイコン）に依存しない。

これにより `page.tsx` はルーティングの入口としての責務のみを持ち、画面の中身は独立してテスト・再利用しやすい単位になる。

## ダミーデータと型（Sprint 2〜）

- ダミーデータは `frontend/src/data/`（例: `home-dummy-data.ts`）にまとめ、コンポーネントへは props で渡す。コンポーネント内に金額や文言を直接書かない。
- 型は `frontend/src/types/`（例: `expense.ts` の `CategoryExpense` / `Transaction`）に定義し、ダミーデータと将来の API レスポンス型を共通化する。

### API化する際の方針

1. `frontend/src/data/home-dummy-data.ts` の各定数（`todayExpenseDummy` 等）を、同じ型を返す TanStack Query の `useQuery` フックに置き換える（例: `useTodayExpense()` が `number` を返す、`useRecentTransactions()` が `Transaction[]` を返す）。フックは `frontend/src/hooks/` に配置する想定。
2. コンポーネント側（`TodayExpenseCard` 等）は props 経由でデータを受け取る設計のままなので、呼び出し元（`HomeScreen`）を差し替えるだけで済み、コンポーネント自体の変更は不要。
3. `frontend/src/types/expense.ts` の型を、バックエンドの Pydantic スキーマ（`backend/app/schemas/`、Sprint 3 以降で追加予定）と一致させる。将来的には OpenAPI スキーマから自動生成する運用も検討する。
4. ローディング・エラー状態は各カードコンポーネントに `isLoading` / `error` 等の任意 props を追加する形で拡張し、既存の props（`amount`, `budget` 等）は必須のまま保つ。
5. FAB の3項目(レシート撮影 / データ取り込み / 手入力)は現状 UI のみ。実装時は `DialogClose` の `onClick` に各機能の起動処理（カメラ起動 / ファイル選択 / 手入力フォームへの遷移）を追加する。

### `--radius` 変数について

Sprint 1 で作った5つのコンポーネントは、用途ごとに差をつけるため `rounded-full` / `rounded-xl` / `rounded-2xl` / `rounded-3xl` を直接指定している（上表参照）。一方 `--radius`（`1rem`）と `tailwind.config.ts` の `borderRadius.lg/md/sm` は、今後 `shadcn/ui` CLI で追加するコンポーネント（Select, Popover, DropdownMenu 等、既定で `rounded-md` を使うもの）が Tailwind 標準の小さい角丸（6px）にならず、このデザインシステムの「やさしい印象」を自動的に引き継ぐための土台として残している。

