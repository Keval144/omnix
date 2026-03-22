"use client";

import {
  ArrowRight,
  CheckCircle2,
  Clock,
  Download,
  FileCode,
  FolderOpen,
  Loader2,
  MessageSquare,
  UploadCloud,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/shadcn-ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/shadcn-ui/card";
import { Input } from "@/components/shadcn-ui/input";
import { Label } from "@/components/shadcn-ui/label";
import { Textarea } from "@/components/shadcn-ui/textarea";
import {
  authenticatedFetch,
  authenticatedJsonFetch,
  downloadNotebook,
  generateNotebook,
} from "@/lib/api-client";

const MAX_CHATS = 5;

type Project = {
  project_id: string;
  project_slug: string;
  dataset_path: string | null;
  notebook_path: string | null;
  metadata?: { name?: string; description?: string };
  created_at: string;
  updated_at: string;
};

export default function DashboardPage() {
  const [file, setFile] = useState<File | null>(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [projects, setProjects] = useState<Project[]>([]);
  const [isFetching, setIsFetching] = useState(true);
  const [generatingNotebook, setGeneratingNotebook] = useState<string | null>(
    null,
  );
  const router = useRouter();

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const data = await authenticatedJsonFetch<Project[]>("/projects");
        setProjects(data);
      } catch (error) {
        console.error(error);
      } finally {
        setIsFetching(false);
      }
    };

    fetchProjects();
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) setFile(e.target.files[0]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      toast.error("Please select a file to upload");
      return;
    }
    setIsLoading(true);
    try {
      const projectRes = await authenticatedFetch("/projects", {
        method: "POST",
        body: JSON.stringify({
          metadata: { name: name || file.name, description, tags: [] },
        }),
      });
      const project = await projectRes.json();

      const formData = new FormData();
      formData.append("project_id", project.project_id);
      formData.append("file", file);
      await authenticatedFetch("/datasets/upload", {
        method: "POST",
        body: formData,
      });

      toast.success("Project created successfully!");
      router.refresh();
      router.push(`/dashboard/chat?project_id=${project.project_id}`);
    } catch (error) {
      console.error(error);
      toast.error(error instanceof Error ? error.message : "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerateNotebook = async (projectId: string) => {
    setGeneratingNotebook(projectId);
    try {
      await generateNotebook(projectId);
      toast.success("Notebook generated successfully!");
      const data = await authenticatedJsonFetch<Project[]>("/projects");
      setProjects(data);
    } catch (error) {
      console.error(error);
      toast.error(
        error instanceof Error ? error.message : "Failed to generate notebook",
      );
    } finally {
      setGeneratingNotebook(null);
    }
  };

  const handleDownloadNotebook = async (notebookPath: string | null) => {
    if (!notebookPath) return;
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

  const completedCount = projects.filter(
    (p) => p.dataset_path && p.notebook_path,
  ).length;
  const recentProjects = projects.slice(0, 5);
  const usedSlots = projects.length;

  return (
    <div className="flex-1 min-h-0 space-y-6 overflow-y-auto p-4 pt-4 sm:p-6 sm:pt-6 lg:p-8">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
          Dashboard
        </h2>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-1.5">
              <FolderOpen className="h-4 w-4" /> Chats Used
            </CardDescription>
            <CardTitle className="text-3xl sm:text-4xl">
              {usedSlots}
              <span className="text-lg text-muted-foreground sm:text-xl">
                /{MAX_CHATS}
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="mt-1 h-2 w-full overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full bg-primary transition-all"
                style={{ width: `${(usedSlots / MAX_CHATS) * 100}%` }}
              />
            </div>
            <p className="mt-2 text-xs text-muted-foreground">
              {MAX_CHATS - usedSlots} slot
              {MAX_CHATS - usedSlots !== 1 ? "s" : ""} remaining
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-1.5">
              <CheckCircle2 className="h-4 w-4 text-green-500" /> Completed
              Chats
            </CardDescription>
            <CardTitle className="text-3xl sm:text-4xl">
              {completedCount}
              <span className="text-lg text-muted-foreground sm:text-xl">
                /{MAX_CHATS}
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="mt-1 h-2 w-full overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full bg-green-500 transition-all"
                style={{ width: `${(completedCount / MAX_CHATS) * 100}%` }}
              />
            </div>
            <p className="mt-2 text-xs text-muted-foreground">
              Chat is complete once dataset + notebook are both present
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-1.5">
              <Clock className="h-4 w-4" /> Most Recent Chat
            </CardDescription>
            <CardTitle className="truncate text-base">
              {recentProjects[0]?.metadata?.name ??
                recentProjects[0]?.project_slug ??
                "-"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {recentProjects[0] ? (
              <Link
                href={`/dashboard/chat?project_id=${recentProjects[0].project_id}`}
                className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
              >
                Continue <ArrowRight className="h-3 w-3" />
              </Link>
            ) : (
              <p className="text-xs text-muted-foreground">No chats yet</p>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-5">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>New Project</CardTitle>
            <CardDescription>
              Upload a dataset to start a new chat.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Project Name (Optional)</Label>
                <Input
                  id="name"
                  placeholder="e.g. Sales Data 2024"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  disabled={isLoading}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description (Optional)</Label>
                <Textarea
                  id="description"
                  placeholder="Brief description..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  disabled={isLoading}
                  rows={2}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="file">
                  Dataset File <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="file"
                  type="file"
                  onChange={handleFileChange}
                  disabled={isLoading}
                  className="cursor-pointer"
                />
              </div>
              <Button
                type="submit"
                className="w-full"
                disabled={isLoading || usedSlots >= MAX_CHATS}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <UploadCloud className="mr-2 h-4 w-4" />
                    Upload &amp; Create Project
                  </>
                )}
              </Button>
              {usedSlots >= MAX_CHATS && (
                <p className="text-center text-xs text-destructive">
                  You have reached the limit of {MAX_CHATS} chats.
                </p>
              )}
            </form>
          </CardContent>
        </Card>

        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5" /> Recent Chats
            </CardTitle>
            <CardDescription>
              Your last {MAX_CHATS} chat projects
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isFetching ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : recentProjects.length === 0 ? (
              <div className="flex flex-col items-center justify-center gap-2 py-8 text-center text-muted-foreground">
                <MessageSquare className="h-8 w-8 opacity-40" />
                <p className="text-sm">
                  No chats yet. Create your first project!
                </p>
              </div>
            ) : (
              <div className="flex flex-col divide-y">
                {recentProjects.map((p) => {
                  const isComplete = !!(p.dataset_path && p.notebook_path);
                  const chatName =
                    p.metadata?.name || p.project_slug || "Untitled Chat";
                  const date = new Date(p.created_at).toLocaleDateString(
                    "en-US",
                    {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    },
                  );
                  const isGenerating = generatingNotebook === p.project_id;

                  return (
                    <div
                      key={p.project_id}
                      className="flex flex-col gap-3 py-3 sm:flex-row sm:items-center sm:justify-between"
                    >
                      <div className="flex min-w-0 items-center gap-3">
                        <div
                          className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${isComplete ? "bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400" : "bg-muted text-muted-foreground"}`}
                        >
                          {isComplete ? (
                            <CheckCircle2 className="h-4 w-4" />
                          ) : (
                            <MessageSquare className="h-4 w-4" />
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="truncate text-sm font-medium">
                            {chatName}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {date}
                          </p>
                        </div>
                      </div>
                      <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:flex-wrap sm:justify-end">
                        {p.dataset_path && !p.notebook_path && (
                          <Button
                            variant="outline"
                            size="sm"
                            className="w-full gap-1 sm:w-auto"
                            disabled={isGenerating}
                            onClick={() => handleGenerateNotebook(p.project_id)}
                          >
                            {isGenerating ? (
                              <Loader2 className="h-3 w-3 animate-spin" />
                            ) : (
                              <FileCode className="h-3 w-3" />
                            )}
                            Make Notebook
                          </Button>
                        )}
                        {p.notebook_path && (
                          <Button
                            variant="outline"
                            size="sm"
                            className="w-full gap-1 sm:w-auto"
                            onClick={() =>
                              handleDownloadNotebook(p.notebook_path)
                            }
                          >
                            <Download className="h-3 w-3" />
                            Download Notebook
                          </Button>
                        )}
                        <Link
                          href={`/dashboard/chat?project_id=${p.project_id}`}
                          className="w-full sm:w-auto"
                        >
                          <Button
                            variant="ghost"
                            size="sm"
                            className="w-full shrink-0 gap-1 sm:w-auto"
                          >
                            Open <ArrowRight className="h-3 w-3" />
                          </Button>
                        </Link>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
