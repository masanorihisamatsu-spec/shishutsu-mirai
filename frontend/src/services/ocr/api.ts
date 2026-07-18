import { apiFetch } from "@/lib/api-client";

import type { OcrReceiptResult } from "./types";

/** レシート画像をバックエンドのOCRエンジンに送り、認識結果を取得する */
export function scanReceipt(file: File): Promise<OcrReceiptResult> {
  const formData = new FormData();
  formData.append("file", file);

  return apiFetch<OcrReceiptResult>("/ocr/receipts", {
    method: "POST",
    body: formData,
  });
}
