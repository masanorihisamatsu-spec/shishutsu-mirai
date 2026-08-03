import { EmptyState } from "@/components/common/empty-state";
import type { Transaction } from "@/types/expense";

import { TransactionCard } from "./transaction-card";

interface TransactionListProps {
  transactions: Transaction[];
}

export function TransactionList({ transactions }: TransactionListProps) {
  if (transactions.length === 0) {
    return (
      <EmptyState title="まだ支出データがありません" message="右下の＋から登録できます" />
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {transactions.map((transaction) => (
        <TransactionCard key={transaction.id} transaction={transaction} />
      ))}
    </div>
  );
}
