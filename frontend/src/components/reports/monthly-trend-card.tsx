"use client";

import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/format";
import type { MonthlyTotal } from "@/types/expense";

interface MonthlyTrendCardProps {
  data: MonthlyTotal[];
}

export function MonthlyTrendCard({ data }: MonthlyTrendCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm font-medium text-muted-foreground">月別支出推移</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-56 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 8, right: 8, left: 8, bottom: 0 }}>
              <CartesianGrid vertical={false} stroke="hsl(var(--border))" />
              <XAxis
                dataKey="label"
                tickLine={false}
                axisLine={false}
                tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }}
              />
              <YAxis hide />
              <Tooltip
                cursor={{ fill: "hsl(var(--muted))" }}
                formatter={(value: number) => formatCurrency(value)}
                labelFormatter={(label: string) => label}
                contentStyle={{
                  borderRadius: 12,
                  border: "1px solid hsl(var(--border))",
                  fontSize: 12,
                }}
              />
              <Bar
                dataKey="amount"
                fill="hsl(var(--primary))"
                radius={[6, 6, 0, 0]}
                isAnimationActive={false}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
