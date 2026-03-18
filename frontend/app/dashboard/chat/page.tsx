"use client";

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
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/shadcn-ui/avatar";
import { Button } from "@/components/shadcn-ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/shadcn-ui/card";
import { Input } from "@/components/shadcn-ui/input";
import { ScrollArea } from "@/components/shadcn-ui/scroll-area";
import {
  authenticatedJsonFetch,
  generateNotebook,
  type Project,
} from "@/lib/api-client";

type Message = {
  message_id: string;
  session_id: string;
  role: "USER" | "ASSISTANT" | "user" | "assistant";
  content: string;
  created_at: string;
};

function normalizeMessage(message: Message): Message {
  return {
    ...message,
    role: message.role.toLowerCase() === "user" ? "user" : "assistant",
  };
}

const ML_SUGGESTIONS = [
  "What ML models can I use for this data?",
  "Show data visualization and insights",
  "Generate predictions using this dataset",
  "Analyze correlations between features",
];

function ChatContent() {
  const searchParams = useSearchParams();
  const projectId = searchParams.get("project_id");
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [project, setProject] = useState<Project | null>(null);
  const [isLoadingProject, setIsLoadingProject] = useState(false);
  const [isGeneratingNotebook, setIsGeneratingNotebook] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, []);

  useEffect(() => {
    const fetchProject = async () => {
      if (!projectId) return;
      setIsLoadingProject(true);
      try {
        const data = await authenticatedJsonFetch<Project>(
          `/projects/${projectId}`,
        );
        setProject(data);
      } catch (e) {
        console.error(e);
      } finally {
        setIsLoadingProject(false);
      }
    };
    fetchProject();
  }, [projectId]);

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !projectId) return;

    const userMsg = input.trim();
    setInput("");
    setIsLoading(true);

    try {
      const payload = {
        project_id: projectId,
        content: userMsg,
        ...(sessionId ? { session_id: sessionId } : {}),
      };

      const res = await authenticatedJsonFetch<{
        session_id: string;
        messages: Message[];
      }>("/chat/message", {
        method: "POST",
        body: JSON.stringify(payload),
      });

      if (!sessionId) {
        setSessionId(res.session_id);
      }

      setMessages((prev) => [...prev, ...res.messages.map(normalizeMessage)]);
    } catch (e) {
      console.error(e);
      toast.error("Failed to send message");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerateNotebook = async () => {
    if (!projectId) return;
    setIsGeneratingNotebook(true);
    try {
      await generateNotebook(projectId);
      toast.success("Notebook generated successfully!");
      const data = await authenticatedJsonFetch<Project>(
        `/projects/${projectId}`,
      );
      setProject(data);
    } catch (e) {
      console.error(e);
      toast.error("Failed to generate notebook");
    } finally {
      setIsGeneratingNotebook(false);
    }
  };

  const handleDownloadNotebook = (notebookPath: string) => {
    const link = document.createElement("a");
    link.href = notebookPath;
    link.download = notebookPath.split("/").pop() || "notebook.ipynb";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleSuggestionClick = (suggestion: string) => {
    setInput(suggestion);
  };

  if (!projectId) {
    return (
      <div className="flex h-[80vh] flex-col items-center justify-center space-y-4">
        <Bot className="h-16 w-16 text-muted-foreground" />
        <h2 className="text-2xl font-bold">No Project Selected</h2>
        <p className="text-muted-foreground">
          Please create or select a project from the dashboard to start
          chatting.
        </p>
      </div>
    );
  }

  return (
    <div className="flex h-[calc(100vh-8rem)] gap-4">
      {/* Sidebar */}
      <div className="w-64 shrink-0 space-y-4">
        <Card className="h-full">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Project Info</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {isLoadingProject ? (
              <div className="flex justify-center py-4">
                <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
              </div>
            ) : project ? (
              <>
                <div className="space-y-2">
                  <p className="font-medium text-sm">
                    {project.metadata?.name || project.project_slug}
                  </p>
                  {project.metadata?.description && (
                    <p className="text-xs text-muted-foreground">
                      {project.metadata.description}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <p className="text-xs font-medium text-muted-foreground">
                    Dataset
                  </p>
                  {project.dataset_path ? (
                    <div className="flex items-center gap-2 text-xs text-green-600">
                      <FileSpreadsheet className="h-3 w-3" />
                      <span>Uploaded</span>
                    </div>
                  ) : (
                    <p className="text-xs text-muted-foreground">No dataset</p>
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
                      className="w-full justify-start gap-2 text-xs"
                      onClick={() => {
                        if (project.notebook_path) {
                          handleDownloadNotebook(project.notebook_path);
                        }
                      }}
                    >
                      <Download className="h-3 w-3" />
                      Download Notebook
                    </Button>
                  ) : project.dataset_path ? (
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full justify-start gap-2 text-xs"
                      disabled={isGeneratingNotebook}
                      onClick={handleGenerateNotebook}
                    >
                      {isGeneratingNotebook ? (
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
              </>
            ) : (
              <p className="text-xs text-muted-foreground">No project found</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Main Chat Area */}
      <div className="flex flex-1 flex-col rounded-lg border bg-background shadow-sm">
        {/* Header */}
        <div className="flex items-center border-b px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="rounded-full bg-primary/10 p-2 text-primary">
              <Bot className="h-5 w-5" />
            </div>
            <div>
              <h2 className="font-semibold tracking-tight">
                Project Assistant
              </h2>
              <p className="text-xs text-muted-foreground">
                Ask anything about your dataset
              </p>
            </div>
          </div>
        </div>

        {/* Messages */}
        <ScrollArea className="flex-1 p-4">
          <div className="flex flex-col gap-6">
            {messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center space-y-4 py-20 text-center">
                <div className="rounded-full bg-muted p-4">
                  <MessageSquare className="h-8 w-8 text-muted-foreground" />
                </div>
                <p className="text-muted-foreground">
                  Send a message to start the conversation
                </p>

                {/* ML/DL Suggestions */}
                {project?.dataset_path && (
                  <div className="space-y-2">
                    <p className="text-xs font-medium text-muted-foreground flex items-center gap-1">
                      <Sparkles className="h-3 w-3" />
                      Try asking:
                    </p>
                    <div className="flex flex-wrap justify-center gap-2">
                      {ML_SUGGESTIONS.map((suggestion) => (
                        <Button
                          key={suggestion}
                          variant="secondary"
                          size="sm"
                          className="text-xs"
                          onClick={() => handleSuggestionClick(suggestion)}
                        >
                          {suggestion}
                        </Button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              messages.map((msg, i) => (
                <div
                  key={msg.message_id || i}
                  className={`flex gap-3 ${msg.role === "user" ? "flex-row-reverse" : ""}`}
                >
                  <Avatar className="h-8 w-8">
                    {msg.role === "user" ? (
                      <>
                        <AvatarFallback>U</AvatarFallback>
                        <AvatarImage src="/assets/pfp.jpg" />
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
                    className={`flex max-w-[80%] flex-col gap-1 ${msg.role === "user" ? "items-end" : "items-start"}`}
                  >
                    <div
                      className={`rounded-2xl px-4 py-2.5 text-sm shadow-sm ${
                        msg.role === "user"
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted text-foreground"
                      }`}
                    >
                      {msg.content}
                    </div>
                    <span className="text-[10px] text-muted-foreground">
                      {msg.created_at
                        ? new Date(msg.created_at).toLocaleTimeString()
                        : "Now"}
                    </span>
                  </div>
                </div>
              ))
            )}
            {isLoading && (
              <div className="flex gap-3">
                <Avatar className="h-8 w-8">
                  <AvatarFallback>AI</AvatarFallback>
                  <div className="flex h-full w-full items-center justify-center bg-primary text-primary-foreground">
                    <Bot className="h-4 w-4 text-primary-foreground" />
                  </div>
                </Avatar>
                <div className="flex max-w-[80%] flex-col gap-1 items-start">
                  <div className="rounded-2xl bg-muted px-4 py-3 shadow-sm">
                    <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                  </div>
                </div>
              </div>
            )}
            <div ref={scrollRef} />
          </div>
        </ScrollArea>

        {/* Input */}
        <div className="border-t p-4 pb-6">
          <form
            onSubmit={sendMessage}
            className="mx-auto flex max-w-4xl items-center gap-2"
          >
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type your message..."
              className="flex-1 rounded-full px-4 border-muted-foreground/20 focus-visible:ring-primary/50"
              disabled={isLoading}
            />
            <Button
              type="submit"
              size="icon"
              className="h-10 w-10 shrink-0 rounded-full transition-transform active:scale-95"
              disabled={isLoading || !input.trim()}
            >
              <Send className="h-4 w-4" />
              <span className="sr-only">Send</span>
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default function ChatPage() {
  return (
    <Suspense
      fallback={
        <div className="flex h-[80vh] items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      }
    >
      <ChatContent />
    </Suspense>
  );
}
