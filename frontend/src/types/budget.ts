/**
 * バックエンドの BudgetUpsert スキーマ（backend/app/schemas/budget.py）に対応するリクエスト型。
 */
export interface BudgetUpsertPayload {
  amount: number;
}

/**
 * バックエンドの BudgetRead スキーマに対応するレスポンス型。
 */
export interface BudgetApiResponse {
  id: number;
  category: string;
  amount: number;
  created_at: string;
  updated_at: string;
}
