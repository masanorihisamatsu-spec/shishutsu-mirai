import { useQuery } from "@tanstack/react-query";

import { listTransactions } from "@/lib/api/transactions";

export function useTransactions() {
  return useQuery({
    queryKey: ["transactions"],
    queryFn: listTransactions,
  });
}
