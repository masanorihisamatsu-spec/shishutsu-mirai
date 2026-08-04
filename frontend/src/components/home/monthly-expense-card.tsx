"use client";

import { useMemo, useState } from "react";
import { Pencil, PiggyBank } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Toast, type ToastState } from "@/components/ui/toast";
import { useBudgets } from "@/hooks/use-budgets";
import { useCategories } from "@/hooks/use-categories";
import { useSetBudget } from "@/hooks/use-set-budget";
import { ApiError } from "@/lib/api-client";
import { formatCurrency } from "@/lib/format";

interface MonthlyExpenseCardProps {
  amount: number;
}

export function MonthlyExpenseCard({ amount }: MonthlyExpenseCardProps) {
  const { data: budgets } = useBudgets();
  const setBudget = useSetBudget();
  const { data: categories } = useCategories();
  const categoryNames = useMemo(() => (categories ?? []).map((category) => category.name), [categories]);

  const [open, setOpen] = useState(false);
  const [inputValues, setInputValues] = useState<Record<string, string>>({});
  const [toast, setToast] = useState<ToastState | null>(null);

  const budgetByCategory = useMemo(() => {
    const map = new Map<string, number>();
    for (const budget of budgets ?? []) {
      map.set(budget.category, budget.amount);
    }
    return map;
  }, [budgets]);

  const totalBudget = useMemo(
    () => Array.from(budgetByCategory.values()).reduce((sum, value) => sum + value, 0),
    [budgetByCategory]
  );

  const hasBudget = totalBudget > 0;
  const remaining = hasBudget ? totalBudget - amount : null;
  const usageRate = hasBudget ? Math.min(Math.round((amount / totalBudget) * 100), 100) : null;

  const handleDialogChange = (next: boolean) => {
    setOpen(next);
    if (next) {
      const initial: Record<string, string> = {};
      for (const category of categoryNames) {
        const value = budgetByCategory.get(category);
        initial[category] = value ? String(value) : "";
      }
      setInputValues(initial);
    }
  };

  const handleSave = async () => {
    const changedCategories = categoryNames.filter((category) => {
      const parsed = Number(inputValues[category]);
      return (
        inputValues[category] &&
        Number.isFinite(parsed) &&
        parsed > 0 &&
        parsed !== budgetByCategory.get(category)
      );
    });

    try {
      await Promise.all(
        changedCategories.map((category) =>
          setBudget.mutateAsync({ category, amount: Number(inputValues[category]) })
        )
      );
      setOpen(false);
    } catch (error) {
      setToast({
        message:
          error instanceof ApiError ? error.message : "予算の保存に失敗しました。もう一度お試しください。",
        variant: "error",
      });
    }
  };

  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between">
        <CardTitle className="text-sm font-medium text-muted-foreground">今月の支出</CardTitle>
        <span className="flex size-8 items-center justify-center rounded-full bg-primary/10 text-primary">
          <PiggyBank className="size-4" />
        </span>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-3xl font-bold tracking-tight text-foreground">{formatCurrency(amount)}</p>

        <Dialog open={open} onOpenChange={handleDialogChange}>
          {!hasBudget ? (
            <div className="space-y-3 rounded-2xl bg-muted/70 p-4">
              <p className="text-sm font-medium text-muted-foreground">予算はまだ設定されていません</p>
              <DialogTrigger asChild>
                <Button variant="secondary" size="sm" className="w-full">
                  予算を設定する
                </Button>
              </DialogTrigger>
            </div>
          ) : (
            <>
              <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full rounded-full bg-primary transition-all"
                  style={{ width: `${usageRate ?? 0}%` }}
                />
              </div>
              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <span>予算 {formatCurrency(totalBudget)}</span>
                <span className="flex items-center gap-1">
                  <span className="font-medium text-foreground">
                    残り {formatCurrency(remaining ?? 0)}
                  </span>
                  <DialogTrigger asChild>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="size-7 text-muted-foreground"
                      aria-label="予算を編集"
                    >
                      <Pencil className="size-3.5" />
                    </Button>
                  </DialogTrigger>
                </span>
              </div>
            </>
          )}

          <DialogContent>
            <DialogHeader>
              <DialogTitle>カテゴリ別の月間予算を設定</DialogTitle>
              <DialogDescription>カテゴリごとに今月使う金額の目安を入力してください</DialogDescription>
            </DialogHeader>

            <div className="space-y-3">
              {categoryNames.map((category) => (
                <div key={category} className="flex items-center gap-3">
                  <label
                    htmlFor={`budget-${category}`}
                    className="w-20 shrink-0 text-sm text-foreground"
                  >
                    {category}
                  </label>
                  <Input
                    id={`budget-${category}`}
                    type="number"
                    inputMode="numeric"
                    min={0}
                    placeholder="例: 50000"
                    value={inputValues[category] ?? ""}
                    onChange={(event) =>
                      setInputValues((prev) => ({ ...prev, [category]: event.target.value }))
                    }
                  />
                </div>
              ))}
            </div>

            <DialogFooter>
              <DialogClose asChild>
                <Button variant="ghost">キャンセル</Button>
              </DialogClose>
              <Button onClick={handleSave} disabled={setBudget.isPending}>
                {setBudget.isPending ? "保存中..." : "保存する"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardContent>

      {toast && <Toast {...toast} onDismiss={() => setToast(null)} />}
    </Card>
  );
}
