import { useMutation, useQueryClient } from "@tanstack/react-query";

import { setBudget } from "@/lib/api/budgets";

interface SetBudgetVariables {
  category: string;
  amount: number;
}

export function useSetBudget() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ category, amount }: SetBudgetVariables) => setBudget(category, { amount }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["budgets"] });
    },
  });
}
