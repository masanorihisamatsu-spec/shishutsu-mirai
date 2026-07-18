import { Receipt } from "lucide-react";

import type { Transaction } from "@/types/expense";

import { TransactionCard } from "./transaction-card";

interface TransactionListProps {
  transactions: Transaction[];
}

export function TransactionList({ transactions }: TransactionListProps) {
  if (transactions.length === 0) {
    return (
      <div className="flex flex-col items-center gap-2 rounded-2xl border border-dashed border-border/60 py-14 text-center">
        <span className="flex size-12 items-center justify-center rounded-full bg-muted text-muted-foreground">
          <Receipt className="size-6" />
        </span>
        <p className="text-sm font-medium text-foreground">まだ取引がありません</p>
        <p className="text-xs text-muted-foreground">右下の＋から登録できます</p>
      </div>
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
