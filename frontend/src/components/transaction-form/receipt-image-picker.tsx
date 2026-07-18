"use client";

import { useEffect, useRef, useState, type ChangeEvent } from "react";
import { Camera, Loader2, X } from "lucide-react";

import { Button } from "@/components/ui/button";

interface ReceiptImagePickerProps {
  value: File | null;
  onChange: (file: File | null) => void;
  /** true の間、プレビュー上にOCR読み取り中のオーバーレイを表示する */
  isScanning?: boolean;
}

/**
 * レシート画像の選択・プレビューを行うコンポーネント。
 * 画像の選択自体はここで完結するが、選択後のOCR実行・結果反映は
 * 呼び出し元（TransactionForm）が onChange をトリガーに行う。
 */
export function ReceiptImagePicker({ value, onChange, isScanning = false }: ReceiptImagePickerProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] ?? null;
    onChange(file);
    setPreviewUrl(file ? URL.createObjectURL(file) : null);
  };

  const handleClear = () => {
    onChange(null);
    setPreviewUrl(null);
    if (inputRef.current) inputRef.current.value = "";
  };

  return (
    <div>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleFileChange}
        className="hidden"
      />

      {previewUrl ? (
        <div className="relative overflow-hidden rounded-2xl border border-border/60">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={previewUrl} alt="レシートのプレビュー" className="h-40 w-full object-cover" />
          <Button
            type="button"
            variant="secondary"
            size="icon"
            className="absolute right-2 top-2 size-8"
            onClick={handleClear}
            disabled={isScanning}
            aria-label="レシート画像を削除"
          >
            <X className="size-4" />
          </Button>
          {isScanning && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-background/80 text-foreground backdrop-blur-sm">
              <Loader2 className="size-5 animate-spin" />
              <span className="text-xs font-medium">読み取り中...</span>
            </div>
          )}
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="flex w-full flex-col items-center gap-2 rounded-2xl border border-dashed border-border/60 bg-muted/40 py-8 text-center text-muted-foreground transition-colors hover:border-border hover:bg-muted"
        >
          <span className="flex size-10 items-center justify-center rounded-full bg-card text-primary">
            <Camera className="size-5" />
          </span>
          <span className="text-sm font-medium text-foreground">レシート画像を選択（任意）</span>
          <span className="text-xs">タップして画像を追加できます</span>
        </button>
      )}

      {value && <p className="mt-2 truncate text-xs text-muted-foreground">{value.name}</p>}
    </div>
  );
}
