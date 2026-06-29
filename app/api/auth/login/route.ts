import { NextResponse } from "next/server";
import { z } from "zod";
import { jsonError, parseJsonBody } from "@/lib/api";
import {
  attachSessionCookie,
  sessionUserSelect,
  toSessionUser,
  verifyPassword,
} from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { withDatabaseRetry, neonDatabaseRetryOptions } from "@/lib/prisma-retry";

const loginSchema = z.object({
  email: z.string().email().max(120).transform((value) => value.toLowerCase()),
  password: z.string().min(1).max(100),
  rememberMe: z.boolean().optional().default(false),
});

export async function POST(request: Request): Promise<NextResponse> {
  try {
    const input = await parseJsonBody(request, loginSchema);
    const user = await withDatabaseRetry(
      () =>
        prisma.user.findUnique({
          where: {
            email: input.email,
          },
          select: {
            ...sessionUserSelect,
            password: true,
          },
        }),
      neonDatabaseRetryOptions,
    );

    if (!user) {
      return NextResponse.json({ error: "Invalid email or password." }, { status: 401 });
    }

    const validPassword = await verifyPassword(input.password, user.password);

    if (!validPassword) {
      return NextResponse.json({ error: "Invalid email or password." }, { status: 401 });
    }

    const sessionUser = toSessionUser(user);
    const response = NextResponse.json({ user: sessionUser });
    await attachSessionCookie(response, sessionUser, input.rememberMe);

    return response;
  } catch (error: unknown) {
    return jsonError(error);
  }
}
