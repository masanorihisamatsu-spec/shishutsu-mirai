import type { TransactionFormValues } from "@/types/transaction-form";

import { guessCategoryFromStoreName } from "./category-guess";
import type { OcrReceiptResult } from "./types";

/**
 * OCR結果を取引登録フォームの値へ反映する。
 * 認識できた項目（null でない項目）のみ上書きし、認識できなかった項目は
 * 現在の値（多くの場合は空欄）のまま残すことで、手入力の余地を残す。
 *
 * カテゴリは店舗名からのルールベース推定（availableCategories に実在する場合のみ）。
 * ユーザーが既にカテゴリを選択済みの場合は上書きしない。
 */
export function applyOcrResultToFormValues(
  values: TransactionFormValues,
  result: OcrReceiptResult,
  availableCategories: string[] = []
): TransactionFormValues {
  const guessedCategory = result.store_name
    ? guessCategoryFromStoreName(result.store_name, availableCategories)
    : null;

  return {
    ...values,
    storeName: result.store_name ?? values.storeName,
    date: result.date ?? values.date,
    amount: result.amount !== null ? String(result.amount) : values.amount,
    category: values.category ?? guessedCategory,
  };
}
