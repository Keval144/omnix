"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  CheckCircle2,
  Clock,
  FolderOpen,
  Loader2,
  MessageSquare,
  UploadCloud,
} from "lucide-react";
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
import { StatsCard } from "@/components/ui/stats-card";
import { ProjectCard } from "@/components/ui/project-card";
import { LoadingSpinner, EmptyState } from "@/components/ui/loading-spinner";
import { useProjects, createProject, generateNotebookAction, downloadFile } from "@/lib/hooks";
import { handleApiError } from "@/lib/errors";
import type { Project } from "@/lib/api-client";

const MAX_CHATS = 5;

export default function DashboardPage() {
  const router = useRouter();
  const { projects, isLoading, refresh } = useProjects();
  
  const [file, setFile] = useState<File | null>(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [generatingId, setGeneratingId] = useState<string | null>(null);

  const completedCount = projects.filter((p) => p.dataset_path && p.notebook_path).length;
  const recentProjects = projects.slice(0, 5);
  const usedSlots = projects.length;
  const recentProject = recentProjects[0];

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) setFile(e.target.files[0]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      toast.error("Please select a file to upload");
      return;
    }

    setIsSubmitting(true);
    try {
      const project = await createProject(name, description, file);
      toast.success("Project created successfully!");
      refresh();
      router.push(`/dashboard/chat?project_id=${project.project_id}`);
    } catch (error) {
      handleApiError(error, "Failed to create project");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGenerateNotebook = async (projectId: string) => {
    setGeneratingId(projectId);
    try {
      await generateNotebookAction(projectId);
      toast.success("Notebook generated successfully!");
      refresh();
    } catch (error) {
      handleApiError(error, "Failed to generate notebook");
    } finally {
      setGeneratingId(null);
    }
  };

  const handleDownload = async (notebookPath: string) => {
    try {
      await downloadFile(notebookPath);
    } catch {
      // Error handled in downloadFile
    }
  };

  return (
    <div className="flex-1 min-h-0 space-y-6 overflow-y-auto p-4 pt-4 sm:p-6 sm:pt-6 lg:p-8">
      <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">Dashboard</h2>

      <StatsGrid
        usedSlots={usedSlots}
        completedCount={completedCount}
        recentProject={recentProject}
      />

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-5">
        <ProjectForm
          name={name}
          description={description}
          file={file}
          isSubmitting={isSubmitting}
          usedSlots={usedSlots}
          maxChats={MAX_CHATS}
          onNameChange={setName}
          onDescriptionChange={setDescription}
          onFileChange={handleFileChange}
          onSubmit={handleSubmit}
        />

        <RecentChatsCard
          projects={recentProjects}
          isLoading={isLoading}
          generatingId={generatingId}
          onGenerateNotebook={handleGenerateNotebook}
          onDownload={handleDownload}
        />
      </div>
    </div>
  );
}

function StatsGrid({
  usedSlots,
  completedCount,
  recentProject,
}: {
  usedSlots: number;
  completedCount: number;
  recentProject?: { metadata?: { name?: string }; project_slug?: string } | null;
}) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
      <StatsCard
        title="Chats Used"
        value={usedSlots}
        max={MAX_CHATS}
        icon={FolderOpen}
        description={`${MAX_CHATS - usedSlots} slot${MAX_CHATS - usedSlots !== 1 ? "s" : ""} remaining`}
      />
      <StatsCard
        title="Completed Chats"
        value={completedCount}
        max={MAX_CHATS}
        icon={CheckCircle2}
        description="Chat is complete once dataset + notebook are both present"
        variant="success"
      />
      <StatsCard
        title="Most Recent Chat"
        value={recentProject?.metadata?.name ?? recentProject?.project_slug ?? "-"}
        icon={Clock}
      />
    </div>
  );
}

function ProjectForm({
  name,
  description,
  file,
  isSubmitting,
  usedSlots,
  maxChats,
  onNameChange,
  onDescriptionChange,
  onFileChange,
  onSubmit,
}: {
  name: string;
  description: string;
  file: File | null;
  isSubmitting: boolean;
  usedSlots: number;
  maxChats: number;
  onNameChange: (v: string) => void;
  onDescriptionChange: (v: string) => void;
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSubmit: (e: React.FormEvent) => void;
}) {
  const isDisabled = isSubmitting || usedSlots >= maxChats;

  return (
    <Card className="lg:col-span-2">
      <CardHeader>
        <CardTitle>New Project</CardTitle>
        <CardDescription>Upload a dataset to start a new chat.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Project Name (Optional)</Label>
            <Input
              id="name"
              placeholder="e.g. Sales Data 2024"
              value={name}
              onChange={(e) => onNameChange(e.target.value)}
              disabled={isDisabled}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Description (Optional)</Label>
            <Textarea
              id="description"
              placeholder="Brief description..."
              value={description}
              onChange={(e) => onDescriptionChange(e.target.value)}
              disabled={isDisabled}
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
              onChange={onFileChange}
              disabled={isDisabled}
              className="cursor-pointer"
            />
          </div>
          <Button type="submit" className="w-full" disabled={isDisabled}>
            {isSubmitting ? (
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
          {usedSlots >= maxChats && (
            <p className="text-center text-xs text-destructive">
              You have reached the limit of {maxChats} chats.
            </p>
          )}
        </form>
      </CardContent>
    </Card>
  );
}

function RecentChatsCard({
  projects,
  isLoading,
  generatingId,
  onGenerateNotebook,
  onDownload,
}: {
  projects: Project[];
  isLoading: boolean;
  generatingId: string | null;
  onGenerateNotebook: (id: string) => void;
  onDownload: (path: string) => void;
}) {
  return (
    <Card className="lg:col-span-3">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageSquare className="h-5 w-5" /> Recent Chats
        </CardTitle>
        <CardDescription>Your last {MAX_CHATS} chat projects</CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <LoadingSpinner />
        ) : projects.length === 0 ? (
          <EmptyState
            icon={MessageSquare}
            title="No chats yet"
            description="Create your first project!"
          />
        ) : (
          <div className="flex flex-col divide-y">
            {projects.map((project) => (
              <ProjectCard
                key={project.project_id}
                project={project}
                isGenerating={generatingId === project.project_id}
                onGenerateNotebook={onGenerateNotebook}
                onDownload={onDownload}
              />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
