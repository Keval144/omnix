import { downloadNotebook as downloadNotebookApi } from "@/lib/api-client";
import { handleApiError } from "@/lib/errors";

export async function downloadFile(notebookPath: string): Promise<void> {
  try {
    const blob = await downloadNotebookApi(notebookPath);
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = notebookPath.split("/").pop() || "notebook.ipynb";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  } catch (error) {
    handleApiError(error, "Failed to download file");
    throw error;
  }
}
