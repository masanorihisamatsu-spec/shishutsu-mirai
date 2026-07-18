import type { TransactionFormValues } from "@/types/transaction-form";

import type { OcrReceiptResult } from "./types";

/**
 * OCR結果を取引登録フォームの値へ反映する。
 * 認識できた項目（null でない項目）のみ上書きし、認識できなかった項目は
 * 現在の値（多くの場合は空欄）のまま残すことで、手入力の余地を残す。
 */
export function applyOcrResultToFormValues(
  values: TransactionFormValues,
  result: OcrReceiptResult
): TransactionFormValues {
  return {
    ...values,
    storeName: result.store_name ?? values.storeName,
    date: result.date ?? values.date,
    amount: result.amount !== null ? String(result.amount) : values.amount,
  };
}
