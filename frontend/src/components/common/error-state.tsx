import { AlertCircle } from "lucide-react";

import { Button } from "@/components/ui/button";

interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
}

export function ErrorState({
  title = "データの取得に失敗しました",
  message,
  onRetry,
}: ErrorStateProps) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-2xl border border-destructive/30 bg-destructive/5 py-16 text-center">
      <AlertCircle className="size-6 text-destructive" />
      <p className="text-sm font-medium text-foreground">{title}</p>
      {message && <p className="text-xs text-muted-foreground">{message}</p>}
      {onRetry && (
        <Button type="button" variant="outline" size="sm" onClick={onRetry}>
          再読み込み
        </Button>
      )}
    </div>
  );
}
