import { Sparkles } from "lucide-react";

import { AnalysisItem } from "@/components/ai/analysis-item";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Insight } from "@/types/analysis";

interface InsightReportCardProps {
  insights: Insight[];
}

/** AiInsightCard（上位3件のみ）とは別に、生成された分析コメントを全件表示するセクション */
export function InsightReportCard({ insights }: InsightReportCardProps) {
  return (
    <Card>
      <CardHeader className="flex-row items-center gap-2.5">
        <span className="flex size-9 items-center justify-center rounded-full bg-primary/15 text-primary">
          <Sparkles className="size-4" />
        </span>
        <CardTitle className="text-sm font-medium text-muted-foreground">分析レポート</CardTitle>
      </CardHeader>
      <CardContent>
        {insights.length === 0 ? (
          <p className="text-sm text-muted-foreground">データが増えると分析を開始します</p>
        ) : (
          <div className="space-y-3">
            {insights.map((insight) => (
              <AnalysisItem key={insight.id} message={insight.message} />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
