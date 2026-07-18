"use client";

import Link from "next/link";
import { Camera, FolderOpen, PenLine, Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

const FAB_ACTIONS = [
  {
    key: "receipt",
    label: "レシート撮影",
    description: "カメラでレシートを読み取ります",
    icon: Camera,
    href: undefined,
  },
  {
    key: "import",
    label: "データ取り込み",
    description: "明細ファイルを取り込みます",
    icon: FolderOpen,
    href: "/import",
  },
  {
    key: "manual",
    label: "手入力",
    description: "支出を自分で入力します",
    icon: PenLine,
    href: "/transactions/new",
  },
] as const;

const ITEM_CLASS_NAME =
  "flex items-center gap-3 rounded-2xl border border-border/60 p-4 text-left transition-colors hover:bg-accent";

export function FabMenu() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          size="icon"
          className="fixed bottom-24 right-5 z-50 size-14 shadow-lg sm:right-8"
          aria-label="支出を追加"
        >
          <Plus className="size-6" />
        </Button>
      </DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>支出を追加</DialogTitle>
          <DialogDescription>追加方法を選んでください</DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-2">
          {FAB_ACTIONS.map(({ key, label, description, icon: Icon, href }) => {
            const content = (
              <>
                <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <Icon className="size-5" />
                </span>
                <span>
                  <span className="block text-sm font-medium text-foreground">{label}</span>
                  <span className="block text-xs text-muted-foreground">{description}</span>
                </span>
              </>
            );

            return (
              <DialogClose key={key} asChild>
                {href ? (
                  <Link href={href} className={ITEM_CLASS_NAME}>
                    {content}
                  </Link>
                ) : (
                  <button type="button" className={ITEM_CLASS_NAME}>
                    {content}
                  </button>
                )}
              </DialogClose>
            );
          })}
        </div>
      </DialogContent>
    </Dialog>
  );
}
