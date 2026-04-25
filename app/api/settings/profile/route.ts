import { NextResponse } from "next/server";
import { z } from "zod";
import { jsonError, parseJsonBody } from "@/lib/api";
import { requireSessionUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const profileSchema = z.object({
  name: z.string().min(2).max(80),
  businessName: z.string().min(2).max(120),
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
      select: {
        id: true,
        email: true,
        name: true,
        businessName: true,
        apiKey: true,
        webhookUrl: true,
        createdAt: true,
      },
    });

    return NextResponse.json({
      user: {
        ...updatedUser,
        createdAt: updatedUser.createdAt.toISOString(),
      },
    });
  } catch (error: unknown) {
    return jsonError(error);
  }
}
