"use client";

import { useState, useRef, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import {
  Bot,
  Download,
  FileCode,
  FileSpreadsheet,
  Loader2,
  MessageSquare,
  Send,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/shadcn-ui/avatar";
import { Button } from "@/components/shadcn-ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/shadcn-ui/card";
import { Input } from "@/components/shadcn-ui/input";
import { ScrollArea } from "@/components/shadcn-ui/scroll-area";
import { LoadingSpinner, EmptyState } from "@/components/ui/loading-spinner";
import { useChat, useProject, generateNotebookAction, downloadFile } from "@/lib/hooks";
import { handleApiError } from "@/lib/errors";

const ML_SUGGESTIONS = [
  "What ML models can I use for this data?",
  "Show data visualization and insights",
  "Generate predictions using this dataset",
  "Analyze correlations between features",
];

function ChatContent() {
  const searchParams = useSearchParams();
  const projectId = searchParams.get("project_id");
  const chatKey = `chat-${projectId || "no-project"}`;
  
  const { project, isLoading: isLoadingProject, refresh: refreshProject } = useProject(projectId);
  const { messages, isLoading, isLoadingHistory, hasMore, loadMore, sendMessage } = useChat(projectId);
  
  const [input, setInput] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      if (!scrollContainerRef.current || !hasMore || isLoadingHistory) return;
      const { scrollTop } = scrollContainerRef.current;
      if (scrollTop < 100) loadMore();
    };
    scrollContainerRef.current?.addEventListener("scroll", handleScroll);
    return () => scrollContainerRef.current?.removeEventListener("scroll", handleScroll);
  }, [hasMore, isLoadingHistory, loadMore]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    const msg = input.trim();
    setInput("");
    await sendMessage(msg);
  };

  const handleGenerateNotebook = async () => {
    if (!projectId) return;
    setIsGenerating(true);
    try {
      await generateNotebookAction(projectId);
      toast.success("Notebook generated successfully!");
      refreshProject();
    } catch (error) {
      handleApiError(error, "Failed to generate notebook");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownload = async (path: string) => {
    try {
      await downloadFile(path);
    } catch {
      // Error handled in downloadFile
    }
  };

  if (!projectId) {
    return (
      <EmptyState
        icon={Bot}
        title="No Project Selected"
        description="Please create or select a project from the dashboard to start chatting."
      />
    );
  }

  return (
    <div className="flex h-full min-h-0 flex-col gap-4 py-2 pt-4 lg:flex-row">
      <ProjectSidebar
        project={project}
        isLoading={isLoadingProject}
        isGenerating={isGenerating}
        onGenerateNotebook={handleGenerateNotebook}
        onDownload={handleDownload}
      />

      <ChatArea
        input={input}
        onInputChange={setInput}
        onSubmit={handleSend}
        isLoading={isLoading}
        isLoadingHistory={isLoadingHistory}
        hasMore={hasMore}
        messages={messages}
        hasDataset={!!project?.dataset_path}
        scrollContainerRef={scrollContainerRef}
        scrollRef={scrollRef}
      />
    </div>
  );
}

function ProjectSidebar({
  project,
  isLoading,
  isGenerating,
  onGenerateNotebook,
  onDownload,
}: {
  project?: { metadata?: { name?: string; description?: string }; dataset_path: string | null; notebook_path: string | null } | null;
  isLoading: boolean;
  isGenerating: boolean;
  onGenerateNotebook: () => void;
  onDownload: (path: string) => void;
}) {
  return (
    <div className="w-full space-y-4 lg:w-72 lg:shrink-0">
      <Card className="h-full border">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Project Info</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {isLoading ? (
            <LoadingSpinner size="sm" />
          ) : project ? (
            <>
              <div className="space-y-2">
                <p className="text-sm font-medium wrap-break-word">
                  {project.metadata?.name || "Untitled"}
                </p>
                {project.metadata?.description && (
                  <p className="text-xs text-muted-foreground wrap-break-word">
                    {project.metadata.description}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <p className="text-xs font-medium text-muted-foreground">Dataset</p>
                {project.dataset_path ? (
                  <div className="flex items-center gap-2 text-xs text-green-600">
                    <FileSpreadsheet className="h-3 w-3 shrink-0" />
                    <span>Uploaded</span>
                  </div>
                ) : (
                  <p className="text-xs text-muted-foreground">No dataset</p>
                )}
              </div>
              <div className="space-y-2">
                <p className="text-xs font-medium text-muted-foreground">Notebook</p>
                {project.notebook_path ? (
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full justify-start gap-2 text-xs"
                    onClick={() => onDownload(project.notebook_path!)}
                  >
                    <Download className="h-3 w-3" />
                    Download Notebook
                  </Button>
                ) : project.dataset_path ? (
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full justify-start gap-2 text-xs"
                    disabled={isGenerating}
                    onClick={onGenerateNotebook}
                  >
                    {isGenerating ? (
                      <Loader2 className="h-3 w-3 animate-spin" />
                    ) : (
                      <FileCode className="h-3 w-3" />
                    )}
                    Generate Notebook
                  </Button>
                ) : (
                  <p className="text-xs text-muted-foreground">Upload dataset first</p>
                )}
              </div>
            </>
          ) : (
            <p className="text-xs text-muted-foreground">No project found</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function ChatArea({
  input,
  onInputChange,
  onSubmit,
  isLoading,
  isLoadingHistory,
  hasMore,
  messages,
  hasDataset,
  scrollContainerRef,
  scrollRef,
}: {
  input: string;
  onInputChange: (v: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  isLoading: boolean;
  isLoadingHistory: boolean;
  hasMore: boolean;
  messages: { message_id: string; role: "user" | "assistant"; content: string; created_at: string }[];
  hasDataset: boolean;
  scrollContainerRef: React.RefObject<HTMLDivElement | null>;
  scrollRef: React.RefObject<HTMLDivElement | null>;
}) {
  return (
    <div className="flex flex-1 min-h-0 flex-col rounded-lg border bg-background shadow-sm">
      <ChatHeader />
      
      <ScrollArea 
        className="min-h-0 flex-1 px-4 py-4 sm:px-5" 
        ref={scrollContainerRef}
      >
        <div className="flex flex-col gap-6">
          {isLoadingHistory && messages.length === 0 ? (
            <LoadingSpinner />
          ) : messages.length === 0 ? (
            <EmptyStateWithSuggestions hasDataset={hasDataset} />
          ) : (
            <>
              {isLoadingHistory && hasMore && (
                <LoadingSpinner size="sm" text="Loading older messages..." />
              )}
              {messages.map((msg) => (
                <ChatMessage key={msg.message_id} message={msg} />
              ))}
              {isLoading && (
                <div className="flex gap-3">
                  <Avatar className="h-8 w-8 shrink-0">
                    <AvatarFallback>AI</AvatarFallback>
                    <div className="flex h-full w-full items-center justify-center bg-primary text-primary-foreground">
                      <Bot className="h-4 w-4" />
                    </div>
                  </Avatar>
                  <div className="flex max-w-[88%] flex-col gap-1 sm:max-w-[80%]">
                    <div className="rounded-2xl bg-muted px-4 py-3">
                      <div className="flex items-center gap-1">
                        <span className="text-xs text-muted-foreground">Thinking</span>
                        <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
          <div ref={scrollRef} />
        </div>
      </ScrollArea>

      <ChatInput
        value={input}
        onChange={onInputChange}
        onSubmit={onSubmit}
        disabled={isLoading}
      />
    </div>
  );
}

function ChatHeader() {
  return (
    <div className="border-b px-4 py-4 sm:px-6">
      <div className="flex items-center gap-3">
        <div className="rounded-full bg-primary/10 p-2 text-primary">
          <Bot className="h-5 w-5" />
        </div>
        <div className="min-w-0">
          <h2 className="font-semibold tracking-tight">Project Assistant</h2>
          <p className="text-xs text-muted-foreground">Ask anything about your dataset</p>
        </div>
      </div>
    </div>
  );
}

function EmptyStateWithSuggestions({ hasDataset }: { hasDataset: boolean }) {
  return (
    <EmptyState
      icon={MessageSquare}
      title="Send a message to start the conversation"
      action={
        hasDataset && (
          <div className="w-full max-w-2xl space-y-2">
            <p className="flex items-center justify-center gap-1 text-xs font-medium text-muted-foreground">
              <Sparkles className="h-3 w-3" />
              Try asking:
            </p>
            <div className="flex flex-wrap justify-center gap-2">
              {ML_SUGGESTIONS.map((suggestion) => (
                <Button
                  key={suggestion}
                  variant="secondary"
                  size="sm"
                  className="max-w-full text-xs whitespace-normal text-left"
                >
                  {suggestion}
                </Button>
              ))}
            </div>
          </div>
        )
      }
    />
  );
}

function ChatMessage({
  message,
}: {
  message: { role: "user" | "assistant"; content: string; created_at: string };
}) {
  const isUser = message.role === "user";

  return (
    <div className={`flex gap-3 ${isUser ? "flex-row-reverse" : ""}`}>
      <Avatar className="h-8 w-8 shrink-0">
        {isUser ? (
          <>
            <AvatarFallback>U</AvatarFallback>
            <AvatarImage src="/pfp.jpg" />
          </>
        ) : (
          <>
            <AvatarFallback>AI</AvatarFallback>
            <div className="flex h-full w-full items-center justify-center bg-primary text-primary-foreground">
              <Bot className="h-4 w-4" />
            </div>
          </>
        )}
      </Avatar>
      <div
        className={`flex min-w-0 max-w-[88%] flex-col gap-1 sm:max-w-[80%] ${
          isUser ? "items-end" : "items-start"
        }`}
      >
        <div
          className={`w-full rounded-2xl px-4 py-2.5 text-sm shadow-sm wrap-break-word ${
            isUser
              ? "bg-primary text-primary-foreground"
              : "bg-muted text-foreground prose prose-sm max-w-none dark:prose-invert"
          }`}
        >
          {isUser ? (
            message.content
          ) : (
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {message.content}
            </ReactMarkdown>
          )}
        </div>
        <span className="text-[10px] text-muted-foreground">
          {message.created_at ? new Date(message.created_at).toLocaleTimeString() : "Now"}
        </span>
      </div>
    </div>
  );
}

function ChatInput({
  value,
  onChange,
  onSubmit,
  disabled,
}: {
  value: string;
  onChange: (v: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  disabled: boolean;
}) {
  return (
    <div className="p-4 sm:p-5">
      <form
        onSubmit={onSubmit}
        className="mx-auto flex w-full max-w-4xl flex-col gap-3 sm:flex-row sm:items-center"
      >
        <Input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Type your message..."
          className="min-w-0 flex-1 rounded-full border-muted-foreground/20 px-4 focus-visible:ring-primary/50"
          disabled={disabled}
        />
        <Button
          type="submit"
          size="icon"
          className="h-10 w-full shrink-0 rounded-full transition-transform active:scale-95 sm:w-10"
          disabled={disabled || !value.trim()}
        >
          <Send className="h-4 w-4" />
          <span className="sr-only">Send</span>
        </Button>
      </form>
    </div>
  );
}

export default function ChatPage() {
  return (
    <Suspense
      fallback={
        <div className="flex h-[60vh] items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      }
    >
      <ChatContent />
    </Suspense>
  );
}
