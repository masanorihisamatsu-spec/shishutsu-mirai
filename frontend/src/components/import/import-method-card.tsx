import type { LucideIcon } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import type { ImportMethod } from "@/types/import";

interface ImportMethodCardProps {
  method: ImportMethod;
  icon: LucideIcon;
  /** 未接続の場合はボタンのみ表示し、押下処理は行わない */
  onImport?: () => void;
}

export function ImportMethodCard({ method, icon: Icon, onImport }: ImportMethodCardProps) {
  return (
    <Card>
      <CardContent className="flex flex-col gap-4 p-6">
        <div className="flex items-start gap-4">
          <span className="flex size-12 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
            <Icon className="size-6" />
          </span>
          <div className="min-w-0 space-y-1">
            <p className="text-base font-semibold text-foreground">{method.title}</p>
            {method.description && (
              <p className="text-sm leading-relaxed text-muted-foreground">{method.description}</p>
            )}
          </div>
        </div>

        {method.supportedSources && method.supportedSources.length > 0 && (
          <div className="flex flex-wrap gap-2 pl-16">
            {method.supportedSources.map((source) => (
              <Badge key={source} variant="secondary" className="text-[11px]">
                {source}
              </Badge>
            ))}
          </div>
        )}

        <Button onClick={onImport} className="h-12 w-full text-base">
          {method.actionLabel}
        </Button>
      </CardContent>
    </Card>
  );
}
