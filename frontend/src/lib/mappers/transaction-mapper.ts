import type { Transaction } from "@/types/expense";
import type { TransactionApiResponse } from "@/types/transaction";

/** バックエンド（snake_case）のレスポンスをフロントエンドのドメイン型（camelCase）へ変換する */
export function mapTransactionResponse(response: TransactionApiResponse): Transaction {
  return {
    id: String(response.id),
    storeName: response.store_name,
    category: response.category,
    amount: response.amount,
    date: response.date,
    paymentMethod: response.payment_method,
    memo: response.memo,
    receiptImage: response.receipt_image,
    createdAt: response.created_at,
    updatedAt: response.updated_at,
  };
}
