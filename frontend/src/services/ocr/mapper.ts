import type { TransactionFormValues } from "@/types/transaction-form";

import { guessCategoryFromStoreName } from "./category-guess";
import type { OcrReceiptResult } from "./types";

/**
 * OCR結果を取引登録フォームの値へ反映する。
 * 認識できた項目（null でない項目）のみ上書きし、認識できなかった項目は
 * 現在の値（多くの場合は空欄）のまま残すことで、手入力の余地を残す。
 *
 * カテゴリ・支払方法はどちらも「ユーザーが実際に登録している一覧に存在する場合のみ」
 * 適用する（availableCategories / availablePaymentMethods）。ユーザーが既に選択済みの
 * 項目は上書きしない。
 * バックエンド（backend/app/services/ocr/service.py）はOCR生テキストの候補・採用結果を
 * ログ出力するが、ユーザーのカテゴリ一覧を持たないため、カテゴリ候補と最終適用結果は
 * ここでログ出力する（支払方法の「候補」自体はバックエンドのログを参照）。
 */
export function applyOcrResultToFormValues(
  values: TransactionFormValues,
  result: OcrReceiptResult,
  availableCategories: string[] = [],
  availablePaymentMethods: string[] = []
): TransactionFormValues {
  const guessedCategory = result.store_name
    ? guessCategoryFromStoreName(result.store_name, availableCategories)
    : null;
  const appliedCategory = values.category ?? guessedCategory;

  const appliedPaymentMethod =
    values.paymentMethod ??
    (result.payment_method && availablePaymentMethods.includes(result.payment_method)
      ? result.payment_method
      : null);

  console.info("[OCR] カテゴリ推定:", {
    storeName: result.store_name,
    候補: guessedCategory,
    採用: appliedCategory,
  });
  console.info("[OCR] 支払方法:", {
    候補: result.payment_method,
    採用: appliedPaymentMethod,
  });

  return {
    ...values,
    storeName: result.store_name ?? values.storeName,
    date: result.date ?? values.date,
    amount: result.amount !== null ? String(result.amount) : values.amount,
    category: appliedCategory,
    paymentMethod: appliedPaymentMethod,
  };
}
