import { useQuery } from "@tanstack/react-query";

import { getTransaction } from "@/lib/api/transactions";

interface UseTransactionOptions {
  enabled?: boolean;
}

export function useTransaction(id: number, options: UseTransactionOptions = {}) {
  return useQuery({
    queryKey: ["transactions", id],
    queryFn: () => getTransaction(id),
    enabled: options.enabled ?? true,
  });
}
