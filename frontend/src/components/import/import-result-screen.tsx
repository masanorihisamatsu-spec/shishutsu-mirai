"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { AlertCircle, CheckCircle2, Copy } from "lucide-react";

import { BackHeader } from "@/components/common/back-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { consumeImportResult, type ImportResultResponse } from "@/services/imports";

const SOURCE_FORMAT_LABELS: Record<string, string> = {
  paypay_csv: "PayPay（CSV）",
  rakuten_csv: "楽天カード（CSV）",
  jcb_csv: "JCB（CSV）",
  generic_csv: "汎用CSV",
  paypay_pdf: "PayPay（PDF）",
  excel: "Excel家計簿",
};

export function ImportResultScreen() {
  const router = useRouter();
  const [result, setResult] = useState<ImportResultResponse | null>(null);
  const [notFound, setNotFound] = useState(false);
  // sessionStorage は一度読んだら消費されるため、開発時のuseEffect二重実行(StrictMode)で
  // 2回目が「見つからなかった」と誤判定しないようにガードする
  const hasConsumedRef = useRef(false);

  useEffect(() => {
    if (hasConsumedRef.current) return;
    hasConsumedRef.current = true;

    const consumed = consumeImportResult();
    if (!consumed) {
      setNotFound(true);
      return;
    }
    setResult(consumed);
  }, []);

  return (
    <div className="min-h-screen bg-background pb-10">
      <BackHeader title="取込結果" onBack={() => router.push("/import")} />

      <main className="mx-auto flex max-w-2xl flex-col gap-6 px-5 py-7 sm:px-8 sm:py-9">
        {notFound ? (
          <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-border/60 py-14 text-center">
            <span className="flex size-12 items-center justify-center rounded-full bg-muted text-muted-foreground">
              <Copy className="size-6" />
            </span>
            <p className="text-sm font-medium text-foreground">取込結果が見つかりませんでした</p>
            <p className="text-xs text-muted-foreground">
              データ取込センターからファイルを選び直してください
            </p>
            <Button type="button" variant="outline" size="sm" onClick={() => router.push("/import")}>
              データ取込センターへ
            </Button>
          </div>
        ) : result ? (
          <>
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {SOURCE_FORMAT_LABELS[result.source_format] ?? result.source_format}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-5">
                <div className="flex items-center gap-3">
                  <span className="flex size-10 items-center justify-center rounded-full bg-success/15 text-success">
                    <CheckCircle2 className="size-5" />
                  </span>
                  <p className="text-sm text-foreground">
                    {result.registered_count}件の取引を登録しました
                  </p>
                </div>

                <div className="grid grid-cols-3 gap-3 rounded-2xl bg-muted/50 p-4 text-center">
                  <div>
                    <p className="text-2xl font-bold text-success">{result.registered_count}</p>
                    <p className="text-xs text-muted-foreground">登録</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-foreground">{result.duplicate_count}</p>
                    <p className="text-xs text-muted-foreground">重複</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-destructive">{result.error_count}</p>
                    <p className="text-xs text-muted-foreground">エラー</p>
                  </div>
                </div>

                {result.errors.length > 0 && (
                  <div className="space-y-2 rounded-2xl border border-destructive/30 bg-destructive/5 p-4">
                    <div className="flex items-center gap-2 text-destructive">
                      <AlertCircle className="size-4" />
                      <p className="text-xs font-medium">エラーの詳細</p>
                    </div>
                    <ul className="space-y-1">
                      {result.errors.map((message, index) => (
                        <li key={index} className="text-xs text-muted-foreground">
                          {message}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </CardContent>
            </Card>

            <div className="flex gap-3">
              <Button
                type="button"
                variant="outline"
                size="lg"
                className="flex-1"
                onClick={() => router.push("/import")}
              >
                取込センターに戻る
              </Button>
              <Button
                type="button"
                size="lg"
                className="flex-1"
                onClick={() => router.push("/transactions")}
              >
                取引一覧を見る
              </Button>
            </div>
          </>
        ) : null}
      </main>
    </div>
  );
}
