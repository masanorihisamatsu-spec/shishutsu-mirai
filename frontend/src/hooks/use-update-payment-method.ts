import { useMutation, useQueryClient } from "@tanstack/react-query";

import { updatePaymentMethod } from "@/lib/api/payment-methods";
import type { MasterDataUpsertPayload } from "@/types/master-data";

interface UpdatePaymentMethodVariables {
  id: number;
  payload: MasterDataUpsertPayload;
}

export function useUpdatePaymentMethod() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: UpdatePaymentMethodVariables) => updatePaymentMethod(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["paymentMethods"] });
    },
  });
}
