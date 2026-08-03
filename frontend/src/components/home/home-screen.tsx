"use client";

import { useMemo } from "react";

import { AiInsightCard } from "@/components/ai/ai-insight-card";
import { FabMenu } from "@/components/common/fab-menu";
import { BottomNavigation } from "@/components/layout/bottom-navigation";
import { Header } from "@/components/layout/header";
import { HeaderDefaultActions } from "@/components/layout/header-actions";
import { useTransactions } from "@/hooks/use-transactions";
import { BOTTOM_NAV_ITEMS } from "@/lib/navigation";
import {
  filterByDate,
  filterByMonth,
  getMonthKey,
  getTodayKey,
  groupByCategory,
  sumAmount,
} from "@/lib/reports";

import { CategoryBreakdownCard } from "./category-breakdown-card";
import { GreetingSection } from "./greeting-section";
import { MonthlyExpenseCard } from "./monthly-expense-card";
import { RecentTransactionsCard } from "./recent-transactions-card";
import { TodayExpenseCard } from "./today-expense-card";

const RECENT_TRANSACTIONS_COUNT = 5;

export function HomeScreen() {
  const { data: transactions, isPending, isError } = useTransactions();

  const todayExpense = useMemo(
    () => sumAmount(filterByDate(transactions ?? [], getTodayKey())),
    [transactions]
  );

  const currentMonthTransactions = useMemo(
    () => filterByMonth(transactions ?? [], getMonthKey()),
    [transactions]
  );

  const monthlyExpense = useMemo(
    () => sumAmount(currentMonthTransactions),
    [currentMonthTransactions]
  );

  const categoryBreakdown = useMemo(
    () => groupByCategory(currentMonthTransactions),
    [currentMonthTransactions]
  );

  const recentTransactions = useMemo(
    () =>
      [...(transactions ?? [])]
        .sort((a, b) => b.date.localeCompare(a.date))
        .slice(0, RECENT_TRANSACTIONS_COUNT),
    [transactions]
  );

  return (
    <div className="min-h-screen bg-background pb-28">
      <Header actions={<HeaderDefaultActions />} />

      <main className="mx-auto flex max-w-2xl flex-col gap-7 px-5 py-7 sm:px-8 sm:py-9">
        <GreetingSection />

        <TodayExpenseCard amount={todayExpense} />

        <MonthlyExpenseCard amount={monthlyExpense} />

        <CategoryBreakdownCard data={categoryBreakdown} />

        <AiInsightCard
          title="みらいくん"
          transactions={transactions ?? []}
          isLoading={isPending}
          isError={isError}
        />

        <RecentTransactionsCard transactions={recentTransactions} />
      </main>

      <FabMenu />

      <BottomNavigation items={BOTTOM_NAV_ITEMS} />
    </div>
  );
}
