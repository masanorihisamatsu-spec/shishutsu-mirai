import { useMutation, useQueryClient } from "@tanstack/react-query";

import { importFile } from "@/services/imports";

export function useImportFile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: importFile,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
    },
  });
}
