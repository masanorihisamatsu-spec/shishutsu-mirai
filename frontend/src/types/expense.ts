export interface CategoryExpense {
  category: string;
  amount: number;
  /** 円グラフの塗り色（hex）。API化後もサーバー側でカテゴリごとの色を返す想定 */
  color: string;
}

export interface MonthlyTotal {
  /** "2026-07" 形式 */
  monthKey: string;
  /** "7月" のような表示用ラベル */
  label: string;
  amount: number;
}

export interface Transaction {
  id: string;
  storeName: string;
  category: string;
  amount: number;
  /** ISO 8601 形式の日付文字列 */
  date: string;
  /** 支払方法（例: 現金 / PayPay / 楽天カード / JCB / 銀行） */
  paymentMethod: string;
  memo?: string | null;
  receiptImage?: string | null;
  createdAt?: string;
  updatedAt?: string;
}
