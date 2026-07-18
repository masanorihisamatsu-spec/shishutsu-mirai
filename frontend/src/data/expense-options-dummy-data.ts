/**
 * カテゴリ・支払方法の選択肢データ。
 * 取引登録フォーム・取引一覧のカテゴリ絞り込みなど、複数画面で共有する。
 * 将来的には /categories, /payment-methods のようなマスタ取得APIに置き換わる想定。
 */
export const CATEGORY_OPTIONS = ["食費", "交通費", "日用品", "医療費", "趣味", "その他"];

export const PAYMENT_METHOD_OPTIONS = ["現金", "PayPay", "楽天カード", "JCB", "銀行", "その他"];
