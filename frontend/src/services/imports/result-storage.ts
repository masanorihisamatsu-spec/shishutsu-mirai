import type { ImportResultResponse } from "./types";

/**
 * データ取込センターでの取込結果を、遷移先のインポート結果画面へ一度だけ
 * 引き渡すための一時保存。frontend/src/services/ocr/prefill-storage.ts と同じ考え方。
 */
const STORAGE_KEY = "importResult";

export function saveImportResult(result: ImportResultResponse): void {
  sessionStorage.setItem(STORAGE_KEY, JSON.stringify(result));
}

/** 一度読み出したら消費済みとして削除する（画面リロード時に古い結果が再表示されないように） */
export function consumeImportResult(): ImportResultResponse | null {
  const raw = sessionStorage.getItem(STORAGE_KEY);
  if (!raw) return null;

  sessionStorage.removeItem(STORAGE_KEY);

  try {
    return JSON.parse(raw) as ImportResultResponse;
  } catch {
    return null;
  }
}
