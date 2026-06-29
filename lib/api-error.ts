export class ApiError extends Error {
  readonly status: number;
  readonly code?: string;

  constructor(message: string, status: number, code?: string) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.code = code;
  }
}

export type AuthErrorDisplay =
  | { type: "form"; message: string }
  | { type: "toast"; message: string };

export function resolveAuthError(error: unknown): AuthErrorDisplay {
  if (error instanceof ApiError) {
    if (error.code === "DATABASE_UNAVAILABLE") {
      return {
        type: "toast",
        message: "We're having trouble signing you in. Please try again in a moment.",
      };
    }

    if (error.status === 401) {
      return {
        type: "form",
        message: "Invalid email or password.",
      };
    }

    if (error.status === 409) {
      return {
        type: "form",
        message: "An account already exists for this email.",
      };
    }

    if (error.status === 422) {
      return {
        type: "form",
        message: "Please check the details you entered.",
      };
    }

    if (error.status >= 500) {
      return {
        type: "toast",
        message: "Something went wrong on our end. Please try again.",
      };
    }

    return {
      type: "form",
      message: error.message,
    };
  }

  if (error instanceof Error) {
    return {
      type: "form",
      message: error.message,
    };
  }

  return {
    type: "toast",
    message: "Something went wrong. Please try again.",
  };
}
