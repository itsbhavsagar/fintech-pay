import { NextResponse } from "next/server";
import { z } from "zod";
import { jsonError, parseJsonBody } from "@/lib/api";
import {
  attachSessionCookie,
  requireSessionUser,
  sessionUserSelect,
  toSessionUser,
} from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const profileSchema = z.object({
  name: z.string().min(2).max(80),
  businessName: z.string().min(2).max(120),
  image: z.string().url().nullable().optional(),
});

export async function PATCH(request: Request): Promise<NextResponse> {
  try {
    const user = await requireSessionUser();
    const input = await parseJsonBody(request, profileSchema);
    const updatedUser = await prisma.user.update({
      where: {
        id: user.id,
      },
      data: input,
      select: sessionUserSelect,
    });

    const sessionUser = toSessionUser(updatedUser);
    const response = NextResponse.json({ user: sessionUser });
    await attachSessionCookie(response, sessionUser);

    return response;
  } catch (error: unknown) {
    return jsonError(error);
  }
}
