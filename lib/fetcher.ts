export async function fetchJson<TResponse>(input: RequestInfo | URL, init?: RequestInit): Promise<TResponse> {
  const response = await fetch(input, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...init?.headers,
    },
  });

  if (!response.ok) {
    const payload: unknown = await response.json().catch(() => null);
    const message =
      typeof payload === "object" &&
      payload !== null &&
      "error" in payload &&
      typeof payload.error === "string"
        ? payload.error
        : "Request failed";

    throw new Error(message);
  }

  return response.json() as Promise<TResponse>;
}
