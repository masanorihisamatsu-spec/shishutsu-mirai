"use client";

import { useState } from "react";
import { Pencil, Plus, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Toast, type ToastState } from "@/components/ui/toast";
import { ApiError } from "@/lib/api-client";
import type { MasterDataOption } from "@/types/master-data";

interface OptionListManagerProps {
  title: string;
  emptyMessage: string;
  options: MasterDataOption[];
  isPending: boolean;
  isError: boolean;
  onCreate: (name: string) => Promise<unknown>;
  onUpdate: (id: number, name: string) => Promise<unknown>;
  onDelete: (id: number) => Promise<unknown>;
}

/** カテゴリ・支払方法どちらの管理UIにも使う、名前だけのマスタデータ用の追加・編集・削除パネル */
export function OptionListManager({
  title,
  emptyMessage,
  options,
  isPending,
  isError,
  onCreate,
  onUpdate,
  onDelete,
}: OptionListManagerProps) {
  const [editingOption, setEditingOption] = useState<MasterDataOption | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [nameInput, setNameInput] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<MasterDataOption | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [toast, setToast] = useState<ToastState | null>(null);

  const openCreateDialog = () => {
    setEditingOption(null);
    setNameInput("");
    setFormOpen(true);
  };

  const openEditDialog = (option: MasterDataOption) => {
    setEditingOption(option);
    setNameInput(option.name);
    setFormOpen(true);
  };

  const handleSave = async () => {
    const trimmed = nameInput.trim();
    if (!trimmed) return;

    setIsSaving(true);
    try {
      if (editingOption) {
        await onUpdate(editingOption.id, trimmed);
      } else {
        await onCreate(trimmed);
      }
      setFormOpen(false);
    } catch (error) {
      setToast({
        message:
          error instanceof ApiError ? error.message : "保存に失敗しました。もう一度お試しください。",
        variant: "error",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;

    setIsDeleting(true);
    try {
      await onDelete(deleteTarget.id);
      setDeleteTarget(null);
    } catch (error) {
      setToast({
        message:
          error instanceof ApiError ? error.message : "削除に失敗しました。もう一度お試しください。",
        variant: "error",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={openCreateDialog}
          aria-label={`${title}を追加`}
        >
          <Plus className="size-4" />
        </Button>
      </CardHeader>
      <CardContent>
        {isError ? (
          <p className="text-sm text-destructive">取得に失敗しました。</p>
        ) : isPending ? (
          <p className="text-sm text-muted-foreground">読み込み中...</p>
        ) : options.length === 0 ? (
          <p className="text-sm text-muted-foreground">{emptyMessage}</p>
        ) : (
          <ul className="divide-y divide-border/60">
            {options.map((option) => (
              <li
                key={option.id}
                className="flex items-center justify-between gap-3 py-2.5 first:pt-0 last:pb-0"
              >
                <span className="text-sm text-foreground">{option.name}</span>
                <div className="flex shrink-0 items-center gap-1">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="size-8 text-muted-foreground"
                    aria-label={`${option.name}を編集`}
                    onClick={() => openEditDialog(option)}
                  >
                    <Pencil className="size-3.5" />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="size-8 text-muted-foreground hover:text-destructive"
                    aria-label={`${option.name}を削除`}
                    onClick={() => setDeleteTarget(option)}
                  >
                    <Trash2 className="size-3.5" />
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </CardContent>

      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingOption ? `${title}を編集` : `${title}を追加`}</DialogTitle>
            <DialogDescription>名前を入力してください</DialogDescription>
          </DialogHeader>

          <Input
            value={nameInput}
            onChange={(event) => setNameInput(event.target.value)}
            placeholder="例: 教育費"
            autoFocus
          />

          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => setFormOpen(false)}>
              キャンセル
            </Button>
            <Button onClick={handleSave} disabled={!nameInput.trim() || isSaving}>
              {isSaving ? "保存中..." : "保存する"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={deleteTarget !== null} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>削除しますか？</DialogTitle>
            <DialogDescription>
              {deleteTarget?.name}を削除します。この操作は取り消せません。
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setDeleteTarget(null)}
              disabled={isDeleting}
            >
              キャンセル
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={handleDelete}
              disabled={isDeleting}
            >
              {isDeleting ? "削除中..." : "削除する"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {toast && <Toast {...toast} onDismiss={() => setToast(null)} />}
    </Card>
  );
}
