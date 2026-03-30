import useSWR from "swr";
import { authenticatedJsonFetch, type Project } from "@/lib/api-client";
import { handleApiError } from "@/lib/errors";

const PROJECTS_KEY = "projects";

export function useProjects() {
  const fetcher = () => authenticatedJsonFetch<Project[]>(`/projects`);

  const { data, isLoading, error, mutate } = useSWR<Project[]>(
    PROJECTS_KEY,
    fetcher,
    { revalidateOnFocus: false, dedupingInterval: 60000 }
  );

  return {
    projects: data ?? [],
    isLoading,
    error,
    refresh: mutate,
  };
}

export function useProject(projectId: string | null) {
  const fetcher = () =>
    projectId ? authenticatedJsonFetch<Project>(`/projects/${projectId}`) : null;

  const { data, isLoading, error, mutate } = useSWR<Project | null>(
    projectId ? `project-${projectId}` : null,
    fetcher,
    { revalidateOnFocus: false, dedupingInterval: 30000 }
  );

  return {
    project: data,
    isLoading,
    error,
    refresh: mutate,
  };
}

export async function createProject(name: string, description: string, file: File) {
  try {
    const projectRes = await authenticatedJsonFetch<{ project_id: string }>("/projects", {
      method: "POST",
      body: JSON.stringify({
        metadata: { name: name || file.name, description, tags: [] },
      }),
    });

    const formData = new FormData();
    formData.append("project_id", projectRes.project_id);
    formData.append("file", file);

    await authenticatedJsonFetch("/datasets/upload", {
      method: "POST",
      body: formData,
    });

    return projectRes;
  } catch (error) {
    throw new Error(handleApiError(error, "Failed to create project"));
  }
}

export async function generateNotebookAction(projectId: string) {
  try {
    const response = await authenticatedJsonFetch<{
      notebook_id: string;
      notebook_path: string;
    }>("/notebook/generate", {
      method: "POST",
      body: JSON.stringify({ project_id: projectId }),
    });
    return response;
  } catch (error) {
    throw new Error(handleApiError(error, "Failed to generate notebook"));
  }
}
