export const dynamic = "force-dynamic";

import type { Metadata } from "next";
import { Suspense } from "react";
import ChatBotDemo from "./chat-bot-client";

interface PageProps {
  params: Promise<{ id: string }>;
}

export const metadata: Metadata = {
  title: "Chat",
  description: "Chat with Omnix AI about your data and notebooks",
};

export default async function ChatPage({ params }: PageProps) {
  const { id } = await params;
  return (
    <Suspense fallback="Loading">
      <ChatBotDemo chatId={id} />
    </Suspense>
  );
}
