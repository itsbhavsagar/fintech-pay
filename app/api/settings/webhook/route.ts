import { NextResponse } from "next/server";
import { z } from "zod";
import { jsonError, parseJsonBody } from "@/lib/api";
import { requireSessionUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const webhookSchema = z.object({
  webhookUrl: z.string().url().max(300).nullable(),
});

export async function PATCH(request: Request): Promise<NextResponse> {
  try {
    const user = await requireSessionUser();
    const input = await parseJsonBody(request, webhookSchema);
    const updatedUser = await prisma.user.update({
      where: {
        id: user.id,
      },
      data: {
        webhookUrl: input.webhookUrl,
      },
      select: {
        webhookUrl: true,
      },
    });

    return NextResponse.json({
      webhookUrl: updatedUser.webhookUrl,
    });
  } catch (error: unknown) {
    return jsonError(error);
  }
}
