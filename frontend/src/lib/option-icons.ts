import {
  Banknote,
  Car,
  CreditCard,
  Gamepad2,
  Landmark,
  Package,
  Pill,
  QrCode,
  ShoppingBasket,
  UtensilsCrossed,
  Wallet,
  type LucideIcon,
} from "lucide-react";

/** カテゴリ名 → アイコン。表示専用のマッピングなので domain 型（types/）や data/ には持たせない */
export const CATEGORY_ICONS: Record<string, LucideIcon> = {
  食費: UtensilsCrossed,
  交通費: Car,
  日用品: ShoppingBasket,
  医療費: Pill,
  趣味: Gamepad2,
  その他: Package,
};

/** 支払方法名 → アイコン */
export const PAYMENT_METHOD_ICONS: Record<string, LucideIcon> = {
  現金: Banknote,
  PayPay: QrCode,
  楽天カード: CreditCard,
  JCB: CreditCard,
  銀行: Landmark,
  その他: Wallet,
};
