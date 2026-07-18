import type { ImportMethod, UpcomingIntegration } from "@/types/import";

/**
 * データ取込センターのダミーデータ。
 * Sprint 4 はフロントエンドのみの実装のため、API/OCR接続の代わりにここで固定値を管理する。
 */
export const importMethodsDummy: ImportMethod[] = [
  {
    id: "receipt",
    title: "レシート撮影",
    description: "AIが自動で読み取ります",
    actionLabel: "取り込む",
  },
  {
    id: "pdf",
    title: "PDF",
    description: "カード会社・PayPayなどのPDF",
    actionLabel: "取り込む",
  },
  {
    id: "csv",
    title: "CSV",
    description: "対応サービスの明細CSVを取り込みます",
    supportedSources: ["PayPay", "楽天カード", "JCB"],
    actionLabel: "取り込む",
  },
  {
    id: "excel",
    title: "Excel",
    description: "Excel家計簿",
    actionLabel: "取り込む",
  },
];

export const upcomingIntegrationsDummy: UpcomingIntegration[] = [
  { id: "bank", label: "銀行連携" },
  { id: "google-drive", label: "Google Drive" },
  { id: "dropbox", label: "Dropbox" },
];
