import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

/** レポート画面の読み込み中に、各カードの形を模して表示するプレースホルダー */
export function ReportsSkeleton() {
  return (
    <div className="flex flex-col gap-6" aria-hidden="true">
      <Card className="border-none shadow-md">
        <CardHeader>
          <Skeleton className="h-4 w-32" />
        </CardHeader>
        <CardContent className="space-y-3 pb-7 pt-1">
          <Skeleton className="h-10 w-40" />
          <Skeleton className="h-4 w-24" />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <Skeleton className="h-4 w-24" />
        </CardHeader>
        <CardContent className="space-y-3">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
          <Skeleton className="h-4 w-4/6" />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <Skeleton className="h-4 w-32" />
        </CardHeader>
        <CardContent className="flex flex-col items-center gap-8 sm:flex-row">
          <Skeleton className="size-52 shrink-0 rounded-full" />
          <div className="w-full space-y-3">
            {Array.from({ length: 4 }).map((_, index) => (
              <Skeleton key={index} className="h-4 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <Skeleton className="h-4 w-28" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-56 w-full" />
        </CardContent>
      </Card>
    </div>
  );
}
