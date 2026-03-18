"use client";

import { ArrowUpIcon, Bot, Plus, User } from "lucide-react";
import { useParams } from "next/navigation";
import { type JSX, useEffect, useRef, useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/shadcn-ui/dropdown-menu";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupText,
  InputGroupTextarea,
} from "@/components/shadcn-ui/input-group";
import { Separator } from "@/components/shadcn-ui/separator";
import { authenticatedJsonFetch } from "@/lib/api-client";

type BackendMessage = {
  message_id: string;
  session_id: string;
  role: "USER" | "ASSISTANT" | "user" | "assistant";
  content: string;
  created_at: string;
};

type ChatMessage = {
  id: string;
  sessionId: string;
  role: "user" | "assistant";
  content: string;
};

type ChatSession = {
  session_id: string;
  project_id: string;
};

type ChatResponse = {
  session_id: string;
  messages: BackendMessage[];
};

function normalizeRole(role: BackendMessage["role"]): ChatMessage["role"] {
  return role.toLowerCase() === "user" ? "user" : "assistant";
}

function mapMessage(message: BackendMessage): ChatMessage {
  return {
    id: message.message_id,
    sessionId: message.session_id,
    role: normalizeRole(message.role),
    content: message.content,
  };
}

export default function ChatBotClient({ chatId }: { chatId?: string }) {
  const params = useParams();
  const [isPending, setIsPending] = useState(false);
  const [isResolving, setIsResolving] = useState(true);
  const [inputValue, setInputValue] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [projectId, setProjectId] = useState<string | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const resolvedChatId = chatId || (params.id as string);

  useEffect(() => {
    async function resolveChatContext() {
      setIsResolving(true);

      try {
        const session = await authenticatedJsonFetch<ChatSession>(
          `/chat/session/${resolvedChatId}`,
        );
        setProjectId(session.project_id);
        setSessionId(session.session_id);

        const page = await authenticatedJsonFetch<{ items: BackendMessage[] }>(
          `/chat/messages?session_id=${session.session_id}`,
        );
        setMessages(page.items.reverse().map(mapMessage));
        return;
      } catch {
        setProjectId(resolvedChatId);
        setSessionId(null);
        setMessages([]);
      } finally {
        setIsResolving(false);
      }
    }

    resolveChatContext();
  }, [resolvedChatId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  });

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isPending || !projectId) return;

    const content = inputValue.trim();
    const optimisticUserMessage: ChatMessage = {
      id: `temp-user-${Date.now()}`,
      sessionId: sessionId || "pending",
      role: "user",
      content,
    };

    setMessages((prev) => [...prev, optimisticUserMessage]);
    setInputValue("");
    setIsPending(true);

    try {
      const result = await authenticatedJsonFetch<ChatResponse>(
        "/chat/message",
        {
          method: "POST",
          body: JSON.stringify({
            project_id: projectId,
            content,
            ...(sessionId ? { session_id: sessionId } : {}),
          }),
        },
      );

      setSessionId(result.session_id);
      setMessages((prev) =>
        prev
          .filter((message) => message.id !== optimisticUserMessage.id)
          .concat(result.messages.map(mapMessage)),
      );
    } catch (error) {
      console.error("Error sending message:", error);
      setMessages((prev) =>
        prev.filter((message) => message.id !== optimisticUserMessage.id),
      );
      setInputValue(content);
    } finally {
      setIsPending(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  function renderMessageContent(content: string) {
    const sqlRegex = /```sql([\s\S]*?)```/g;
    const parts: (string | JSX.Element)[] = [];

    let lastIndex = 0;
    let match: RegExpExecArray | null;

    while (true) {
      match = sqlRegex.exec(content);
      if (!match) {
        break;
      }

      const [_, sqlCode] = match;
      const startIndex = match.index;

      if (startIndex > lastIndex) {
        parts.push(content.slice(lastIndex, startIndex));
      }

      parts.push(
        <div
          key={startIndex}
          className="bg-muted/40 text-foreground/90 relative my-3 w-full rounded-lg border p-4 font-mono text-sm"
        >
          <button
            type="button"
            onClick={() => navigator.clipboard.writeText(sqlCode.trim())}
            className="bg-muted text-foreground/70 hover:bg-muted-foreground/10 absolute top-2 right-2 rounded-md px-2 py-1 text-xs transition-colors"
          >
            Copy
          </button>
          <pre className="overflow-x-auto whitespace-pre-wrap">
            {sqlCode.trim()}
          </pre>
        </div>,
      );

      lastIndex = sqlRegex.lastIndex;
    }

    if (lastIndex < content.length) {
      parts.push(content.slice(lastIndex));
    }

    return parts.length ? parts : content;
  }

  return (
    <div className="bg-background flex h-screen flex-col">
      <div className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-4xl px-4 py-6">
          {!isResolving && messages.length === 0 && (
            <div className="flex h-64 items-center justify-center text-center">
              <div className="max-w-md space-y-4">
                <div className="bg-primary/10 mx-auto flex h-12 w-12 items-center justify-center rounded-full">
                  <Bot className="text-primary h-6 w-6" />
                </div>
                <h3 className="text-lg font-medium">Start a conversation</h3>
                <p className="text-muted-foreground text-sm">
                  Ask questions about your data and get an LLM response from the
                  project assistant
                </p>
              </div>
            </div>
          )}

          <div className="space-y-6">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-4 ${
                  msg.role === "user" ? "flex-row-reverse" : "flex-row"
                }`}
              >
                <div
                  className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${
                    msg.role === "user"
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted"
                  }`}
                >
                  {msg.role === "user" ? (
                    <User className="h-4 w-4" />
                  ) : (
                    <Bot className="h-4 w-4" />
                  )}
                </div>

                <div
                  className={`flex max-w-[80%] flex-col gap-2 ${
                    msg.role === "user" ? "items-end" : "items-start"
                  }`}
                >
                  <div
                    className={`rounded-2xl px-4 py-3 ${
                      msg.role === "user"
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted"
                    }`}
                  >
                    <div className="wrap-break-word whitespace-pre-wrap">
                      {renderMessageContent(msg.content)}
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {(isPending || isResolving) && (
              <div className="flex gap-4">
                <div className="bg-muted flex h-8 w-8 shrink-0 items-center justify-center rounded-full">
                  <Bot className="h-4 w-4" />
                </div>
                <div className="flex max-w-[80%] flex-col gap-2">
                  <div className="bg-muted rounded-2xl px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="flex space-x-1">
                        <div className="h-2 w-2 animate-bounce rounded-full bg-current"></div>
                        <div
                          className="h-2 w-2 animate-bounce rounded-full bg-current"
                          style={{ animationDelay: "0.1s" }}
                        ></div>
                        <div
                          className="h-2 w-2 animate-bounce rounded-full bg-current"
                          style={{ animationDelay: "0.2s" }}
                        ></div>
                      </div>
                      <span className="text-sm">
                        {isResolving
                          ? "Loading chat..."
                          : "Generating response..."}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        </div>
      </div>

      <div className="bg-background/95 border-t p-4 backdrop-blur">
        <div className="mx-auto max-w-4xl">
          <InputGroup className="h-10 shadow-sm">
            <InputGroupTextarea
              placeholder="Ask a question about your data..."
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={isPending || isResolving}
            />

            <InputGroupAddon align="block-end">
              <InputGroupButton
                variant="outline"
                className="rounded-full"
                size="icon-xs"
                disabled
              >
                <Plus />
              </InputGroupButton>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <InputGroupButton variant="ghost" disabled>
                    {process.env.NEXT_PUBLIC_LLM_LABEL || "iFlow"}
                  </InputGroupButton>
                </DropdownMenuTrigger>
                <DropdownMenuContent side="top" align="start">
                  <DropdownMenuItem>
                    {process.env.NEXT_PUBLIC_LLM_LABEL || "iFlow"}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              <InputGroupText className="ml-auto">Live</InputGroupText>
              <Separator orientation="vertical" className="h-4" />
              <InputGroupButton
                variant="default"
                className="rounded-full"
                size="icon-xs"
                disabled={
                  isPending || isResolving || !inputValue.trim() || !projectId
                }
                onClick={handleSendMessage}
              >
                <ArrowUpIcon />
                <span className="sr-only">Send</span>
              </InputGroupButton>
            </InputGroupAddon>
          </InputGroup>
        </div>
      </div>
    </div>
  );
}
