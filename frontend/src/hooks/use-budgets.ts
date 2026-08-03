import { useQuery } from "@tanstack/react-query";

import { listBudgets } from "@/lib/api/budgets";

export function useBudgets() {
  return useQuery({
    queryKey: ["budgets"],
    queryFn: listBudgets,
  });
}
