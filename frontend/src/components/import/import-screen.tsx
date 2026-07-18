"use client";

import { useRouter } from "next/navigation";
import { useRef, useState, type ChangeEvent } from "react";
import { Box, Camera, FileSpreadsheet, FileText, HardDrive, Landmark, Table } from "lucide-react";
import type { LucideIcon } from "lucide-react";

import { LoadingState } from "@/components/common/loading-state";
import { BottomNavigation } from "@/components/layout/bottom-navigation";
import { Header } from "@/components/layout/header";
import { HeaderDefaultActions } from "@/components/layout/header-actions";
import { Toast, type ToastState } from "@/components/ui/toast";
import { importMethodsDummy, upcomingIntegrationsDummy } from "@/data/import-dummy-data";
import { useImportFile } from "@/hooks/use-import-file";
import { useScanReceipt } from "@/hooks/use-scan-receipt";
import { ApiError } from "@/lib/api-client";
import { BOTTOM_NAV_ITEMS } from "@/lib/navigation";
import { saveImportResult } from "@/services/imports";
import { saveOcrPrefill } from "@/services/ocr";
import type { ImportMethodId } from "@/types/import";

import { ImportMethodCard } from "./import-method-card";
import { UpcomingIntegrations } from "./upcoming-integrations";

const IMPORT_METHOD_ICONS: Record<ImportMethodId, LucideIcon> = {
  receipt: Camera,
  pdf: FileText,
  csv: Table,
  excel: FileSpreadsheet,
};

const UPCOMING_INTEGRATION_ICONS: Record<string, LucideIcon> = {
  bank: Landmark,
  "google-drive": HardDrive,
  dropbox: Box,
};

export function ImportScreen() {
  const router = useRouter();
  const receiptInputRef = useRef<HTMLInputElement>(null);
  const csvInputRef = useRef<HTMLInputElement>(null);
  const pdfInputRef = useRef<HTMLInputElement>(null);
  const excelInputRef = useRef<HTMLInputElement>(null);
  const scanReceipt = useScanReceipt();
  const importFile = useImportFile();
  const [toast, setToast] = useState<ToastState | null>(null);

  const handleReceiptFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] ?? null;
    // 同じファイルを選び直した時にも onChange が発火するようにリセットしておく
    event.target.value = "";
    if (!file) return;

    scanReceipt.mutate(file, {
      onSuccess: (result) => {
        saveOcrPrefill(result);
        router.push("/transactions/new");
      },
      onError: (error) => {
        setToast({
          message:
            error instanceof ApiError
              ? error.message
              : "レシートの読み取りに失敗しました。もう一度お試しください。",
          variant: "error",
        });
      },
    });
  };

  const handleImportFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] ?? null;
    event.target.value = "";
    if (!file) return;

    importFile.mutate(file, {
      onSuccess: (result) => {
        saveImportResult(result);
        router.push("/import/result");
      },
      onError: (error) => {
        setToast({
          message:
            error instanceof ApiError
              ? error.message
              : "ファイルの取り込みに失敗しました。もう一度お試しください。",
          variant: "error",
        });
      },
    });
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      <Header actions={<HeaderDefaultActions />} />

      <main className="mx-auto flex max-w-2xl flex-col gap-6 px-5 py-7 sm:px-8 sm:py-9">
        <div>
          <h1 className="text-xl font-semibold text-foreground sm:text-2xl">データ取込センター</h1>
          <p className="mt-1.5 text-sm text-muted-foreground">
            レシートやカード明細などをまとめて取り込めます。
          </p>
        </div>

        <input
          ref={receiptInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          onChange={handleReceiptFileChange}
          className="hidden"
        />
        <input
          ref={csvInputRef}
          type="file"
          accept=".csv,text/csv"
          onChange={handleImportFileChange}
          className="hidden"
        />
        <input
          ref={pdfInputRef}
          type="file"
          accept=".pdf,application/pdf"
          onChange={handleImportFileChange}
          className="hidden"
        />
        <input
          ref={excelInputRef}
          type="file"
          accept=".xlsx,.xls,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
          onChange={handleImportFileChange}
          className="hidden"
        />

        <div className="flex flex-col gap-4">
          {importMethodsDummy.map((method) => {
            const inputRef = {
              receipt: receiptInputRef,
              csv: csvInputRef,
              pdf: pdfInputRef,
              excel: excelInputRef,
            }[method.id];

            return (
              <ImportMethodCard
                key={method.id}
                method={method}
                icon={IMPORT_METHOD_ICONS[method.id]}
                onImport={() => inputRef.current?.click()}
              />
            );
          })}
        </div>

        {scanReceipt.isPending && <LoadingState message="レシートを読み取っています..." />}
        {importFile.isPending && <LoadingState message="ファイルを取り込んでいます..." />}

        <UpcomingIntegrations items={upcomingIntegrationsDummy} icons={UPCOMING_INTEGRATION_ICONS} />
      </main>

      <BottomNavigation items={BOTTOM_NAV_ITEMS} />

      {toast && <Toast {...toast} onDismiss={() => setToast(null)} />}
    </div>
  );
}
