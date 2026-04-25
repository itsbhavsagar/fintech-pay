import { ZodError, type ZodType } from "zod";
import { NextResponse } from "next/server";
import { AuthError } from "@/lib/auth";

export async function parseJsonBody<T>(request: Request, schema: ZodType<T>): Promise<T> {
  const payload: unknown = await request.json();
  return schema.parse(payload);
}

export function jsonError(error: unknown): NextResponse {
  if (error instanceof AuthError) {
    return NextResponse.json({ error: error.message }, { status: 401 });
  }

  if (error instanceof ZodError) {
    return NextResponse.json(
      {
        error: "Validation failed",
        details: error.issues.map((issue) => issue.message),
      },
      { status: 422 },
    );
  }

  if (error instanceof Error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ error: "Unexpected server error" }, { status: 500 });
}
