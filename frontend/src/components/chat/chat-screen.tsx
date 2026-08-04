"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

import { BackHeader } from "@/components/common/back-header";
import { ErrorState } from "@/components/common/error-state";
import { LoadingState } from "@/components/common/loading-state";
import { Button } from "@/components/ui/button";
import { CHAT_SUGGESTED_QUESTIONS } from "@/data/chat-suggested-questions";
import { useCategories } from "@/hooks/use-categories";
import { useTransactions } from "@/hooks/use-transactions";
import { generateAnswer, parseIntent } from "@/lib/chat";
import type { ChatMessage as ChatMessageType } from "@/types/chat";

import { ChatInput } from "./chat-input";
import { ChatMessage } from "./chat-message";

const STORAGE_KEY = "chatHistory";

function loadHistory(): ChatMessageType[] {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as ChatMessageType[]) : [];
  } catch {
    return [];
  }
}

function saveHistory(messages: ChatMessageType[]): void {
  sessionStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
}

export function ChatScreen() {
  const router = useRouter();
  const { data: transactions, isPending, isError, error, refetch } = useTransactions();
  const { data: categories } = useCategories();
  const [messages, setMessages] = useState<ChatMessageType[]>([]);
  const hasLoadedHistoryRef = useRef(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  // 初回マウント時に一度だけ sessionStorage から履歴を復元する
  useEffect(() => {
    if (hasLoadedHistoryRef.current) return;
    hasLoadedHistoryRef.current = true;
    setMessages(loadHistory());
  }, []);

  useEffect(() => {
    if (!hasLoadedHistoryRef.current) return;
    saveHistory(messages);
  }, [messages]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = (text: string) => {
    const userMessage: ChatMessageType = {
      id: crypto.randomUUID(),
      role: "user",
      text,
      createdAt: new Date().toISOString(),
    };

    const categoryNames = (categories ?? []).map((category) => category.name);
    const intent = parseIntent(text, transactions ?? [], categoryNames);
    const answerText = generateAnswer(intent, transactions ?? []);

    const assistantMessage: ChatMessageType = {
      id: crypto.randomUUID(),
      role: "assistant",
      text: answerText,
      createdAt: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMessage, assistantMessage]);
  };

  return (
    // h-screen + overflow-hidden で外枠を固定し、メッセージ領域だけを独立してスクロールさせる。
    // こうすることでヘッダーと入力欄は会話が長くなっても常に画面内に固定表示される。
    <div className="flex h-screen flex-col overflow-hidden bg-background">
      <BackHeader title="AIチャット" onBack={() => router.back()} />

      <div className="flex-1 overflow-y-auto">
        <main className="mx-auto flex w-full max-w-2xl flex-col gap-4 px-5 py-6 sm:px-8">
          {isPending ? (
            <LoadingState />
          ) : isError ? (
            <ErrorState
              title="取引データの取得に失敗しました"
              message={error instanceof Error ? error.message : undefined}
              onRetry={() => refetch()}
            />
          ) : (
            <>
              {messages.length === 0 && (
                <div className="space-y-3">
                  <p className="text-sm text-muted-foreground">こんな質問ができます</p>
                  <div className="flex flex-col gap-2">
                    {CHAT_SUGGESTED_QUESTIONS.map((question) => (
                      <Button
                        key={question}
                        type="button"
                        variant="outline"
                        className="justify-start"
                        onClick={() => handleSend(question)}
                      >
                        {question}
                      </Button>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex flex-col gap-3">
                {messages.map((message) => (
                  <ChatMessage key={message.id} message={message} />
                ))}
              </div>
              <div ref={bottomRef} />
            </>
          )}
        </main>
      </div>

      <ChatInput onSend={handleSend} disabled={isPending || isError} />
    </div>
  );
}
