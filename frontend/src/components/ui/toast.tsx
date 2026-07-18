"use client";

import { X } from "lucide-react";

import { cn } from "@/lib/utils";

export interface ToastState {
  message: string;
  variant: "error" | "success";
}

interface ToastProps extends ToastState {
  onDismiss: () => void;
}

export function Toast({ message, variant, onDismiss }: ToastProps) {
  return (
    <div
      role="alert"
      className={cn(
        "fixed inset-x-5 bottom-5 z-50 mx-auto flex max-w-md items-start gap-3 rounded-2xl border px-4 py-3 shadow-lg sm:inset-x-auto sm:right-8",
        variant === "error"
          ? "border-destructive/30 bg-destructive text-destructive-foreground"
          : "border-primary/30 bg-primary text-primary-foreground"
      )}
    >
      <p className="flex-1 text-sm font-medium">{message}</p>
      <button
        type="button"
        onClick={onDismiss}
        aria-label="閉じる"
        className="shrink-0 rounded-full p-0.5 opacity-80 transition-opacity hover:opacity-100"
      >
        <X className="size-4" />
      </button>
    </div>
  );
}
