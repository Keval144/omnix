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
  downloadNotebook,
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
    const fetchProject = async () => {
      if (!projectId) return;
      setIsLoadingProject(true);
      try {
        const data = await authenticatedJsonFetch<Project>(
          `/projects/${projectId}`,
        );
        setProject(data);
      } catch (error) {
        console.error(error);
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
    } catch (error) {
      console.error(error);
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
    } catch (error) {
      console.error(error);
      toast.error("Failed to generate notebook");
    } finally {
      setIsGeneratingNotebook(false);
    }
  };

  const handleDownloadNotebook = async (notebookPath: string) => {
    try {
      const blob = await downloadNotebook(notebookPath);
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = notebookPath.split("/").pop() || "notebook.ipynb";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error(error);
      toast.error("Failed to download notebook");
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    setInput(suggestion);
  };

  if (!projectId) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center space-y-4 px-4 text-center">
        <Bot className="h-16 w-16 text-muted-foreground" />
        <h2 className="text-2xl font-bold">No Project Selected</h2>
        <p className="max-w-lg text-muted-foreground">
          Please create or select a project from the dashboard to start
          chatting.
        </p>
      </div>
    );
  }

  return (
    <div className="flex h-full min-h-0 flex-col gap-4 lg:flex-row  py-2 pt-4">

      <div className="w-full space-y-4 lg:w-72 lg:shrink-0">
        <Card className="h-full border">
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
                  <p className="text-sm font-medium wrap-break-word">
                    {project.metadata?.name || project.project_slug}
                  </p>
                  {project.metadata?.description && (
                    <p className="text-xs text-muted-foreground wrap-break-word">
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
                      <FileSpreadsheet className="h-3 w-3 shrink-0" />
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
                      onClick={() =>
                        handleDownloadNotebook(project.notebook_path!)
                      }
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

      <div className="flex flex-1 min-h-0 flex-col rounded-lg border bg-background shadow-sm">
        <div className="border-b px-4 py-4 sm:px-6">
          <div className="flex items-center gap-3">
            <div className="rounded-full bg-primary/10 p-2 text-primary">
              <Bot className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <h2 className="font-semibold tracking-tight">
                Project Assistant
              </h2>
              <p className="text-xs text-muted-foreground">
                Ask anything about your dataset
              </p>
            </div>
          </div>
        </div>

        <ScrollArea className="min-h-0 flex-1 px-4 py-4 sm:px-5">
          <div className="flex flex-col gap-6">
            {messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center space-y-4 py-12 text-center sm:py-20">
                <div className="rounded-full bg-muted p-4">
                  <MessageSquare className="h-8 w-8 text-muted-foreground" />
                </div>
                <p className="text-muted-foreground">
                  Send a message to start the conversation
                </p>

                {project?.dataset_path && (
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
                  <Avatar className="h-8 w-8 shrink-0">
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
                    className={`flex min-w-0 max-w-[88%] flex-col gap-1 sm:max-w-[80%] ${msg.role === "user" ? "items-end" : "items-start"}`}
                  >
                    <div
                      className={`w-full rounded-2xl px-4 py-2.5 text-sm shadow-sm wrap-break-word ${
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
                <Avatar className="h-8 w-8 shrink-0">
                  <AvatarFallback>AI</AvatarFallback>
                  <div className="flex h-full w-full items-center justify-center bg-primary text-primary-foreground">
                    <Bot className="h-4 w-4 text-primary-foreground" />
                  </div>
                </Avatar>
                <div className="flex max-w-[88%] flex-col gap-1 sm:max-w-[80%]">
                  <div className="rounded-2xl bg-muted px-4 py-3 shadow-sm">
                    <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                  </div>
                </div>
              </div>
            )}
            <div ref={scrollRef} />
          </div>
        </ScrollArea>

        <div className="pt-4 p-4 sm:p-5">
          <form
            onSubmit={sendMessage}
            className="mx-auto flex w-full max-w-4xl flex-col gap-3 sm:flex-row sm:items-center"
          >
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type your message..."
              className="min-w-0 flex-1 rounded-full border-muted-foreground/20 px-4 focus-visible:ring-primary/50"
              disabled={isLoading}
            />
            <Button
              type="submit"
              size="icon"
              className="h-10 w-full shrink-0 rounded-full transition-transform active:scale-95 sm:w-10"
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
        <div className="flex h-[60vh] items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      }
    >
      <ChatContent />
    </Suspense>
  );
}
