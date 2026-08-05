"use client";

import { useEffect, useMemo, useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Toast, type ToastState } from "@/components/ui/toast";
import { ApiError } from "@/lib/api-client";
import type { Budget } from "@/types/expense";
import type { MasterDataOption } from "@/types/master-data";

interface BudgetSettingsCardProps {
  categories: MasterDataOption[];
  categoriesPending: boolean;
  categoriesError: boolean;
  budgets: Budget[];
  budgetsPending: boolean;
  budgetsError: boolean;
  onSave: (category: string, amount: number) => Promise<unknown>;
}

/** カテゴリごとの月間予算をまとめて編集する。既存の PUT /budgets/{category} をカテゴリ単位で呼び出す */
export function BudgetSettingsCard({
  categories,
  categoriesPending,
  categoriesError,
  budgets,
  budgetsPending,
  budgetsError,
  onSave,
}: BudgetSettingsCardProps) {
  const [inputValues, setInputValues] = useState<Record<string, string>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [toast, setToast] = useState<ToastState | null>(null);
  const hasInitializedRef = useRef(false);

  const budgetByCategory = useMemo(() => {
    const map = new Map<string, number>();
    for (const budget of budgets) {
      map.set(budget.category, budget.amount);
    }
    return map;
  }, [budgets]);

  const isPending = categoriesPending || budgetsPending;
  const isError = categoriesError || budgetsError;

  // データ取得完了時に一度だけ入力欄を初期化する。保存後の再取得で
  // 入力中の値が上書きされないよう、以降はこの effect を再実行しない。
  useEffect(() => {
    if (hasInitializedRef.current || isPending) return;
    hasInitializedRef.current = true;

    const initial: Record<string, string> = {};
    for (const category of categories) {
      const value = budgetByCategory.get(category.name);
      initial[category.name] = value ? String(value) : "";
    }
    setInputValues(initial);
  }, [categories, budgetByCategory, isPending]);

  const handleSave = async () => {
    const changedCategories = categories.filter((category) => {
      const raw = inputValues[category.name];
      const parsed = Number(raw);
      return (
        raw &&
        Number.isFinite(parsed) &&
        parsed > 0 &&
        parsed !== budgetByCategory.get(category.name)
      );
    });

    if (changedCategories.length === 0) return;

    setIsSaving(true);
    try {
      await Promise.all(
        changedCategories.map((category) =>
          onSave(category.name, Number(inputValues[category.name]))
        )
      );
    } catch (error) {
      setToast({
        message:
          error instanceof ApiError
            ? error.message
            : "予算の保存に失敗しました。もう一度お試しください。",
        variant: "error",
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm font-medium text-muted-foreground">予算設定</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {isError ? (
          <p className="text-sm text-destructive">取得に失敗しました。</p>
        ) : isPending ? (
          <p className="text-sm text-muted-foreground">読み込み中...</p>
        ) : categories.length === 0 ? (
          <p className="text-sm text-muted-foreground">カテゴリがまだありません</p>
        ) : (
          <>
            <div className="space-y-3">
              {categories.map((category) => (
                <div key={category.id} className="flex items-center gap-3">
                  <label
                    htmlFor={`settings-budget-${category.id}`}
                    className="w-20 shrink-0 text-sm text-foreground"
                  >
                    {category.name}
                  </label>
                  <Input
                    id={`settings-budget-${category.id}`}
                    type="number"
                    inputMode="numeric"
                    min={0}
                    placeholder="例: 50000"
                    value={inputValues[category.name] ?? ""}
                    onChange={(event) =>
                      setInputValues((prev) => ({ ...prev, [category.name]: event.target.value }))
                    }
                  />
                </div>
              ))}
            </div>

            <Button onClick={handleSave} disabled={isSaving} className="w-full" size="sm">
              {isSaving ? "保存中..." : "保存する"}
            </Button>
          </>
        )}
      </CardContent>

      {toast && <Toast {...toast} onDismiss={() => setToast(null)} />}
    </Card>
  );
}
