/**
 * Intentと取引データから回答文を生成する。
 * analysis/metrics.ts（Sprint 11で実装済みの統計ロジック）を再利用し、
 * ここでは「どの統計値を使い、どう文章にするか」だけを担当する。
 */

import {
  getAverageAmountThisMonth,
  getConvenienceStoreVisitCount,
  getSpikingCategories,
  getTopCategoryThisMonth,
  isConvenienceStore,
} from "@/lib/analysis";
import { formatCurrency } from "@/lib/format";
import { filterByMonth, getMonthKey, sumAmount } from "@/lib/reports";
import type { ChatIntent } from "@/types/chat";
import type { Transaction } from "@/types/expense";

const FALLBACK_ANSWER =
  "ごめんなさい、その質問にはまだお答えできません。「食費はいくら？」「コンビニは？」のように聞いてみてください。";

export function generateAnswer(intent: ChatIntent, transactions: Transaction[]): string {
  if (transactions.length === 0) {
    return "まだ取引データがありません。取引を登録すると質問にお答えできます。";
  }

  switch (intent.type) {
    case "top_category_overspending":
      return answerTopCategoryOverspending(transactions);
    case "category_amount":
      return answerCategoryAmount(transactions, intent.category);
    case "store_amount":
      return answerStoreAmount(transactions, intent.storeName);
    case "convenience_store":
      return answerConvenienceStore(transactions);
    case "average_amount":
      return answerAverageAmount(transactions);
    case "unknown":
    default:
      return FALLBACK_ANSWER;
  }
}

function answerTopCategoryOverspending(transactions: Transaction[]): string {
  const topCategory = getTopCategoryThisMonth(transactions);
  if (!topCategory) return "今月はまだ取引がありません。";

  const spike = getSpikingCategories(transactions).find(
    (item) => item.category === topCategory.category
  );

  if (spike) {
    return `今月は${topCategory.category}が${formatCurrency(topCategory.amount)}で最も多く、先月より${spike.diffPercent}%増えています。`;
  }
  return `今月は${topCategory.category}が${formatCurrency(topCategory.amount)}で最も多く使っています。`;
}

function answerCategoryAmount(transactions: Transaction[], category: string | undefined): string {
  if (!category) return FALLBACK_ANSWER;

  const thisMonth = filterByMonth(transactions, getMonthKey());
  const categoryTransactions = thisMonth.filter((transaction) => transaction.category === category);

  if (categoryTransactions.length === 0) {
    return `今月の${category}の記録はまだありません。`;
  }
  return `今月の${category}は${formatCurrency(sumAmount(categoryTransactions))}です（${categoryTransactions.length}件）。`;
}

function answerStoreAmount(transactions: Transaction[], storeName: string | undefined): string {
  if (!storeName) return FALLBACK_ANSWER;

  const thisMonth = filterByMonth(transactions, getMonthKey());
  const storeTransactions = thisMonth.filter((transaction) => transaction.storeName === storeName);

  if (storeTransactions.length === 0) {
    return `今月は${storeName}の利用記録がありません。`;
  }
  return `今月の${storeName}は${formatCurrency(sumAmount(storeTransactions))}です（${storeTransactions.length}件）。`;
}

function answerConvenienceStore(transactions: Transaction[]): string {
  const thisMonth = filterByMonth(transactions, getMonthKey());
  const count = getConvenienceStoreVisitCount(transactions);

  if (count === 0) {
    return "今月はコンビニの利用記録がありません。";
  }

  const total = sumAmount(thisMonth.filter((transaction) => isConvenienceStore(transaction.storeName)));
  return `今月のコンビニ利用は${count}回、合計${formatCurrency(total)}です。`;
}

function answerAverageAmount(transactions: Transaction[]): string {
  const average = getAverageAmountThisMonth(transactions);
  if (average === 0) return "今月はまだ取引がありません。";
  return `今月の平均利用金額は${formatCurrency(average)}です。`;
}
