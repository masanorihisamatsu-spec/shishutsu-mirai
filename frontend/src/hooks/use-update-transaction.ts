import { useMutation, useQueryClient } from "@tanstack/react-query";

import { updateTransaction } from "@/lib/api/transactions";
import type { TransactionUpdatePayload } from "@/types/transaction";

interface UpdateTransactionVariables {
  id: number;
  payload: TransactionUpdatePayload;
}

export function useUpdateTransaction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: UpdateTransactionVariables) => updateTransaction(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
    },
  });
}
