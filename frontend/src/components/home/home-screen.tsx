"use client";

import { AiInsightCard } from "@/components/ai/ai-insight-card";
import { FabMenu } from "@/components/common/fab-menu";
import { BottomNavigation } from "@/components/layout/bottom-navigation";
import { Header } from "@/components/layout/header";
import { HeaderDefaultActions } from "@/components/layout/header-actions";
import {
  categoryBreakdownDummy,
  monthlyBudgetDummy,
  monthlyExpenseDummy,
  recentTransactionsDummy,
  todayExpenseDummy,
} from "@/data/home-dummy-data";
import { useTransactions } from "@/hooks/use-transactions";
import { BOTTOM_NAV_ITEMS } from "@/lib/navigation";

import { CategoryBreakdownCard } from "./category-breakdown-card";
import { GreetingSection } from "./greeting-section";
import { MonthlyExpenseCard } from "./monthly-expense-card";
import { RecentTransactionsCard } from "./recent-transactions-card";
import { TodayExpenseCard } from "./today-expense-card";

export function HomeScreen() {
  const { data: transactions, isPending, isError } = useTransactions();

  return (
    <div className="min-h-screen bg-background pb-28">
      <Header actions={<HeaderDefaultActions />} />

      <main className="mx-auto flex max-w-2xl flex-col gap-7 px-5 py-7 sm:px-8 sm:py-9">
        <GreetingSection />

        <TodayExpenseCard amount={todayExpenseDummy} />

        <MonthlyExpenseCard amount={monthlyExpenseDummy} initialBudget={monthlyBudgetDummy} />

        <CategoryBreakdownCard data={categoryBreakdownDummy} />

        <AiInsightCard
          title="みらいくん"
          transactions={transactions ?? []}
          isLoading={isPending}
          isError={isError}
        />

        <RecentTransactionsCard transactions={recentTransactionsDummy} />
      </main>

      <FabMenu />

      <BottomNavigation items={BOTTOM_NAV_ITEMS} />
    </div>
  );
}
