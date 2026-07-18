import { TransactionFormScreen } from "@/components/transaction-form/transaction-form-screen";

interface EditTransactionPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditTransactionPage({ params }: EditTransactionPageProps) {
  const { id } = await params;
  return <TransactionFormScreen mode="edit" transactionId={Number(id)} />;
}
