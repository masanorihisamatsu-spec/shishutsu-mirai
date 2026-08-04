import { useQuery } from "@tanstack/react-query";

import { listPaymentMethods } from "@/lib/api/payment-methods";

export function usePaymentMethods() {
  return useQuery({
    queryKey: ["paymentMethods"],
    queryFn: listPaymentMethods,
  });
}
