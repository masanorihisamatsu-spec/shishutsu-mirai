/**
 * metrics.ts が算出した統計値から、ルールベースでAIコメント（Insight）を生成する。
 *
 * 将来LLMに置き換える場合は、この「metricsを見てコメント文言を組み立てる」部分だけを
 * LLM呼び出しに差し替えればよい。metrics.ts の統計値算出ロジックはそのまま利用できる
 * （算出済みの数値を要約としてプロンプトに渡す想定）。詳細は本ファイル末尾のコメントを参照。
 */

import { formatCurrency } from "@/lib/format";
import type { Insight } from "@/types/analysis";
import type { Transaction } from "@/types/expense";

import {
  getAverageAmountThisMonth,
  getConvenienceStoreVisitCount,
  getSpikingCategories,
  getStoreFrequencyDiffs,
  getTopCategoryThisMonth,
  getTopStoresThisMonth,
  getTopWeekdayThisMonth,
  getWeekendRatioThisMonth,
} from "./metrics";

const EATING_OUT_CATEGORY = "食費";
const SPIKE_THRESHOLD_PERCENT = 20;
const STORE_INCREASE_THRESHOLD = 2;
const CONVENIENCE_VISIT_THRESHOLD = 5;
const TOP_STORE_VISIT_THRESHOLD = 3;
const WEEKEND_RATIO_THRESHOLD = 50;

/** ルールベースで取引データからAIコメント一覧を生成する（優先度の降順） */
export function generateInsights(transactions: Transaction[]): Insight[] {
  if (transactions.length === 0) return [];

  const insights: Insight[] = [];

  // 急増カテゴリ（先月比+20%以上）: 最も注意を引くべき情報として最優先
  for (const spike of getSpikingCategories(transactions, SPIKE_THRESHOLD_PERCENT)) {
    insights.push({
      id: `spike-${spike.category}`,
      message: `${spike.category}が先月より${spike.diffPercent}%増えています。`,
      priority: 90 + Math.min(spike.diffPercent ?? 0, 100),
    });
  }

  // 利用回数が増えている店舗
  const increasingStores = getStoreFrequencyDiffs(transactions).filter(
    (diff) => diff.diffCount >= STORE_INCREASE_THRESHOLD
  );
  for (const store of increasingStores.slice(0, 2)) {
    insights.push({
      id: `store-increase-${store.storeName}`,
      message: `${store.storeName}利用が増えています。`,
      priority: 75,
    });
  }

  const topCategory = getTopCategoryThisMonth(transactions);
  if (topCategory) {
    if (topCategory.category === EATING_OUT_CATEGORY) {
      insights.push({
        id: "eating-out-trend",
        message: "今月は外食が多い傾向です。",
        priority: 65,
      });
    } else {
      insights.push({
        id: "top-category",
        message: `${topCategory.category}が今月最も支出の多いカテゴリです（${formatCurrency(topCategory.amount)}）。`,
        priority: 30,
      });
    }
  }

  // 曜日別: 最多曜日
  const topWeekday = getTopWeekdayThisMonth(transactions);
  if (topWeekday) {
    insights.push({
      id: "top-weekday",
      message: `${topWeekday.label}曜日の支出が最も多いです。`,
      priority: 55,
    });
  }

  // 土日割合
  const weekendRatio = getWeekendRatioThisMonth(transactions);
  if (weekendRatio >= WEEKEND_RATIO_THRESHOLD) {
    insights.push({
      id: "weekend-ratio",
      message: `支出の${weekendRatio}%が土日に集中しています。`,
      priority: 50,
    });
  }

  // コンビニ利用回数
  const convenienceCount = getConvenienceStoreVisitCount(transactions);
  if (convenienceCount >= CONVENIENCE_VISIT_THRESHOLD) {
    insights.push({
      id: "convenience-count",
      message: `コンビニ利用が${convenienceCount}回あります。`,
      priority: 45,
    });
  }

  // 件数が多い店舗
  const topStore = getTopStoresThisMonth(transactions, 1)[0];
  if (topStore && topStore.count >= TOP_STORE_VISIT_THRESHOLD) {
    insights.push({
      id: "top-store",
      message: `${topStore.storeName}の利用が${topStore.count}回あります。`,
      priority: 40,
    });
  }

  // 平均利用金額: 他の条件に当てはまらない月でも必ず1件は出せる保険的なベースライン
  const average = getAverageAmountThisMonth(transactions);
  if (average > 0) {
    insights.push({
      id: "average-amount",
      message: `今月の平均利用金額は${formatCurrency(average)}です。`,
      priority: 10,
    });
  }

  return insights.sort((a, b) => b.priority - a.priority);
}

/**
 * 【今後LLMへ置き換える方法】
 * 1. metrics.ts の各関数（getSpikingCategories 等）で算出した統計値を、
 *    そのままJSON要約として組み立てる（本関数の insights.push 直前の値がそれに当たる）。
 * 2. その要約を prompt に埋め込み、バックエンドに新設する
 *    POST /analysis/insights のようなエンドポイント経由でLLM（Claude等）を呼び出す。
 * 3. LLMの応答（コメント文字列の配列）を Insight[] に詰め替えて返す。
 * 4. generateInsights の呼び出し側（AiInsightCard）は async 関数に変わる程度で、
 *    UI側の変更はローディング状態の追加のみで済む。
 */
