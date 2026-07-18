"use client";

import { useEffect, useState } from "react";

import { getGreeting } from "@/lib/greeting";

interface GreetingSectionProps {
  /** 将来ログイン機能を実装した際に、API から取得したユーザー名を渡す想定 */
  userName?: string;
  /** 将来 AI によるパーソナライズ文言に差し替える想定 */
  message?: string;
}

export function GreetingSection({
  userName,
  message = "今日は支出を見直す良い日です。",
}: GreetingSectionProps) {
  // サーバーとクライアントで時刻がずれてもハイドレーションエラーにならないよう、
  // 初期値は固定文言にし、マウント後に端末のローカル時刻で挨拶を確定する。
  const [greeting, setGreeting] = useState("こんにちは");

  useEffect(() => {
    setGreeting(getGreeting());
  }, []);

  return (
    <section>
      <h1 className="text-xl font-semibold text-foreground sm:text-2xl">
        {greeting}
        {userName ? `、${userName}さん` : ""}
        <span aria-hidden="true"> 😊</span>
      </h1>
      <p className="mt-1.5 text-sm text-muted-foreground">{message}</p>
    </section>
  );
}
