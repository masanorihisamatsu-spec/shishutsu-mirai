import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

const PLACEHOLDER_ROWS = 5;

/** 取引一覧の読み込み中に TransactionCard の形を模して表示するプレースホルダー */
export function TransactionListSkeleton() {
  return (
    <div className="flex flex-col gap-3" aria-hidden="true">
      {Array.from({ length: PLACEHOLDER_ROWS }).map((_, index) => (
        <Card key={index}>
          <CardContent className="flex items-center justify-between gap-4 p-4">
            <div className="flex min-w-0 flex-1 items-center gap-3">
              <Skeleton className="size-11 shrink-0 rounded-full" />
              <div className="min-w-0 flex-1 space-y-2">
                <Skeleton className="h-4 w-2/5" />
                <Skeleton className="h-3 w-3/5" />
              </div>
            </div>
            <Skeleton className="h-5 w-14 shrink-0" />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
