/**
 * バックエンドの TransactionCreate スキーマ（backend/app/schemas/transaction.py）に対応するリクエスト型。
 */
export interface TransactionCreatePayload {
  date: string;
  store_name: string;
  amount: number;
  category: string;
  payment_method: string;
  memo: string | null;
  receipt_image: string | null;
}

/**
 * バックエンドの TransactionUpdate スキーマに対応するリクエスト型。
 * 現状 TransactionCreate と同じ形なので型エイリアスとして定義する。
 */
export type TransactionUpdatePayload = TransactionCreatePayload;

/**
 * バックエンドの TransactionRead スキーマに対応するレスポンス型。
 */
export interface TransactionApiResponse {
  id: number;
  date: string;
  store_name: string;
  amount: number;
  category: string;
  payment_method: string;
  memo: string | null;
  receipt_image: string | null;
  created_at: string;
  updated_at: string;
}
