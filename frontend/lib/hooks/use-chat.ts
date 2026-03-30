import { useState, useCallback, useRef, useEffect } from "react";
import { authenticatedJsonFetch, getChatHistory, type ChatMessageResponse } from "@/lib/api-client";
import { handleApiError } from "@/lib/errors";

export type Message = {
  message_id: string;
  session_id: string;
  role: "user" | "assistant";
  content: string;
  created_at: string;
};

function normalizeMessage(msg: ChatMessageResponse): Message {
  const role = typeof msg.role === "string" ? msg.role.toLowerCase() : "assistant";
  return {
    ...msg,
    role: role === "user" ? "user" : "assistant",
  };
}

function sortMessages(messages: Message[]): Message[] {
  return [...messages].sort((a, b) => {
    const timeA = new Date(a.created_at).getTime();
    const timeB = new Date(b.created_at).getTime();
    if (timeA !== timeB) return timeA - timeB;
    if (a.role !== b.role) return a.role === "user" ? -1 : 1;
    return a.message_id.localeCompare(b.message_id);
  });
}

export function useChat(projectId: string | null) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [cursor, setCursor] = useState<string | null>(null);
  const isInitialLoad = useRef(true);

  const loadHistory = useCallback(async (cursorToLoad?: string, limit = 20) => {
    if (!projectId) return { items: [], next_cursor: null, has_more: false };
    
    return getChatHistory(projectId, cursorToLoad, limit);
  }, [projectId]);

  useEffect(() => {
    if (!projectId) {
      setMessages([]);
      setSessionId(null);
      setCursor(null);
      setHasMore(false);
      return;
    }

    isInitialLoad.current = true;
    setMessages([]);
    setCursor(null);
    setHasMore(false);

    const fetchHistory = async () => {
      setIsLoadingHistory(true);
      try {
        const data = await loadHistory(undefined, 20);
        const normalized = sortMessages(data.items.map(normalizeMessage).reverse());
        setMessages(normalized);
        setCursor(data.next_cursor);
        setHasMore(data.has_more);
        if (data.items.length > 0 && data.items[0].session_id) {
          setSessionId(data.items[0].session_id);
        }
      } catch (error) {
        console.error("Failed to load chat history:", error);
      } finally {
        setIsLoadingHistory(false);
        isInitialLoad.current = false;
      }
    };

    fetchHistory();
  }, [projectId, loadHistory]);

  const loadMore = useCallback(async () => {
    if (!projectId || !cursor || isLoadingHistory) return;

    setIsLoadingHistory(true);
    try {
      const data = await loadHistory(cursor, 20);
      const normalized = sortMessages(data.items.map(normalizeMessage).reverse());
      setMessages((prev) => [...normalized, ...prev]);
      setCursor(data.next_cursor);
      setHasMore(data.has_more);
    } catch (error) {
      console.error("Failed to load more messages:", error);
    } finally {
      setIsLoadingHistory(false);
    }
  }, [projectId, cursor, isLoadingHistory, loadHistory]);

  const sendMessage = useCallback(async (content: string) => {
    if (!content.trim() || !projectId) return;

    const userMsg: Message = {
      message_id: `temp-${Date.now()}`,
      session_id: sessionId || "new",
      role: "user",
      content: content.trim(),
      created_at: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setIsLoading(true);

    try {
      const payload: Record<string, string> = {
        project_id: projectId,
        content: userMsg.content,
      };
      if (sessionId) payload.session_id = sessionId;

      const res = await authenticatedJsonFetch<{
        session_id: string;
        messages: ChatMessageResponse[];
      }>("/chat/message", {
        method: "POST",
        body: JSON.stringify(payload),
      });

      if (!sessionId) {
        setSessionId(res.session_id);
        userMsg.session_id = res.session_id;
      }

      const normalizedMessages = res.messages.map(normalizeMessage);

      setMessages((prev) => {
        const filtered = prev.filter((m) => m.message_id !== userMsg.message_id);
        return [...filtered, ...normalizedMessages];
      });
    } catch (error) {
      console.error("Send message error:", error);
      handleApiError(error, "Failed to send message");
      setMessages((prev) => prev.filter((m) => m.message_id !== userMsg.message_id));
    } finally {
      setIsLoading(false);
    }
  }, [projectId, sessionId]);

  return {
    messages,
    sessionId,
    isLoading,
    isLoadingHistory,
    hasMore,
    loadMore,
    sendMessage,
  };
}
