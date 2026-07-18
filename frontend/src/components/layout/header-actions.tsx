import { Bell, Settings } from "lucide-react";

import { Button } from "@/components/ui/button";

/** 全画面共通のHeaderアクション（通知・設定）。画面固有のアクションが必要な場合は個別に組み立てる */
export function HeaderDefaultActions() {
  return (
    <>
      <Button variant="ghost" size="icon" aria-label="通知">
        <Bell className="size-5" />
      </Button>
      <Button variant="ghost" size="icon" aria-label="設定">
        <Settings className="size-5" />
      </Button>
    </>
  );
}
