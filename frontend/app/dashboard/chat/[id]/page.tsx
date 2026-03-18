export const dynamic = "force-dynamic";

import { Suspense } from "react";
import ChatBotDemo from "./chat-bot-client";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function ChatPage({ params }: PageProps) {
  const { id } = await params;
  return (
    <Suspense fallback="Loading">
      <ChatBotDemo chatId={id} />
    </Suspense>
  );
}
