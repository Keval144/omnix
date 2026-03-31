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
  Upload,
} from "lucide-react";
import { toast } from "sonner";

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/shadcn-ui/avatar";
import { Button } from "@/components/shadcn-ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/shadcn-ui/accordion";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/shadcn-ui/card";
import { Input } from "@/components/shadcn-ui/input";
import { ScrollArea } from "@/components/shadcn-ui/scroll-area";
import { LoadingSpinner, EmptyState } from "@/components/ui/loading-spinner";
import {
  useChat,
  useProject,
  generateNotebookAction,
  downloadFile,
  useUploadDataset,
} from "@/lib/hooks";
import type { ChatSessionInfo } from "@/lib/hooks";
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

  const {
    project,
    isLoading: isLoadingProject,
    refresh: refreshProject,
  } = useProject(projectId);
  const {
    messages,
    isLoading,
    isLoadingHistory,
    hasMore,
    loadMore,
    sendMessage,
    sessionInfo,
  } = useChat(projectId);

  const { uploadDataset, isUploading: isUploadingDataset } = useUploadDataset();

  const [input, setInput] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      if (!scrollContainerRef.current || !hasMore || isLoadingHistory) return;
      const { scrollTop } = scrollContainerRef.current;
      if (scrollTop < 100) loadMore();
    };
    scrollContainerRef.current?.addEventListener("scroll", handleScroll);
    return () =>
      scrollContainerRef.current?.removeEventListener("scroll", handleScroll);
  }, [hasMore, isLoadingHistory, loadMore]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        inputRef.current?.focus();
      }
      if (e.key === "Escape") {
        inputRef.current?.blur();
        setInput("");
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

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

  const handleUploadDataset = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !projectId) return;

    try {
      await uploadDataset(projectId, file);
      toast.success("Dataset uploaded successfully!");
      refreshProject();
    } catch (error) {
      handleApiError(error, "Failed to upload dataset");
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = "";
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
    <div className="flex h-full min-h-0 flex-col gap-4 py-2 pt-4 lg:flex-row lg:gap-0">
      <ProjectSidebar
        project={project}
        sessionInfo={sessionInfo}
        isLoading={isLoadingProject}
        isGenerating={isGenerating}
        isUploading={isUploadingDataset}
        onGenerateNotebook={handleGenerateNotebook}
        onDownload={handleDownload}
        onUploadDataset={handleUploadDataset}
        fileInputRef={fileInputRef}
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
        inputRef={inputRef}
        onSuggestionClick={setInput}
      />
    </div>
  );
}

function ProjectSidebar({
  project,
  sessionInfo,
  isLoading,
  isGenerating,
  isUploading,
  onGenerateNotebook,
  onDownload,
  onUploadDataset,
  fileInputRef,
}: {
  project?: {
    metadata?: { name?: string; description?: string; tags?: string[] };
    dataset_path: string | null;
    dataset_file_name: string | null;
    notebook_path: string | null;
  } | null;
  sessionInfo: ChatSessionInfo | null;
  isLoading: boolean;
  isGenerating: boolean;
  isUploading: boolean;
  onGenerateNotebook: () => void;
  onDownload: (path: string) => void;
  onUploadDataset: (e: React.ChangeEvent<HTMLInputElement>) => void;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
}) {
  return (
    <div className="w-full lg:w-72 lg:shrink-0 lg:px-2 lg:pr-3">
      {isLoading ? (
        <Card className="h-full border p-4">
          <LoadingSpinner size="sm" />
        </Card>
      ) : project ? (
        <>
          <Card className="border lg:hidden">
            <Accordion className="w-full" defaultValue={["project"]}>
              <AccordionItem value="project">
                <AccordionTrigger className="px-4 text-sm font-medium">
                  Project Details
                </AccordionTrigger>
                <AccordionContent className="px-4 pb-4 space-y-4">
                  <div className="space-y-2">
                    <p className="text-sm font-medium wrap-break-word">
                      {project.metadata?.name || "Untitled"}
                    </p>
                    {project.metadata?.description && (
                      <p className="text-xs text-muted-foreground wrap-break-word">
                        {project.metadata.description}
                      </p>
                    )}
                    {project.metadata?.tags && project.metadata.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {project.metadata.tags.map((tag) => (
                          <span
                            key={tag}
                            className="rounded-full bg-secondary px-2 py-0.5 text-[10px] text-secondary-foreground"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="space-y-2">
                    <p className="text-xs font-medium text-muted-foreground">
                      Dataset
                    </p>
                    {project.dataset_path ? (
                      <div className="flex flex-col gap-1 text-xs text-green-600">
                        <div className="flex items-center gap-2">
                          <FileSpreadsheet className="h-3 w-3 shrink-0" />
                          <span>Uploaded</span>
                        </div>
                        {project.dataset_file_name && (
                          <span className="text-muted-foreground truncate" title={project.dataset_file_name}>
                            {project.dataset_file_name}
                          </span>
                        )}
                      </div>
                    ) : (
                      <>
                        <p className="text-xs text-muted-foreground">No dataset</p>
                        <input
                          type="file"
                          accept=".csv,.xls,.xlsx"
                          className="hidden"
                          ref={fileInputRef}
                          onChange={onUploadDataset}
                        />
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full justify-start gap-2 text-xs cursor-pointer"
                          disabled={isUploading}
                          onClick={() => fileInputRef.current?.click()}
                        >
                          {isUploading ? (
                            <Loader2 className="h-3 w-3 animate-spin" />
                          ) : (
                            <Upload className="h-3 w-3" />
                          )}
                          Upload Dataset
                        </Button>
                      </>
                    )}
                  </div>
                  <div className="space-y-2">
                    <p className="text-xs font-medium text-muted-foreground">
                      Notebook
                    </p>
                    {project.notebook_path ? (
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full justify-start gap-2 text-xs cursor-pointer"
                        onClick={() => onDownload(project.notebook_path!)}
                      >
                        <Download className="h-3 w-3" />
                        Download Notebook
                      </Button>
                    ) : project.dataset_path ? (
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full justify-start gap-2 text-xs cursor-pointer"
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
                      <p className="text-xs text-muted-foreground">
                        Upload dataset first
                      </p>
                    )}
                  </div>
                  {sessionInfo && (
                    <div className="space-y-2">
                      <p className="text-xs font-medium text-muted-foreground">
                        Session Stats
                      </p>
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-muted-foreground">Tokens Used:</span>
                        <span className="font-medium">
                          {sessionInfo.total_tokens_used.toLocaleString()}
                        </span>
                      </div>
                    </div>
                  )}
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </Card>
          <Card className="hidden lg:block h-full border">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Project Info</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <p className="text-sm font-medium wrap-break-word">
                  {project.metadata?.name || "Untitled"}
                </p>
                {project.metadata?.description && (
                  <p className="text-xs text-muted-foreground wrap-break-word">
                    {project.metadata.description}
                  </p>
                )}
                {project.metadata?.tags && project.metadata.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {project.metadata.tags.map((tag) => (
                      <span
                        key={tag}
                        className="rounded-full bg-secondary px-2 py-0.5 text-[10px] text-secondary-foreground"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
              <div className="space-y-2">
                <p className="text-xs font-medium text-muted-foreground">
                  Dataset
                </p>
                {project.dataset_path ? (
                  <div className="flex flex-col gap-1 text-xs text-green-600">
                    <div className="flex items-center gap-2">
                      <FileSpreadsheet className="h-3 w-3 shrink-0" />
                      <span>Uploaded</span>
                    </div>
                    {project.dataset_file_name && (
                      <span className="text-muted-foreground truncate" title={project.dataset_file_name}>
                        {project.dataset_file_name}
                      </span>
                    )}
                  </div>
                ) : (
                  <>
                    <p className="text-xs text-muted-foreground">No dataset</p>
                    <input
                      type="file"
                      accept=".csv,.xls,.xlsx"
                      className="hidden"
                      ref={fileInputRef}
                      onChange={onUploadDataset}
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full justify-start gap-2 text-xs cursor-pointer"
                      disabled={isUploading}
                      onClick={() => fileInputRef.current?.click()}
                    >
                      {isUploading ? (
                        <Loader2 className="h-3 w-3 animate-spin" />
                      ) : (
                        <Upload className="h-3 w-3" />
                      )}
                      Upload Dataset
                    </Button>
                  </>
                )}
              </div>
              <div className="space-y-2">
                <p className="text-xs font-medium text-muted-foreground">
                  Notebook
                </p>
                {project.notebook_path ? (
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full justify-start gap-2 text-xs cursor-pointer"
                    onClick={() => onDownload(project.notebook_path!)}
                  >
                    <Download className="h-3 w-3" />
                    Download Notebook
                  </Button>
                ) : project.dataset_path ? (
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full justify-start gap-2 text-xs cursor-pointer"
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
                  <p className="text-xs text-muted-foreground">
                    Upload dataset first
                  </p>
                )}
              </div>
              {sessionInfo && (
                <div className="space-y-2 border-t pt-3">
                  <p className="text-xs font-medium text-muted-foreground">
                    Session Stats
                  </p>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">Tokens Used:</span>
                    <span className="font-medium">
                      {sessionInfo.total_tokens_used.toLocaleString()}
                    </span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </>
      ) : (
        <Card className="h-full border p-4">
          <p className="text-xs text-muted-foreground">No project found</p>
        </Card>
      )}
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
  inputRef,
  onSuggestionClick,
}: {
  input: string;
  onInputChange: (v: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  isLoading: boolean;
  isLoadingHistory: boolean;
  hasMore: boolean;
  messages: {
    message_id: string;
    role: "user" | "assistant";
    content: string;
    created_at: string;
  }[];
  hasDataset: boolean;
  scrollContainerRef: React.RefObject<HTMLDivElement | null>;
  scrollRef: React.RefObject<HTMLDivElement | null>;
  inputRef: React.RefObject<HTMLInputElement | null>;
  onSuggestionClick?: (suggestion: string) => void;
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
            <EmptyStateWithSuggestions hasDataset={hasDataset} onSuggestionClick={onSuggestionClick} />
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
                        <span className="text-xs text-muted-foreground">
                          Thinking
                        </span>
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
        inputRef={inputRef}
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
          <p className="text-xs text-muted-foreground">
            Ask anything about your dataset
          </p>
        </div>
      </div>
    </div>
  );
}

function EmptyStateWithSuggestions({ 
  hasDataset, 
  onSuggestionClick 
}: { 
  hasDataset: boolean; 
  onSuggestionClick?: (suggestion: string) => void;
}) {
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
                  className="max-w-full text-xs whitespace-normal text-left cursor-pointer"
                  onClick={() => onSuggestionClick?.(suggestion)}
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
          {message.created_at
            ? new Date(message.created_at).toLocaleTimeString()
            : "Now"}
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
  inputRef,
}: {
  value: string;
  onChange: (v: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  disabled: boolean;
  inputRef: React.RefObject<HTMLInputElement | null>;
}) {
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      onSubmit(e as unknown as React.FormEvent);
    }
  };

  return (
    <div className="p-4 sm:p-5">
      <form
        onSubmit={onSubmit}
        className="mx-auto flex w-full max-w-4xl flex-row items-center gap-2"
      >
        <Input
          ref={inputRef}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type your message... (Cmd+K to focus)"
          className="min-w-0 flex-1 rounded-full border-muted-foreground/20 px-4 focus-visible:ring-primary/50"
          disabled={disabled}
        />
        <Button
          type="submit"
          size="icon"
          className="h-9 w-9 shrink-0 rounded-full transition-transform active:scale-95 sm:h-10 sm:w-10"
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
