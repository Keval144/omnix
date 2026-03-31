"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
} from "@/components/shadcn-ui/dialog";
import { Button } from "@/components/shadcn-ui/button";
import { Input } from "@/components/shadcn-ui/input";
import { Label } from "@/components/shadcn-ui/label";
import { Textarea } from "@/components/shadcn-ui/textarea";
import { PlusCircle, Loader2, UploadCloud } from "lucide-react";
import { toast } from "sonner";
import { authenticatedFetch } from "@/lib/api-client";
import useSWR from "swr";

const fetcher = () => authenticatedFetch("/projects").then((res) => res.json());

const MAX_CHATS = 5;

export function NewChatModal({
  onChatCreated,
}: {
  onChatCreated?: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const { data: projects, mutate } = useSWR("projects", fetcher);
  const chatCount = projects?.length ?? 0;
  const isLimitReached = chatCount >= MAX_CHATS;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLimitReached) {
      toast.error(`You can only create up to ${MAX_CHATS} chats`);
      return;
    }
    if (!name.trim()) {
      toast.error("Please enter a chat name");
      return;
    }

    setIsLoading(true);

    try {
      // 1. Create project
      const res = await authenticatedFetch("/projects", {
        method: "POST",
        body: JSON.stringify({
          metadata: { name, description, tags: ["chat"] },
        }),
      });
      const project = await res.json();

      // 2. Upload dataset if a file was selected
      if (file) {
        const formData = new FormData();
        formData.append("project_id", project.project_id);
        formData.append("file", file);
        await authenticatedFetch("/datasets/upload", {
          method: "POST",
          body: formData,
        });
      }

      toast.success("Chat created successfully!");
      setOpen(false);
      setName("");
      setDescription("");
      setFile(null);
      if (onChatCreated) onChatCreated();
      mutate();
      router.push(`/dashboard/chat?project_id=${project.project_id}`);
    } catch (error) {
      console.error(error);
      toast.error("Failed to create chat");
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenChange = (isOpen: boolean) => {
    if (isOpen && isLimitReached) {
      toast.error(`You can only create up to ${MAX_CHATS} chats. Delete an existing chat to create a new one.`);
      return;
    }
    setOpen(isOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger
        className="inline-flex w-full cursor-pointer items-center justify-start gap-2 rounded-md border border-input bg-background px-3 py-2 text-sm font-medium shadow-sm transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:opacity-50 disabled:cursor-not-allowed"
        disabled={isLimitReached}
      >
        <PlusCircle className="h-4 w-4" />
        {isLimitReached ? `Max ${MAX_CHATS} chats reached` : "New Chat"}
      </DialogTrigger>
      <DialogContent className="max-w-[calc(100vw-1.5rem)] sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create New Chat</DialogTitle>
          <DialogDescription>
            Start a new conversation thread. You can optionally describe the
            topic.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 pt-4">
          <div className="space-y-2">
            <Label htmlFor="name">
              Chat Name <span className="text-red-500">*</span>
            </Label>
            <Input
              id="name"
              placeholder="e.g. Sales Analysis DB Queries"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={isLoading}
              autoFocus
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Description (Optional)</Label>
            <Textarea
              id="description"
              placeholder="What is this chat about?"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={isLoading}
              rows={3}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="dataset" className="flex items-center gap-1.5">
              <UploadCloud className="h-4 w-4 text-muted-foreground" />
              Dataset File (Optional)
            </Label>
            <Input
              id="dataset"
              type="file"
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
              disabled={isLoading}
              className="cursor-pointer"
            />
            {file && (
              <p className="text-xs text-muted-foreground truncate">
                Selected: {file.name}
              </p>
            )}
          </div>
          <DialogFooter className="pt-4">
            <Button
              type="button"
              variant="ghost"
              onClick={() => setOpen(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading || !name.trim()}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Create Chat
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
