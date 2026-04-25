import { NextResponse } from "next/server";
import { z } from "zod";
import { hashPassword, setAuthCookie, signAuthToken } from "@/lib/auth";
import { jsonError, parseJsonBody } from "@/lib/api";
import { prisma } from "@/lib/prisma";

const registerSchema = z.object({
  name: z.string().min(2).max(80),
  email: z.string().email().max(120).transform((value) => value.toLowerCase()),
  businessName: z.string().min(2).max(120),
  password: z.string().min(6).max(100),
});

export async function POST(request: Request): Promise<NextResponse> {
  try {
    const input = await parseJsonBody(request, registerSchema);
    const existingUser = await prisma.user.findUnique({
      where: {
        email: input.email,
      },
      select: {
        id: true,
      },
    });

    if (existingUser) {
      return NextResponse.json({ error: "An account already exists for this email." }, { status: 409 });
    }

    const user = await prisma.user.create({
      data: {
        name: input.name,
        email: input.email,
        businessName: input.businessName,
        password: await hashPassword(input.password),
      },
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

    const token = await signAuthToken(user);
    const response = NextResponse.json(
      {
        user: {
          ...user,
          createdAt: user.createdAt.toISOString(),
        },
      },
      { status: 201 },
    );
    setAuthCookie(response, token);

    return response;
  } catch (error: unknown) {
    return jsonError(error);
  }
}
