import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { BudgetUsage } from "@/lib/analysis";
import { formatCurrency } from "@/lib/format";
import { cn } from "@/lib/utils";

interface BudgetComparisonCardProps {
  data: BudgetUsage[];
}

/** 予算が設定されているカテゴリのみ、今月の実績と突き合わせて進捗バーで表示する */
export function BudgetComparisonCard({ data }: BudgetComparisonCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm font-medium text-muted-foreground">予算 vs 実績</CardTitle>
      </CardHeader>
      <CardContent>
        {data.length === 0 ? (
          <p className="py-8 text-center text-sm text-muted-foreground">
            予算はまだ設定されていません。設定画面から登録できます。
          </p>
        ) : (
          <ul className="space-y-4">
            {data.map((item) => (
              <li key={item.category} className="space-y-1.5">
                <div className="flex items-center justify-between gap-2 text-sm">
                  <span className="font-medium text-foreground">{item.category}</span>
                  <span
                    className={cn(
                      "text-muted-foreground",
                      item.isOverBudget && "font-medium text-destructive"
                    )}
                  >
                    {formatCurrency(item.spentAmount)} / {formatCurrency(item.budgetAmount)}
                  </span>
                </div>

                <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                  <div
                    className={cn(
                      "h-full rounded-full transition-all",
                      item.isOverBudget ? "bg-destructive" : "bg-primary"
                    )}
                    style={{ width: `${Math.min(item.usageRate, 100)}%` }}
                  />
                </div>

                <div className="flex items-center justify-between text-xs">
                  <span className={item.isOverBudget ? "font-medium text-destructive" : "text-muted-foreground"}>
                    {item.isOverBudget
                      ? `${formatCurrency(Math.abs(item.remainingAmount))}超過`
                      : `残り ${formatCurrency(item.remainingAmount)}`}
                  </span>
                  <span className="text-muted-foreground">{item.usageRate}%</span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
