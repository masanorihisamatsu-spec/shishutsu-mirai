import { PieChart } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/format";

interface MonthlySummaryCardProps {
  totalAmount: number;
  count: number;
}

export function MonthlySummaryCard({ totalAmount, count }: MonthlySummaryCardProps) {
  return (
    <Card className="overflow-hidden border-none bg-gradient-to-br from-primary/10 via-card to-card shadow-md">
      <CardHeader className="flex-row items-center justify-between pb-1">
        <CardTitle className="text-sm font-medium text-muted-foreground">今月の支出合計</CardTitle>
        <span className="flex size-10 items-center justify-center rounded-full bg-primary/15 text-primary">
          <PieChart className="size-5" />
        </span>
      </CardHeader>
      <CardContent className="pb-7 pt-1">
        <p className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
          {formatCurrency(totalAmount)}
        </p>
        <p className="mt-2 text-sm text-muted-foreground">{count}件の取引</p>
      </CardContent>
    </Card>
  );
}
