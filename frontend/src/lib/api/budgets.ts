import { apiFetch } from "@/lib/api-client";
import type { Budget } from "@/types/expense";
import type { BudgetApiResponse, BudgetUpsertPayload } from "@/types/budget";

export async function listBudgets(): Promise<Budget[]> {
  const response = await apiFetch<BudgetApiResponse[]>("/budgets");
  return response.map((item) => ({ category: item.category, amount: item.amount }));
}

export function setBudget(
  category: string,
  payload: BudgetUpsertPayload
): Promise<BudgetApiResponse> {
  return apiFetch<BudgetApiResponse>(`/budgets/${encodeURIComponent(category)}`, {
    method: "PUT",
    body: payload,
  });
}
