import { useMutation } from "@tanstack/react-query";

import { scanReceipt } from "@/services/ocr";

export function useScanReceipt() {
  return useMutation({
    mutationFn: scanReceipt,
  });
}
