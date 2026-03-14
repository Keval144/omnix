import { authClient } from "@/lib/auth/client";

function getApiUrl() {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;

  if (!apiUrl) {
    throw new Error("NEXT_PUBLIC_API_URL is not set");
  }

  return apiUrl;
}

export class ApiClientError extends Error {
  status: number;
  response: Response;

  constructor(message: string, response: Response) {
    super(message);
    this.name = "ApiClientError";
    this.status = response.status;
    this.response = response;
  }
}

export async function authenticatedFetch(
  input: string,
  init: RequestInit = {},
) {
  const { data, error } = await authClient.token();

  if (error || !data?.token) {
    throw new Error(error?.message ?? "Failed to retrieve auth token");
  }

  const headers = new Headers(init.headers);
  headers.set("Authorization", `Bearer ${data.token}`);

  if (
    init.body &&
    !headers.has("Content-Type") &&
    !(init.body instanceof FormData)
  ) {
    headers.set("Content-Type", "application/json");
  }

  const response = await fetch(`${getApiUrl()}${input}`, {
    ...init,
    headers,
  });

  if (!response.ok) {
    throw new ApiClientError(
      `API request failed with status ${response.status}`,
      response,
    );
  }

  return response;
}

export async function authenticatedJsonFetch<T>(
  input: string,
  init: RequestInit = {},
): Promise<T> {
  const response = await authenticatedFetch(input, init);
  return response.json() as Promise<T>;
}
