import Link from "next/link";
import { ArrowRight, CheckCircle2, FileCode, Loader2, MessageSquare } from "lucide-react";

import { Button } from "@/components/shadcn-ui/button";
import type { Project } from "@/lib/api-client";

interface ProjectCardProps {
  project: Project;
  isGenerating?: boolean;
  onGenerateNotebook?: (projectId: string) => void;
  onDownload?: (notebookPath: string) => void;
}

export function ProjectCard({
  project,
  isGenerating = false,
  onGenerateNotebook,
  onDownload,
}: ProjectCardProps) {
  const isComplete = !!(project.dataset_path && project.notebook_path);
  const chatName = project.metadata?.name || project.project_slug || "Untitled Chat";
  const date = new Date(project.created_at).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  return (
    <div className="flex flex-col gap-3 py-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex min-w-0 items-center gap-3">
        <div
          className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${
            isComplete
              ? "bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400"
              : "bg-muted text-muted-foreground"
          }`}
        >
          {isComplete ? (
            <CheckCircle2 className="h-4 w-4" />
          ) : (
            <MessageSquare className="h-4 w-4" />
          )}
        </div>
        <div className="min-w-0">
          <p className="truncate text-sm font-medium">{chatName}</p>
          <p className="text-xs text-muted-foreground">{date}</p>
        </div>
      </div>
      <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:flex-wrap sm:justify-end">
        {project.dataset_path && !project.notebook_path && onGenerateNotebook && (
          <Button
            variant="outline"
            size="sm"
            className="w-full gap-1 sm:w-auto"
            disabled={isGenerating}
            onClick={() => onGenerateNotebook(project.project_id)}
          >
            {isGenerating ? (
              <Loader2 className="h-3 w-3 animate-spin" />
            ) : (
              <FileCode className="h-3 w-3" />
            )}
            Make Notebook
          </Button>
        )}
        {project.notebook_path && onDownload && (
          <Button
            variant="outline"
            size="sm"
            className="w-full gap-1 sm:w-auto"
            onClick={() => onDownload(project.notebook_path!)}
          >
            <FileCode className="h-3 w-3" />
            Download Notebook
          </Button>
        )}
        <Link href={`/dashboard/chat?project_id=${project.project_id}`} className="w-full sm:w-auto">
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
}
