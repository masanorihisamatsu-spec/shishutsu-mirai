import { useMutation, useQueryClient } from "@tanstack/react-query";

import { createPaymentMethod } from "@/lib/api/payment-methods";

export function useCreatePaymentMethod() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createPaymentMethod,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["paymentMethods"] });
    },
  });
}
