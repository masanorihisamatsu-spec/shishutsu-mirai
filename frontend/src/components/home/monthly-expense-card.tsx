"use client";

import { useState } from "react";
import { PiggyBank } from "lucide-react";

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
import { formatCurrency } from "@/lib/format";

interface MonthlyExpenseCardProps {
  amount: number;
  /** null の場合は「予算はまだ設定されていません」の案内とCTAを表示する */
  initialBudget: number | null;
}

export function MonthlyExpenseCard({ amount, initialBudget }: MonthlyExpenseCardProps) {
  const [budget, setBudget] = useState<number | null>(initialBudget);
  const [open, setOpen] = useState(false);
  const [inputValue, setInputValue] = useState("");

  const remaining = budget !== null ? budget - amount : null;
  const usageRate =
    budget !== null && budget > 0 ? Math.min(Math.round((amount / budget) * 100), 100) : null;

  const handleDialogChange = (next: boolean) => {
    setOpen(next);
    if (!next) setInputValue("");
  };

  const handleSave = () => {
    const parsed = Number(inputValue.replaceAll(",", ""));
    if (!Number.isFinite(parsed) || parsed <= 0) return;
    setBudget(parsed);
    setInputValue("");
    setOpen(false);
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

        {budget === null ? (
          <div className="space-y-3 rounded-2xl bg-muted/70 p-4">
            <p className="text-sm font-medium text-muted-foreground">予算はまだ設定されていません</p>

            <Dialog open={open} onOpenChange={handleDialogChange}>
              <DialogTrigger asChild>
                <Button variant="secondary" size="sm" className="w-full">
                  予算を設定する
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>今月の予算を設定</DialogTitle>
                  <DialogDescription>今月使う金額の目安を入力してください</DialogDescription>
                </DialogHeader>

                <Input
                  type="number"
                  inputMode="numeric"
                  min={0}
                  placeholder="例: 50000"
                  value={inputValue}
                  onChange={(event) => setInputValue(event.target.value)}
                  autoFocus
                />

                <DialogFooter>
                  <DialogClose asChild>
                    <Button variant="ghost">キャンセル</Button>
                  </DialogClose>
                  <Button onClick={handleSave} disabled={!inputValue}>
                    保存する
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
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
              <span>予算 {formatCurrency(budget)}</span>
              <span className="font-medium text-foreground">
                残り {formatCurrency(remaining ?? 0)}
              </span>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
