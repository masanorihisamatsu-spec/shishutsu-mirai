import { Receipt } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency, formatDate } from "@/lib/format";
import type { Transaction } from "@/types/expense";

const MAX_VISIBLE_TRANSACTIONS = 5;

interface RecentTransactionsCardProps {
  transactions: Transaction[];
}

export function RecentTransactionsCard({ transactions }: RecentTransactionsCardProps) {
  const visibleTransactions = transactions.slice(0, MAX_VISIBLE_TRANSACTIONS);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm font-medium text-muted-foreground">最近の取引</CardTitle>
      </CardHeader>
      <CardContent>
        {visibleTransactions.length === 0 ? (
          <div className="flex flex-col items-center gap-2 py-6 text-center">
            <span className="flex size-10 items-center justify-center rounded-full bg-muted text-muted-foreground">
              <Receipt className="size-5" />
            </span>
            <p className="text-sm font-medium text-foreground">まだ取引がありません</p>
            <p className="text-xs text-muted-foreground">右下の＋から登録できます</p>
          </div>
        ) : (
          <ul className="divide-y divide-border/60">
            {visibleTransactions.map((transaction) => (
              <li
                key={transaction.id}
                className="flex items-center justify-between gap-3 py-3.5 first:pt-0 last:pb-0"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-foreground">
                    {transaction.storeName}
                  </p>
                  <div className="mt-1 flex items-center gap-2">
                    <Badge variant="secondary" className="px-2 py-0.5 text-[11px]">
                      {transaction.category}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {formatDate(transaction.date)}
                    </span>
                  </div>
                </div>
                <p className="shrink-0 text-sm font-semibold text-foreground">
                  {formatCurrency(transaction.amount)}
                </p>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
