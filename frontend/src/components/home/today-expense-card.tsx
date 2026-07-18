import { Receipt } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/format";

interface TodayExpenseCardProps {
  amount: number;
}

export function TodayExpenseCard({ amount }: TodayExpenseCardProps) {
  return (
    <Card className="overflow-hidden border-none bg-gradient-to-br from-primary/10 via-card to-card shadow-md">
      <CardHeader className="flex-row items-center justify-between pb-1">
        <CardTitle className="text-sm font-medium text-muted-foreground">今日の支出</CardTitle>
        <span className="flex size-10 items-center justify-center rounded-full bg-primary/15 text-primary">
          <Receipt className="size-5" />
        </span>
      </CardHeader>
      <CardContent className="pb-7 pt-1">
        <p className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
          {formatCurrency(amount)}
        </p>
      </CardContent>
    </Card>
  );
}
