import { cn } from "@/lib/utils";

/** 読み込み中に実データの形を模して表示する、脈動する矩形プレースホルダー */
function Skeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("animate-pulse rounded-md bg-muted", className)} {...props} />;
}

export { Skeleton };
