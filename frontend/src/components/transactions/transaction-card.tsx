import Link from "next/link";
import { memo } from "react";
import { ChevronRight, Wallet } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { formatCurrency, formatDate } from "@/lib/format";
import { PAYMENT_METHOD_ICONS } from "@/lib/option-icons";
import type { Transaction } from "@/types/expense";

interface TransactionCardProps {
  transaction: Transaction;
}

/**
 * 取引一覧の1行分。件数が多くなり得るリストの子要素のため、
 * 自身の transaction が変わらない限り親（並び替え等）の再レンダリングに巻き込まれないよう memo 化する。
 */
export const TransactionCard = memo(function TransactionCard({
  transaction,
}: TransactionCardProps) {
  const PaymentIcon = PAYMENT_METHOD_ICONS[transaction.paymentMethod] ?? Wallet;

  return (
    <Link href={`/transactions/${transaction.id}`} className="block">
      <Card className="transition-colors hover:bg-accent/40 active:bg-accent/60">
        <CardContent className="flex items-center justify-between gap-4 p-4">
          <div className="flex min-w-0 items-center gap-3">
            <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
              <PaymentIcon className="size-5" />
            </span>
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-foreground">
                {transaction.storeName}
              </p>
              <div className="mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-1">
                <Badge variant="secondary" className="px-2 py-0.5 text-[11px]">
                  {transaction.category}
                </Badge>
                <span className="text-xs text-muted-foreground">{transaction.paymentMethod}</span>
                <span className="text-xs text-muted-foreground">{formatDate(transaction.date)}</span>
              </div>
              {transaction.memo && (
                <p className="mt-1 truncate text-xs text-muted-foreground">{transaction.memo}</p>
              )}
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-1.5">
            <p className="text-base font-semibold text-foreground">
              {formatCurrency(transaction.amount)}
            </p>
            <ChevronRight className="size-4 text-muted-foreground" />
          </div>
        </CardContent>
      </Card>
    </Link>
  );
});
