import { useMutation, useQueryClient } from "@tanstack/react-query";

import { deleteCategory } from "@/lib/api/categories";

export function useDeleteCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => deleteCategory(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
    },
  });
}
