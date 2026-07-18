import type { LucideIcon } from "lucide-react";

import { cn } from "@/lib/utils";

export interface OptionTileGridItem {
  value: string;
  icon: LucideIcon;
}

interface OptionTileGridProps {
  options: OptionTileGridItem[];
  value: string | null;
  onChange: (value: string) => void;
}

/** アイコン付きの単一選択タイル。カテゴリ・支払方法の両方から再利用する */
export function OptionTileGrid({ options, value, onChange }: OptionTileGridProps) {
  return (
    <div className="grid grid-cols-3 gap-2">
      {options.map(({ value: optionValue, icon: Icon }) => {
        const selected = value === optionValue;
        return (
          <button
            key={optionValue}
            type="button"
            onClick={() => onChange(optionValue)}
            aria-pressed={selected}
            className={cn(
              "flex flex-col items-center gap-1.5 rounded-2xl border p-3 text-xs font-medium transition-colors",
              selected
                ? "border-primary bg-primary/10 text-primary"
                : "border-border/60 bg-card text-muted-foreground hover:border-border hover:bg-accent"
            )}
          >
            <Icon className="size-5" />
            <span className="text-center leading-tight">{optionValue}</span>
          </button>
        );
      })}
    </div>
  );
}
