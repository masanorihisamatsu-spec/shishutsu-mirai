"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, PieChart, Receipt, Settings, type LucideIcon } from "lucide-react";

import { cn } from "@/lib/utils";

const BOTTOM_NAV_ICONS = {
  home: Home,
  receipt: Receipt,
  "pie-chart": PieChart,
  settings: Settings,
} satisfies Record<string, LucideIcon>;

export type BottomNavIconName = keyof typeof BOTTOM_NAV_ICONS;

export interface BottomNavigationItem {
  href: string;
  label: string;
  /**
   * アイコン名（文字列）。Lucide のコンポーネント参照そのものは
   * Server Component から Client Component へ渡せない（シリアライズ不可）ため、
   * ここでは string key のみを受け取り、アイコンへの解決はこのコンポーネント内部で行う。
   */
  icon: BottomNavIconName;
}

interface BottomNavigationProps {
  items: BottomNavigationItem[];
  className?: string;
}

export function BottomNavigation({ items, className }: BottomNavigationProps) {
  const pathname = usePathname();

  return (
    <nav
      className={cn(
        "fixed inset-x-0 bottom-0 z-40 border-t border-border/60 bg-card/95 backdrop-blur-md",
        className
      )}
    >
      <div className="mx-auto flex max-w-lg items-center justify-around px-2 py-2">
        {items.map(({ href, label, icon }) => {
          const Icon = BOTTOM_NAV_ICONS[icon];
          const isActive = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex flex-1 flex-col items-center gap-1 rounded-2xl px-3 py-2 text-xs transition-colors",
                isActive ? "text-primary" : "text-muted-foreground hover:text-foreground"
              )}
            >
              <span
                className={cn(
                  "flex size-9 items-center justify-center rounded-full transition-colors",
                  isActive && "bg-primary/10"
                )}
              >
                <Icon className="size-5" strokeWidth={isActive ? 2.4 : 2} />
              </span>
              <span className="font-medium">{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
