import { randomBytes } from "node:crypto";
import { NextResponse } from "next/server";
import { jsonError } from "@/lib/api";
import { requireSessionUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

function generateApiKey(): string {
  return `ps_${randomBytes(24).toString("hex")}`;
}

export async function POST(): Promise<NextResponse> {
  try {
    const user = await requireSessionUser();
    const updatedUser = await prisma.user.update({
      where: {
        id: user.id,
      },
      data: {
        apiKey: generateApiKey(),
      },
      select: {
        apiKey: true,
      },
    });

    return NextResponse.json({
      apiKey: updatedUser.apiKey,
    });
  } catch (error: unknown) {
    return jsonError(error);
  }
}
