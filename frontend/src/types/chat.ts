export type ChatIntentType =
  | "top_category_overspending"
  | "category_amount"
  | "store_amount"
  | "convenience_store"
  | "average_amount"
  | "unknown";

export interface ChatIntent {
  type: ChatIntentType;
  /** category_amount のとき、質問文から一致したカテゴリ名 */
  category?: string;
  /** store_amount のとき、取引履歴から一致した店舗名 */
  storeName?: string;
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  text: string;
  createdAt: string;
}
