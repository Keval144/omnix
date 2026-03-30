import { toast } from "sonner";
import { ZodError } from "zod";

export function handleApiError(error: unknown, fallbackMessage = "An error occurred"): string {
  console.error(error);

  if (error instanceof Error) {
    if (error.message.includes("Failed to retrieve auth token")) {
      toast.error("Session expired. Please sign in again.");
      return "Authentication required";
    }
    toast.error(error.message);
    return error.message;
  }

  toast.error(fallbackMessage);
  return fallbackMessage;
}

export function handleFormError(error: unknown): Record<string, string> {
  if (error instanceof ZodError) {
    const fieldErrors: Record<string, string> = {};
    const flattened = error.flatten();
    for (const [key, messages] of Object.entries(flattened.fieldErrors)) {
      if (Array.isArray(messages) && messages[0]) {
        fieldErrors[key] = messages[0];
      }
    }
    return fieldErrors;
  }
  return {};
}

export function getErrorMessage(error: unknown, fallback = "Unknown error"): string {
  if (error instanceof Error) return error.message;
  return fallback;
}

export function isApiError(error: unknown): error is { message: string; status?: number } {
  return typeof error === "object" && error !== null && "message" in error;
}
