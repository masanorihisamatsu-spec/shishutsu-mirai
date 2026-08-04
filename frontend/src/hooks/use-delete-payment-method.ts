import { useMutation, useQueryClient } from "@tanstack/react-query";

import { deletePaymentMethod } from "@/lib/api/payment-methods";

export function useDeletePaymentMethod() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => deletePaymentMethod(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["paymentMethods"] });
    },
  });
}
