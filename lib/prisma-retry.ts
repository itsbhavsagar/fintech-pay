import { isDatabaseConnectionError } from "@/lib/db-errors";

type RetryOptions = {
  attempts?: number;
  delayMs?: number;
};


export const neonDatabaseRetryOptions: RetryOptions = {
  attempts: 4,
  delayMs: 2000,
};

function wait(ms: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

export async function withDatabaseRetry<T>(
  operation: () => Promise<T>,
  { attempts = 3, delayMs = 1500 }: RetryOptions = {},
): Promise<T> {
  let lastError: unknown;

  for (let attempt = 0; attempt < attempts; attempt += 1) {
    try {
      return await operation();
    } catch (error: unknown) {
      lastError = error;

      if (!isDatabaseConnectionError(error) || attempt === attempts - 1) {
        throw error;
      }

      await wait(delayMs);
    }
  }

  throw lastError;
}
