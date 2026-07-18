"use client";

import { useMemo } from "react";
import { Receipt } from "lucide-react";

import { AiInsightCard } from "@/components/ai/ai-insight-card";
import { ErrorState } from "@/components/common/error-state";
import { FabMenu } from "@/components/common/fab-menu";
import { BottomNavigation } from "@/components/layout/bottom-navigation";
import { Header } from "@/components/layout/header";
import { HeaderDefaultActions } from "@/components/layout/header-actions";
import { useTransactions } from "@/hooks/use-transactions";
import { BOTTOM_NAV_ITEMS } from "@/lib/navigation";
import { filterByMonth, getMonthKey, groupByCategory, groupByMonth, sumAmount } from "@/lib/reports";

import { CategoryPieCard } from "./category-pie-card";
import { CategoryRankingCard } from "./category-ranking-card";
import { MonthlySummaryCard } from "./monthly-summary-card";
import { MonthlyTrendCard } from "./monthly-trend-card";
import { ReportsSkeleton } from "./reports-skeleton";

const TREND_MONTHS_COUNT = 6;

export function ReportsScreen() {
  const { data: transactions, isPending, isError, error, refetch } = useTransactions();

  const currentMonthKey = useMemo(() => getMonthKey(), []);

  const currentMonthTransactions = useMemo(
    () => filterByMonth(transactions ?? [], currentMonthKey),
    [transactions, currentMonthKey]
  );

  const currentMonthTotal = useMemo(
    () => sumAmount(currentMonthTransactions),
    [currentMonthTransactions]
  );

  const categoryBreakdown = useMemo(
    () => groupByCategory(currentMonthTransactions),
    [currentMonthTransactions]
  );

  const monthlyTrend = useMemo(
    () => groupByMonth(transactions ?? [], TREND_MONTHS_COUNT),
    [transactions]
  );

  const isEmpty = (transactions ?? []).length === 0;

  return (
    <div className="min-h-screen bg-background pb-28">
      <Header actions={<HeaderDefaultActions />} />

      <main className="mx-auto flex max-w-2xl flex-col gap-6 px-5 py-7 sm:px-8 sm:py-9">
        <div>
          <h1 className="text-xl font-semibold text-foreground sm:text-2xl">レポート</h1>
          <p className="mt-1 text-sm text-muted-foreground">支出の傾向を確認できます</p>
        </div>

        {isPending ? (
          <ReportsSkeleton />
        ) : isError ? (
          <ErrorState
            title="レポートの取得に失敗しました"
            message={error instanceof Error ? error.message : undefined}
            onRetry={() => refetch()}
          />
        ) : isEmpty ? (
          <div className="flex flex-col items-center gap-2 rounded-2xl border border-dashed border-border/60 py-14 text-center">
            <span className="flex size-12 items-center justify-center rounded-full bg-muted text-muted-foreground">
              <Receipt className="size-6" />
            </span>
            <p className="text-sm font-medium text-foreground">まだ取引がありません</p>
            <p className="text-xs text-muted-foreground">
              取引を登録するとレポートが表示されます
            </p>
          </div>
        ) : (
          <>
            <MonthlySummaryCard
              totalAmount={currentMonthTotal}
              count={currentMonthTransactions.length}
            />
            <AiInsightCard title="AI分析" transactions={transactions ?? []} />
            <CategoryPieCard data={categoryBreakdown} />
            <MonthlyTrendCard data={monthlyTrend} />
            <CategoryRankingCard data={categoryBreakdown} />
          </>
        )}
      </main>

      <FabMenu />

      <BottomNavigation items={BOTTOM_NAV_ITEMS} />
    </div>
  );
}
