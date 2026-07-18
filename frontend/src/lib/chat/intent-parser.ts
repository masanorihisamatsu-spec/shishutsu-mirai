/**
 * ユーザーの自然文からIntent（質問の意図）を判定する。
 * ルールベース（キーワード一致・店舗名の部分一致）で判定し、LLMは使用しない。
 */

import { CATEGORY_OPTIONS } from "@/data/expense-options-dummy-data";
import type { ChatIntent } from "@/types/chat";
import type { Transaction } from "@/types/expense";

const CONVENIENCE_KEYWORDS = ["コンビニ"];
const AVERAGE_KEYWORDS = ["平均"];
// 「多い」のような弱い語は他カテゴリの質問と衝突しやすいため含めない
const OVERSPENDING_KEYWORDS = ["使いすぎ", "使い過ぎ"];

const MIN_STORE_KEYWORD_LENGTH = 3;

export function parseIntent(message: string, transactions: Transaction[]): ChatIntent {
  const normalized = message.trim();

  if (CONVENIENCE_KEYWORDS.some((keyword) => normalized.includes(keyword))) {
    return { type: "convenience_store" };
  }

  if (AVERAGE_KEYWORDS.some((keyword) => normalized.includes(keyword))) {
    return { type: "average_amount" };
  }

  const matchedCategory = CATEGORY_OPTIONS.find((category) => normalized.includes(category));
  if (matchedCategory) {
    return { type: "category_amount", category: matchedCategory };
  }

  if (OVERSPENDING_KEYWORDS.some((keyword) => normalized.includes(keyword))) {
    return { type: "top_category_overspending" };
  }

  const matchedStore = findMatchingStore(normalized, transactions);
  if (matchedStore) {
    return { type: "store_amount", storeName: matchedStore };
  }

  return { type: "unknown" };
}

/**
 * 質問文と取引履歴の店舗名を突き合わせる。
 * - 店舗名がそのまま質問文に含まれる場合（例: "スターバックスはいくら" ⊇ "スターバックス"）
 * - 質問文中の英数字の並び（例: "Amazon"）が店舗名に含まれる場合（例: "Amazon.co.jp"）
 */
function findMatchingStore(message: string, transactions: Transaction[]): string | null {
  const lowerMessage = message.toLowerCase();
  const storeNames = Array.from(new Set(transactions.map((transaction) => transaction.storeName)));

  const alnumMatch = lowerMessage.match(/[a-z0-9]+/);
  const keyword = alnumMatch?.[0];

  for (const storeName of storeNames) {
    const lowerStore = storeName.toLowerCase();
    if (lowerMessage.includes(lowerStore)) return storeName;
    if (keyword && keyword.length >= MIN_STORE_KEYWORD_LENGTH && lowerStore.includes(keyword)) {
      return storeName;
    }
  }

  return null;
}
