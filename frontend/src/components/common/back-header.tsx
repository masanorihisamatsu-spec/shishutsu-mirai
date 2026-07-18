"use client";

import { ChevronLeft } from "lucide-react";
import type { ReactNode } from "react";

import { Button } from "@/components/ui/button";

interface BackHeaderProps {
  title: string;
  onBack: () => void;
  action?: ReactNode;
}

/** 戻るボタン+タイトル+任意アクションのスティッキーヘッダー。フォーム系のサブ画面で共通利用する。 */
export function BackHeader({ title, onBack, action }: BackHeaderProps) {
  return (
    <div className="sticky top-0 z-40 flex items-center gap-3 border-b border-border/60 bg-background/80 px-5 py-4 backdrop-blur-md sm:px-8">
      <Button variant="ghost" size="icon" onClick={onBack} aria-label="戻る">
        <ChevronLeft className="size-5" />
      </Button>
      <h1 className="flex-1 text-base font-semibold text-foreground">{title}</h1>
      {action}
    </div>
  );
}
