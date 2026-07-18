"use client";

import { useState, type FormEvent } from "react";
import { Send } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface ChatInputProps {
  onSend: (text: string) => void;
  disabled?: boolean;
}

export function ChatInput({ onSend, disabled = false }: ChatInputProps) {
  const [value, setValue] = useState("");

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmed = value.trim();
    if (!trimmed) return;
    onSend(trimmed);
    setValue("");
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="sticky bottom-0 flex items-center gap-2 border-t border-border/60 bg-background/80 px-5 py-3 backdrop-blur-md sm:px-8"
    >
      <Input
        value={value}
        onChange={(event) => setValue(event.target.value)}
        placeholder="支出について質問する"
        disabled={disabled}
        className="flex-1"
      />
      <Button type="submit" size="icon" disabled={disabled || !value.trim()} aria-label="送信">
        <Send className="size-4" />
      </Button>
    </form>
  );
}
