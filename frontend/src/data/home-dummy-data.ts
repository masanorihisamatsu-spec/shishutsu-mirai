import type { CategoryExpense, Transaction } from "@/types/expense";

/**
 * ホーム画面のダミーデータ。
 * Sprint 2 系はフロントエンドのみの実装のため、API接続の代わりにここで固定値を管理する。
 * 将来 API 化する際は同じ形（CategoryExpense[] / Transaction[]）を返すエンドポイントに置き換える想定。
 */

export const todayExpenseDummy = 2350;

export const monthlyExpenseDummy = 42300;

/**
 * MonthlyExpenseCard の初期予算（画面内でダイアログから変更可能）。
 * null の場合「予算はまだ設定されていません」+「予算を設定する」ボタンを表示する。
 * Sprint 2-1 は予算未設定パターンで実装するため null にしている。
 */
export const monthlyBudgetDummy: number | null = null;

export const categoryBreakdownDummy: CategoryExpense[] = [
  { category: "食費", amount: 18000, color: "#C98A8E" },
  { category: "日用品", amount: 8500, color: "#B9A38C" },
  { category: "交通費", amount: 6800, color: "#8C9BA6" },
  { category: "趣味", amount: 6000, color: "#C9A96E" },
  { category: "医療費", amount: 3000, color: "#8FA377" },
];

export const recentTransactionsDummy: Transaction[] = [
  { id: "t1", storeName: "スーパーマルエツ", category: "食費", amount: 1280, date: "2026-07-16", paymentMethod: "楽天カード" },
  { id: "t2", storeName: "マツモトキヨシ", category: "日用品", amount: 2140, date: "2026-07-15", paymentMethod: "PayPay" },
  { id: "t3", storeName: "Suicaチャージ", category: "交通費", amount: 3000, date: "2026-07-15", paymentMethod: "銀行" },
  { id: "t4", storeName: "さくら薬局", category: "医療費", amount: 1500, date: "2026-07-14", paymentMethod: "現金" },
  { id: "t5", storeName: "蔦屋書店", category: "趣味", amount: 2800, date: "2026-07-13", paymentMethod: "JCB" },
];
