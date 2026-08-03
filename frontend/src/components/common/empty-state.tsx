import { Receipt } from "lucide-react";
import type { LucideIcon } from "lucide-react";

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  message?: string;
}

/** データが0件のときの共通プレースホルダー。LoadingState / ErrorState と対になる第3の状態。 */
export function EmptyState({ icon: Icon = Receipt, title, message }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center gap-2 rounded-2xl border border-dashed border-border/60 py-14 text-center">
      <span className="flex size-12 items-center justify-center rounded-full bg-muted text-muted-foreground">
        <Icon className="size-6" />
      </span>
      <p className="text-sm font-medium text-foreground">{title}</p>
      {message && <p className="text-xs text-muted-foreground">{message}</p>}
    </div>
  );
}
