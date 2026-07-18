import type { ReactNode } from "react";
import { Wallet } from "lucide-react";

import { cn } from "@/lib/utils";

interface HeaderProps {
  title?: string;
  actions?: ReactNode;
  className?: string;
}

export function Header({ title = "支出管理みらい", actions, className }: HeaderProps) {
  return (
    <header
      className={cn(
        "sticky top-0 z-40 flex items-center justify-between gap-4 border-b border-border/60 bg-background/80 px-5 py-4 backdrop-blur-md sm:px-8",
        className
      )}
    >
      <div className="flex items-center gap-2.5">
        <span className="flex size-9 items-center justify-center rounded-full bg-primary/10 text-primary">
          <Wallet className="size-4" strokeWidth={2} />
        </span>
        <span className="text-base font-semibold tracking-tight text-foreground">{title}</span>
      </div>
      {actions ? <div className="flex items-center gap-2">{actions}</div> : null}
    </header>
  );
}
