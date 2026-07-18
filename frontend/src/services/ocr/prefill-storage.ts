import type { OcrReceiptResult } from "./types";

/**
 * データ取込センター（Import画面）でOCRした結果を、遷移先の取引登録画面へ
 * 一度だけ引き渡すための一時保存。sessionStorage を使うことで、同一タブ内の
 * 画面遷移をまたいだ受け渡しをURLパラメータなしで行う。
 */
const STORAGE_KEY = "ocrReceiptPrefill";

export function saveOcrPrefill(result: OcrReceiptResult): void {
  sessionStorage.setItem(STORAGE_KEY, JSON.stringify(result));
}

/** 一度読み出したら消費済みとして削除する（画面リロード時に古い値が再適用されないように） */
export function consumeOcrPrefill(): OcrReceiptResult | null {
  const raw = sessionStorage.getItem(STORAGE_KEY);
  if (!raw) return null;

  sessionStorage.removeItem(STORAGE_KEY);

  try {
    return JSON.parse(raw) as OcrReceiptResult;
  } catch {
    return null;
  }
}
