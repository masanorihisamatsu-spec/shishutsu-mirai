import { apiFetch } from "@/lib/api-client";

import type { ImportResultResponse } from "./types";

/** CSV / PDF / Excel ファイルをバックエンドへ送り、取込結果を取得する */
export function importFile(file: File): Promise<ImportResultResponse> {
  const formData = new FormData();
  formData.append("file", file);

  return apiFetch<ImportResultResponse>("/imports", {
    method: "POST",
    body: formData,
  });
}
