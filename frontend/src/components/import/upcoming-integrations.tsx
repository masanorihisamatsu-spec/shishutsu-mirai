import { CircleDashed, type LucideIcon } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { UpcomingIntegration } from "@/types/import";

interface UpcomingIntegrationsProps {
  items: UpcomingIntegration[];
  icons: Record<string, LucideIcon>;
}

export function UpcomingIntegrations({ items, icons }: UpcomingIntegrationsProps) {
  return (
    <Card className="border-dashed bg-muted/40 shadow-none">
      <CardHeader>
        <CardTitle className="text-sm font-medium text-muted-foreground">今後対応予定</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        {items.map((item) => {
          const Icon = icons[item.id] ?? CircleDashed;
          return (
            <div key={item.id} className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground">
                  <Icon className="size-4" />
                </span>
                <span className="text-sm text-foreground">{item.label}</span>
              </div>
              <Badge variant="outline" className="shrink-0 text-[11px] text-muted-foreground">
                近日対応
              </Badge>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
