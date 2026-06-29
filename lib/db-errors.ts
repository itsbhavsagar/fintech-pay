import { isRecord } from "@/lib/utils";

const PRISMA_CONNECTION_CODES = new Set(["P1001", "P1002", "P1017", "P2024"]);

export class DatabaseUnavailableError extends Error {
  constructor(message = "Unable to reach the database.") {
    super(message);
    this.name = "DatabaseUnavailableError";
  }
}

function matchesConnectionMessage(message: string): boolean {
  const lower = message.toLowerCase();
  return (
    lower.includes("can't reach database") ||
    lower.includes("cannot reach database") ||
    lower.includes("connection refused") ||
    lower.includes("econnrefused") ||
    lower.includes("enotfound") ||
    lower.includes("etimedout") ||
    lower.includes("network") ||
    lower.includes("fetch failed") ||
    lower.includes("connection timed out")
  );
}

function getErrorCode(error: unknown): string | null {
  if (!isRecord(error) || typeof error.code !== "string") {
    return null;
  }
  return error.code;
}

export function isDatabaseConnectionError(error: unknown): boolean {
  if (error instanceof DatabaseUnavailableError) {
    return true;
  }

  const code = getErrorCode(error);
  if (code && PRISMA_CONNECTION_CODES.has(code)) {
    return true;
  }

  if (error instanceof Error) {
    if (
      error.name === "PrismaClientKnownRequestError" ||
      error.name === "PrismaClientInitializationError"
    ) {
      return true;
    }

    return matchesConnectionMessage(error.message);
  }

  if (isRecord(error) && typeof error.message === "string") {
    return matchesConnectionMessage(error.message);
  }

  return false;
}

export function toDatabaseUnavailableError(error: unknown): DatabaseUnavailableError {
  if (error instanceof DatabaseUnavailableError) {
    return error;
  }

  return new DatabaseUnavailableError();
}
