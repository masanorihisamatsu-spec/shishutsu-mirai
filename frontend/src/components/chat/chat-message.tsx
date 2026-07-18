import { memo } from "react";

import { cn } from "@/lib/utils";
import type { ChatMessage as ChatMessageType } from "@/types/chat";

interface ChatMessageProps {
  message: ChatMessageType;
}

/**
 * 会話は増え続けるリストのため、新しいメッセージが追加されても既存の吹き出しが
 * 再レンダリングされないよう memo 化する（各 message オブジェクトは追加後は不変）。
 */
export const ChatMessage = memo(function ChatMessage({ message }: ChatMessageProps) {
  const isUser = message.role === "user";

  return (
    <div className={cn("flex", isUser ? "justify-end" : "justify-start")}>
      <div
        className={cn(
          "max-w-[80%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed",
          isUser ? "bg-primary text-primary-foreground" : "bg-muted text-foreground"
        )}
      >
        {message.text}
      </div>
    </div>
  );
});
