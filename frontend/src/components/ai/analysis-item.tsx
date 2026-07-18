import { Sparkles } from "lucide-react";

interface AnalysisItemProps {
  message: string;
}

/** AI分析コメント1件分の表示行。AiInsightCard 内で複数件並べて使う。 */
export function AnalysisItem({ message }: AnalysisItemProps) {
  return (
    <div className="flex items-start gap-3">
      <span className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full bg-primary/15 text-primary">
        <Sparkles className="size-3" />
      </span>
      <p className="text-sm leading-relaxed text-foreground">{message}</p>
    </div>
  );
}
