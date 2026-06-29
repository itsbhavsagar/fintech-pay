import { ApiError } from "@/lib/api-error";

type ErrorPayload = {
  error?: string;
  code?: string;
};

export async function fetchJson<TResponse>(
  input: RequestInfo | URL,
  init?: RequestInit,
): Promise<TResponse> {
  const response = await fetch(input, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...init?.headers,
    },
  });

  if (!response.ok) {
    const payload = (await response.json().catch(() => null)) as ErrorPayload | null;
    const message =
      payload?.error && typeof payload.error === "string"
        ? payload.error
        : "Request failed";
    const code =
      payload?.code && typeof payload.code === "string" ? payload.code : undefined;

    throw new ApiError(message, response.status, code);
  }

  return response.json() as Promise<TResponse>;
}
