import { getCategoryColor } from "@/lib/category-colors";
import type { CategoryExpense, MonthlyTotal, Transaction } from "@/types/expense";

/** 対象日時が属する月を "2026-07" 形式で返す */
export function getMonthKey(date: Date = new Date()): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}

/** "2026-07-16" のような ISO 日付文字列から月キー ("2026-07") を取り出す */
export function getMonthKeyFromDate(isoDate: string): string {
  return isoDate.slice(0, 7);
}

/** 対象日時を "2026-07-16" 形式で返す（ローカルタイム基準） */
export function getTodayKey(date: Date = new Date()): string {
  return `${getMonthKey(date)}-${String(date.getDate()).padStart(2, "0")}`;
}

export function filterByMonth(transactions: Transaction[], monthKey: string): Transaction[] {
  return transactions.filter((transaction) => getMonthKeyFromDate(transaction.date) === monthKey);
}

export function filterByDate(transactions: Transaction[], dateKey: string): Transaction[] {
  return transactions.filter((transaction) => transaction.date === dateKey);
}

export function sumAmount(transactions: Transaction[]): number {
  return transactions.reduce((total, transaction) => total + transaction.amount, 0);
}

/** カテゴリ別の支出合計を金額の降順で返す（円グラフ・ランキング共通のデータソース） */
export function groupByCategory(transactions: Transaction[]): CategoryExpense[] {
  const totals = new Map<string, number>();
  for (const transaction of transactions) {
    totals.set(transaction.category, (totals.get(transaction.category) ?? 0) + transaction.amount);
  }

  return Array.from(totals.entries())
    .map(([category, amount]) => ({ category, amount, color: getCategoryColor(category) }))
    .sort((a, b) => b.amount - a.amount);
}

/**
 * 直近 monthsCount ヶ月分（当月含む）の月別支出合計を古い月→新しい月の順で返す。
 * データが存在しない月も 0円 として含める（棒グラフの推移を欠落なく表示するため）。
 */
export function groupByMonth(
  transactions: Transaction[],
  monthsCount: number,
  referenceDate: Date = new Date()
): MonthlyTotal[] {
  const months: MonthlyTotal[] = [];
  for (let offset = monthsCount - 1; offset >= 0; offset -= 1) {
    const target = new Date(referenceDate.getFullYear(), referenceDate.getMonth() - offset, 1);
    months.push({
      monthKey: getMonthKey(target),
      label: `${target.getMonth() + 1}月`,
      amount: 0,
    });
  }

  const indexByMonthKey = new Map(months.map((month, index) => [month.monthKey, index]));
  for (const transaction of transactions) {
    const index = indexByMonthKey.get(getMonthKeyFromDate(transaction.date));
    if (index !== undefined) {
      months[index].amount += transaction.amount;
    }
  }

  return months;
}

export function getPercentage(amount: number, total: number): number {
  return total > 0 ? Math.round((amount / total) * 100) : 0;
}
