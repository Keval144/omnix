import { useState, useCallback } from "react";
import { authenticatedJsonFetch } from "@/lib/api-client";
import { handleApiError } from "@/lib/errors";

export function useUploadDataset() {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const uploadDataset = useCallback(async (projectId: string, file: File) => {
    setIsUploading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("project_id", projectId);
      formData.append("file", file);

      const response = await authenticatedJsonFetch<{
        dataset_id: string;
        project_id: string;
        file_name: string;
        file_type: string;
      }>("/datasets/upload", {
        method: "POST",
        body: formData,
      });

      return response;
    } catch (err) {
      const errorMessage = handleApiError(err, "Failed to upload dataset");
      setError(new Error(errorMessage));
      throw err;
    } finally {
      setIsUploading(false);
    }
  }, []);

  return {
    uploadDataset,
    isUploading,
    error,
  };
}
