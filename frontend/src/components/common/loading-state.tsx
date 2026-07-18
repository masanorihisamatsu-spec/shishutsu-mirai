import { Loader2 } from "lucide-react";

interface LoadingStateProps {
  message?: string;
}

export function LoadingState({ message = "読み込み中..." }: LoadingStateProps) {
  return (
    <div className="flex flex-col items-center gap-3 py-16 text-center text-muted-foreground">
      <Loader2 className="size-6 animate-spin" />
      <p className="text-sm">{message}</p>
    </div>
  );
}
