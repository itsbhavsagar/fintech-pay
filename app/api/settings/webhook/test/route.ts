import { NextResponse } from "next/server";
import { jsonError } from "@/lib/api";
import { requireSessionUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(): Promise<NextResponse> {
  try {
    const user = await requireSessionUser();
    const merchant = await prisma.user.findUnique({
      where: {
        id: user.id,
      },
      select: {
        webhookUrl: true,
      },
    });

    if (!merchant?.webhookUrl) {
      return NextResponse.json({ error: "Set a webhook URL before testing." }, { status: 422 });
    }

    const response = await fetch(merchant.webhookUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        event: "paysense.webhook.test",
        createdAt: new Date().toISOString(),
      }),
    });

    return NextResponse.json({
      ok: response.ok,
      status: response.status,
    });
  } catch (error: unknown) {
    return jsonError(error);
  }
}
