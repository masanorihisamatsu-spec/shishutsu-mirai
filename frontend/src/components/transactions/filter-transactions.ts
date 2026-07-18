import type { Transaction } from "@/types/expense";

export interface TransactionFilters {
  keyword: string;
  /** 複数選択可。空配列は「すべてのカテゴリ」を意味する */
  categories: string[];
  /** <input type="month"> の値（例: "2026-04"）。空文字は未指定 */
  period: string;
  minAmount: number | null;
}

export const EMPTY_TRANSACTION_FILTERS: TransactionFilters = {
  keyword: "",
  categories: [],
  period: "",
  minAmount: null,
};

export function filterTransactions(
  transactions: Transaction[],
  filters: TransactionFilters
): Transaction[] {
  return transactions.filter((transaction) => {
    if (
      filters.keyword &&
      !transaction.storeName.toLowerCase().includes(filters.keyword.toLowerCase())
    ) {
      return false;
    }

    if (filters.categories.length > 0 && !filters.categories.includes(transaction.category)) {
      return false;
    }

    if (filters.period && !transaction.date.startsWith(filters.period)) {
      return false;
    }

    if (filters.minAmount !== null && transaction.amount < filters.minAmount) {
      return false;
    }

    return true;
  });
}
