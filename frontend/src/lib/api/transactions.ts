import { apiFetch } from "@/lib/api-client";
import { mapTransactionResponse } from "@/lib/mappers/transaction-mapper";
import type { Transaction } from "@/types/expense";
import type {
  TransactionApiResponse,
  TransactionCreatePayload,
  TransactionUpdatePayload,
} from "@/types/transaction";

export function createTransaction(
  payload: TransactionCreatePayload
): Promise<TransactionApiResponse> {
  return apiFetch<TransactionApiResponse>("/transactions", {
    method: "POST",
    body: payload,
  });
}

export async function listTransactions(): Promise<Transaction[]> {
  const response = await apiFetch<TransactionApiResponse[]>("/transactions");
  return response.map(mapTransactionResponse);
}

export async function getTransaction(id: number): Promise<Transaction> {
  const response = await apiFetch<TransactionApiResponse>(`/transactions/${id}`);
  return mapTransactionResponse(response);
}

export function updateTransaction(
  id: number,
  payload: TransactionUpdatePayload
): Promise<TransactionApiResponse> {
  return apiFetch<TransactionApiResponse>(`/transactions/${id}`, {
    method: "PUT",
    body: payload,
  });
}

export function deleteTransaction(id: number): Promise<void> {
  return apiFetch<void>(`/transactions/${id}`, { method: "DELETE" });
}
