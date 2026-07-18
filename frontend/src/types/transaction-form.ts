export interface TransactionFormValues {
  date: string;
  storeName: string;
  /** number ではなく input の生値。保存直前に数値へ変換する */
  amount: string;
  category: string | null;
  paymentMethod: string | null;
  memo: string;
}
