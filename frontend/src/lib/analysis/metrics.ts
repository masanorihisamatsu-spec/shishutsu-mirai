/**
 * 取引データから統計値（メトリクス）を算出する純粋関数群。
 * ここではコメント文言は一切生成しない。文言化は insights.ts の責務。
 */

import { filterByMonth, getMonthKey, groupByCategory, sumAmount } from "@/lib/reports";
import type { CategoryExpense, Transaction } from "@/types/expense";

import { isConvenienceStore } from "./convenience-stores";

interface MonthlySplit {
  thisMonth: Transaction[];
  lastMonth: Transaction[];
}

function splitThisAndLastMonth(
  transactions: Transaction[],
  referenceDate: Date = new Date()
): MonthlySplit {
  const thisMonthKey = getMonthKey(referenceDate);
  const lastMonthDate = new Date(referenceDate.getFullYear(), referenceDate.getMonth() - 1, 1);
  const lastMonthKey = getMonthKey(lastMonthDate);
  return {
    thisMonth: filterByMonth(transactions, thisMonthKey),
    lastMonth: filterByMonth(transactions, lastMonthKey),
  };
}

/** 今月最も支出が多いカテゴリ */
export function getTopCategoryThisMonth(transactions: Transaction[]): CategoryExpense | null {
  const { thisMonth } = splitThisAndLastMonth(transactions);
  return groupByCategory(thisMonth)[0] ?? null;
}

export interface CategoryDiff {
  category: string;
  currentAmount: number;
  previousAmount: number;
  diffAmount: number;
  /** 先月の実績が0円の場合は算出不能のため null */
  diffPercent: number | null;
}

/** カテゴリ別の「今月 - 先月」の差額・増減率 */
export function getCategoryDiffs(transactions: Transaction[]): CategoryDiff[] {
  const { thisMonth, lastMonth } = splitThisAndLastMonth(transactions);
  const currentBreakdown = groupByCategory(thisMonth);
  const previousBreakdown = groupByCategory(lastMonth);
  const previousMap = new Map(previousBreakdown.map((item) => [item.category, item.amount]));

  const categories = new Set([
    ...currentBreakdown.map((item) => item.category),
    ...previousMap.keys(),
  ]);

  return Array.from(categories).map((category) => {
    const currentAmount = currentBreakdown.find((item) => item.category === category)?.amount ?? 0;
    const previousAmount = previousMap.get(category) ?? 0;
    const diffAmount = currentAmount - previousAmount;
    const diffPercent = previousAmount > 0 ? Math.round((diffAmount / previousAmount) * 100) : null;
    return { category, currentAmount, previousAmount, diffAmount, diffPercent };
  });
}

/** 急増カテゴリ（先月比 thresholdPercent% 以上増加、かつ先月の実績があるもの）を増加率の降順で返す */
export function getSpikingCategories(
  transactions: Transaction[],
  thresholdPercent = 20
): CategoryDiff[] {
  return getCategoryDiffs(transactions)
    .filter(
      (diff) => diff.previousAmount > 0 && diff.diffPercent !== null && diff.diffPercent >= thresholdPercent
    )
    .sort((a, b) => (b.diffPercent ?? 0) - (a.diffPercent ?? 0));
}

export interface StoreFrequency {
  storeName: string;
  count: number;
  totalAmount: number;
}

function groupByStore(transactions: Transaction[]): StoreFrequency[] {
  const totals = new Map<string, StoreFrequency>();
  for (const transaction of transactions) {
    const existing = totals.get(transaction.storeName);
    if (existing) {
      existing.count += 1;
      existing.totalAmount += transaction.amount;
    } else {
      totals.set(transaction.storeName, {
        storeName: transaction.storeName,
        count: 1,
        totalAmount: transaction.amount,
      });
    }
  }
  return Array.from(totals.values()).sort((a, b) => b.count - a.count);
}

/** 今月、利用件数が多い店舗（上位順） */
export function getTopStoresThisMonth(transactions: Transaction[], limit = 5): StoreFrequency[] {
  const { thisMonth } = splitThisAndLastMonth(transactions);
  return groupByStore(thisMonth).slice(0, limit);
}

export interface StoreFrequencyDiff {
  storeName: string;
  currentCount: number;
  previousCount: number;
  diffCount: number;
}

/** 店舗別の「今月 - 先月」の利用回数の差（利用が増えている店舗を検出するため） */
export function getStoreFrequencyDiffs(transactions: Transaction[]): StoreFrequencyDiff[] {
  const { thisMonth, lastMonth } = splitThisAndLastMonth(transactions);
  const currentCounts = groupByStore(thisMonth);
  const previousCounts = groupByStore(lastMonth);
  const previousMap = new Map(previousCounts.map((item) => [item.storeName, item.count]));

  return currentCounts
    .map((item) => ({
      storeName: item.storeName,
      currentCount: item.count,
      previousCount: previousMap.get(item.storeName) ?? 0,
      diffCount: item.count - (previousMap.get(item.storeName) ?? 0),
    }))
    .sort((a, b) => b.diffCount - a.diffCount);
}

/** 今月のコンビニ利用回数 */
export function getConvenienceStoreVisitCount(transactions: Transaction[]): number {
  const { thisMonth } = splitThisAndLastMonth(transactions);
  return thisMonth.filter((transaction) => isConvenienceStore(transaction.storeName)).length;
}

/** 今月の平均利用金額（1件あたり） */
export function getAverageAmountThisMonth(transactions: Transaction[]): number {
  const { thisMonth } = splitThisAndLastMonth(transactions);
  if (thisMonth.length === 0) return 0;
  return Math.round(sumAmount(thisMonth) / thisMonth.length);
}

export interface WeekdayExpense {
  /** 0=日 1=月 ... 6=土 */
  weekday: number;
  label: string;
  amount: number;
}

const WEEKDAY_LABELS = ["日", "月", "火", "水", "木", "金", "土"];

/** 今月の曜日別支出合計 */
export function getWeekdayBreakdownThisMonth(transactions: Transaction[]): WeekdayExpense[] {
  const { thisMonth } = splitThisAndLastMonth(transactions);
  const totals = new Array(7).fill(0) as number[];
  for (const transaction of thisMonth) {
    const weekday = new Date(transaction.date).getDay();
    totals[weekday] += transaction.amount;
  }
  return totals.map((amount, weekday) => ({ weekday, label: WEEKDAY_LABELS[weekday], amount }));
}

/** 今月、最も支出が多い曜日（支出が全く無い場合は null） */
export function getTopWeekdayThisMonth(transactions: Transaction[]): WeekdayExpense | null {
  const breakdown = getWeekdayBreakdownThisMonth(transactions);
  const top = breakdown.reduce((max, curr) => (curr.amount > max.amount ? curr : max), breakdown[0]);
  return top.amount > 0 ? top : null;
}

/** 今月の支出合計に占める土日（土曜+日曜）の割合（%） */
export function getWeekendRatioThisMonth(transactions: Transaction[]): number {
  const { thisMonth } = splitThisAndLastMonth(transactions);
  const total = sumAmount(thisMonth);
  if (total === 0) return 0;

  const weekendTotal = sumAmount(
    thisMonth.filter((transaction) => {
      const weekday = new Date(transaction.date).getDay();
      return weekday === 0 || weekday === 6;
    })
  );

  return Math.round((weekendTotal / total) * 100);
}
