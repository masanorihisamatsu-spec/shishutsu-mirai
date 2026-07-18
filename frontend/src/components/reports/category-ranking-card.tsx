import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/format";
import { getPercentage } from "@/lib/reports";
import type { CategoryExpense } from "@/types/expense";

interface CategoryRankingCardProps {
  data: CategoryExpense[];
}

export function CategoryRankingCard({ data }: CategoryRankingCardProps) {
  const total = data.reduce((sum, item) => sum + item.amount, 0);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm font-medium text-muted-foreground">カテゴリランキング</CardTitle>
      </CardHeader>
      <CardContent>
        {data.length === 0 ? (
          <p className="py-8 text-center text-sm text-muted-foreground">
            今月のデータはまだありません
          </p>
        ) : (
          <ol className="space-y-4">
            {data.map((item, index) => {
              const percentage = getPercentage(item.amount, total);
              return (
                <li key={item.category} className="flex items-center gap-3">
                  <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-semibold text-muted-foreground">
                    {index + 1}
                  </span>
                  <div className="min-w-0 flex-1 space-y-1.5">
                    <div className="flex items-center justify-between gap-2 text-sm">
                      <span className="font-medium text-foreground">{item.category}</span>
                      <span className="text-muted-foreground">{formatCurrency(item.amount)}</span>
                    </div>
                    <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                      <div
                        className="h-full rounded-full"
                        style={{ width: `${percentage}%`, backgroundColor: item.color }}
                      />
                    </div>
                  </div>
                  <span className="w-10 shrink-0 text-right text-xs text-muted-foreground">
                    {percentage}%
                  </span>
                </li>
              );
            })}
          </ol>
        )}
      </CardContent>
    </Card>
  );
}
