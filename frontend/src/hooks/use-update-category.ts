import { useMutation, useQueryClient } from "@tanstack/react-query";

import { updateCategory } from "@/lib/api/categories";
import type { MasterDataUpsertPayload } from "@/types/master-data";

interface UpdateCategoryVariables {
  id: number;
  payload: MasterDataUpsertPayload;
}

export function useUpdateCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: UpdateCategoryVariables) => updateCategory(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
    },
  });
}
