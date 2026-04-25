import { NextResponse } from "next/server";
import { z } from "zod";
import { jsonError, parseJsonBody } from "@/lib/api";
import { setAuthCookie, signAuthToken, verifyPassword } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const loginSchema = z.object({
  email: z.string().email().max(120).transform((value) => value.toLowerCase()),
  password: z.string().min(1).max(100),
});

export async function POST(request: Request): Promise<NextResponse> {
  try {
    const input = await parseJsonBody(request, loginSchema);
    const user = await prisma.user.findUnique({
      where: {
        email: input.email,
      },
    });

    if (!user) {
      return NextResponse.json({ error: "Invalid email or password." }, { status: 401 });
    }

    const validPassword = await verifyPassword(input.password, user.password);

    if (!validPassword) {
      return NextResponse.json({ error: "Invalid email or password." }, { status: 401 });
    }

    const token = await signAuthToken(user);
    const response = NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        businessName: user.businessName,
        apiKey: user.apiKey,
        webhookUrl: user.webhookUrl,
        createdAt: user.createdAt.toISOString(),
      },
    });
    setAuthCookie(response, token);

    return response;
  } catch (error: unknown) {
    return jsonError(error);
  }
}
