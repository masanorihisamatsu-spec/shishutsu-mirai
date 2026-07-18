"use client";

import { useRouter } from "next/navigation";

import { BackHeader } from "@/components/common/back-header";
import { ErrorState } from "@/components/common/error-state";
import { LoadingState } from "@/components/common/loading-state";
import { useTransaction } from "@/hooks/use-transaction";
import type { Transaction } from "@/types/expense";
import type { TransactionFormValues } from "@/types/transaction-form";

import { TransactionForm } from "./transaction-form";

function getTodayDateValue(): string {
  return new Date().toISOString().slice(0, 10);
}

const DEFAULT_FORM_VALUES: TransactionFormValues = {
  date: getTodayDateValue(),
  storeName: "",
  amount: "",
  category: null,
  paymentMethod: null,
  memo: "",
};

function mapTransactionToFormValues(transaction: Transaction): TransactionFormValues {
  return {
    date: transaction.date,
    storeName: transaction.storeName,
    amount: String(transaction.amount),
    category: transaction.category,
    paymentMethod: transaction.paymentMethod,
    memo: transaction.memo ?? "",
  };
}

type TransactionFormScreenProps =
  | { mode: "create" }
  | { mode: "edit"; transactionId: number };

export function TransactionFormScreen(props: TransactionFormScreenProps) {
  const router = useRouter();
  const isEdit = props.mode === "edit";
  const transactionQuery = useTransaction(isEdit ? props.transactionId : 0, {
    enabled: isEdit,
  });

  if (isEdit) {
    if (transactionQuery.isPending) {
      return (
        <div className="min-h-screen bg-background pb-10">
          <BackHeader title="取引編集" onBack={() => router.back()} />
          <main className="mx-auto max-w-2xl px-5 py-7 sm:px-8 sm:py-9">
            <LoadingState />
          </main>
        </div>
      );
    }

    if (transactionQuery.isError) {
      return (
        <div className="min-h-screen bg-background pb-10">
          <BackHeader title="取引編集" onBack={() => router.back()} />
          <main className="mx-auto max-w-2xl px-5 py-7 sm:px-8 sm:py-9">
            <ErrorState
              title="取引の取得に失敗しました"
              message={
                transactionQuery.error instanceof Error
                  ? transactionQuery.error.message
                  : undefined
              }
              onRetry={() => transactionQuery.refetch()}
            />
          </main>
        </div>
      );
    }

    return (
      <TransactionForm
        mode="edit"
        transactionId={props.transactionId}
        initialValues={mapTransactionToFormValues(transactionQuery.data)}
      />
    );
  }

  return <TransactionForm mode="create" initialValues={DEFAULT_FORM_VALUES} />;
}
