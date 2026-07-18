"use client";

import { useMemo, useState } from "react";

import { ErrorState } from "@/components/common/error-state";
import { FabMenu } from "@/components/common/fab-menu";
import { BottomNavigation } from "@/components/layout/bottom-navigation";
import { Header } from "@/components/layout/header";
import { HeaderDefaultActions } from "@/components/layout/header-actions";
import { useTransactions } from "@/hooks/use-transactions";
import { BOTTOM_NAV_ITEMS } from "@/lib/navigation";

import {
  EMPTY_TRANSACTION_FILTERS,
  filterTransactions,
  type TransactionFilters,
} from "./filter-transactions";
import { TransactionFilterBar } from "./transaction-filter-bar";
import { TransactionList } from "./transaction-list";
import { TransactionListSkeleton } from "./transaction-list-skeleton";

type SortOrder = "newest" | "oldest" | "amount";

export function TransactionsScreen() {
  const [filters, setFilters] = useState<TransactionFilters>(EMPTY_TRANSACTION_FILTERS);
  const [sortOrder, setSortOrder] = useState<SortOrder>("newest");

  const { data: transactions, isPending, isError, error, refetch } = useTransactions();

  const filteredTransactions = useMemo(
    () => filterTransactions(transactions ?? [], filters),
    [transactions, filters]
  );

  const sortedTransactions = useMemo(() => {
    const list = [...filteredTransactions];
    switch (sortOrder) {
      case "oldest":
        return list.sort((a, b) => a.date.localeCompare(b.date));
      case "amount":
        return list.sort((a, b) => b.amount - a.amount);
      case "newest":
      default:
        return list.sort((a, b) => b.date.localeCompare(a.date));
    }
  }, [filteredTransactions, sortOrder]);

  return (
    <div className="min-h-screen bg-background pb-28">
      <Header actions={<HeaderDefaultActions />} />

      <main className="mx-auto flex max-w-2xl flex-col gap-6 px-5 py-7 sm:px-8 sm:py-9">
        <div>
          <h1 className="text-xl font-semibold text-foreground sm:text-2xl">取引一覧</h1>
          {!isPending && !isError && (
            <p className="mt-1 text-sm text-muted-foreground">
              {sortedTransactions.length}件の取引
              {sortedTransactions.length !== (transactions?.length ?? 0) &&
                `（全${transactions?.length ?? 0}件中）`}
            </p>
          )}
        </div>

        {isPending ? (
          <TransactionListSkeleton />
        ) : isError ? (
          <ErrorState
            title="取引の取得に失敗しました"
            message={error instanceof Error ? error.message : undefined}
            onRetry={() => refetch()}
          />
        ) : (
          <>
            <TransactionFilterBar filters={filters} onFiltersChange={setFilters} />

            <div className="flex items-center justify-end">
              <select
                value={sortOrder}
                onChange={(event) => setSortOrder(event.target.value as SortOrder)}
                aria-label="並び替え"
                className="h-9 rounded-full border border-input bg-card px-3 text-xs text-foreground shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              >
                <option value="newest">新しい順</option>
                <option value="oldest">古い順</option>
                <option value="amount">金額順</option>
              </select>
            </div>

            <TransactionList transactions={sortedTransactions} />
          </>
        )}
      </main>

      <FabMenu />

      <BottomNavigation items={BOTTOM_NAV_ITEMS} />
    </div>
  );
}
