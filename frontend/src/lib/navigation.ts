import type { BottomNavigationItem } from "@/components/layout/bottom-navigation";

/** 全画面共通のBottom Navigation項目。画面を追加したらここに1行加えるだけでよい */
export const BOTTOM_NAV_ITEMS: BottomNavigationItem[] = [
  { href: "/", label: "ホーム", icon: "home" },
  { href: "/transactions", label: "取引", icon: "receipt" },
  { href: "/reports", label: "レポート", icon: "pie-chart" },
  { href: "/settings", label: "設定", icon: "settings" },
];
