"use client";

import { Cell, Pie, PieChart, ResponsiveContainer } from "recharts";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/format";
import type { CategoryExpense } from "@/types/expense";

interface CategoryBreakdownCardProps {
  data: CategoryExpense[];
}

export function CategoryBreakdownCard({ data }: CategoryBreakdownCardProps) {
  const total = data.reduce((sum, item) => sum + item.amount, 0);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm font-medium text-muted-foreground">カテゴリ別支出</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col items-center gap-8 sm:flex-row">
        <div className="relative h-52 w-52 shrink-0">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                dataKey="amount"
                nameKey="category"
                innerRadius="60%"
                outerRadius="100%"
                paddingAngle={2}
                stroke="none"
              >
                {data.map((entry) => (
                  <Cell key={entry.category} fill={entry.color} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
          <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-xs text-muted-foreground">合計</span>
            <span className="text-lg font-bold text-foreground">{formatCurrency(total)}</span>
          </div>
        </div>

        <ul className="w-full space-y-3">
          {data.map((item) => (
            <li key={item.category} className="flex items-center justify-between gap-3 text-sm">
              <span className="flex items-center gap-2 text-foreground">
                <span
                  className="size-2.5 shrink-0 rounded-full"
                  style={{ backgroundColor: item.color }}
                  aria-hidden="true"
                />
                {item.category}
              </span>
              <span className="text-muted-foreground">
                {formatCurrency(item.amount)}
                <span className="ml-1 text-xs">
                  ({total ? Math.round((item.amount / total) * 100) : 0}%)
                </span>
              </span>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
