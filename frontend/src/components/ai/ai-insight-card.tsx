"use client";

import Link from "next/link";
import { useMemo } from "react";
import { MessageCircle, Sparkles } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { generateInsights } from "@/lib/analysis";
import type { Transaction } from "@/types/expense";

import { AnalysisItem } from "./analysis-item";

const MAX_INSIGHTS = 3;
const EMPTY_MESSAGE = "データが増えると分析を開始します";
const ERROR_MESSAGE = "分析データの取得に失敗しました";

interface AiInsightCardProps {
  transactions: Transaction[];
  isLoading?: boolean;
  isError?: boolean;
  title?: string;
}

/** ルールベースのAI分析コメントを優先度順に最大3件表示するカード */
export function AiInsightCard({
  transactions,
  isLoading = false,
  isError = false,
  title = "AI分析",
}: AiInsightCardProps) {
  // generateInsights はカテゴリ別集計・曜日別集計など複数回ループするため、
  // transactions が変わっていないのに親の再レンダリングだけで再計算されないようにする
  const insights = useMemo(
    () => generateInsights(transactions).slice(0, MAX_INSIGHTS),
    [transactions]
  );

  return (
    <Card className="overflow-hidden border-none bg-gradient-to-br from-primary/10 via-card to-card shadow-md">
      <CardHeader className="flex-row items-center gap-2.5">
        <span className="flex size-9 items-center justify-center rounded-full bg-primary/15 text-primary">
          <Sparkles className="size-4" />
        </span>
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        {isError ? (
          <p className="text-sm text-destructive">{ERROR_MESSAGE}</p>
        ) : isLoading ? (
          <p className="text-sm text-muted-foreground">分析中...</p>
        ) : insights.length === 0 ? (
          <p className="text-sm text-muted-foreground">{EMPTY_MESSAGE}</p>
        ) : (
          <div className="space-y-3">
            {insights.map((insight) => (
              <AnalysisItem key={insight.id} message={insight.message} />
            ))}
          </div>
        )}

        <Link
          href="/chat"
          className="mt-4 inline-flex items-center gap-1.5 text-xs font-medium text-primary hover:underline"
        >
          <MessageCircle className="size-3.5" />
          AIに質問する
        </Link>
      </CardContent>
    </Card>
  );
}
