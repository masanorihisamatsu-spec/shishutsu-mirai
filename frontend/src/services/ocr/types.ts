/**
 * バックエンドの OcrReceiptResult スキーマ（backend/app/schemas/ocr.py）に対応するレスポンス型。
 * 認識できなかった項目は null になる。
 */
export interface OcrReceiptResult {
  store_name: string | null;
  date: string | null;
  amount: number | null;
  receipt_image: string;
  raw_text: string;
}
