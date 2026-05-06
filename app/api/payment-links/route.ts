import { NextResponse } from "next/server";
import { revalidateTag } from "next/cache";
import { z } from "zod";
import { jsonError, parseJsonBody } from "@/lib/api";
import { requireSessionUser } from "@/lib/auth";
import { toPaymentLinkDto } from "@/lib/mappers";
import { createPaymentLink } from "@/lib/payment-links";
import { prisma } from "@/lib/prisma";

const createPaymentLinkSchema = z.object({
  title: z.string().min(2).max(120),
  amount: z.number().positive(),
  currency: z.string().length(3).transform((value) => value.toUpperCase()),
  expiresAt: z.string().datetime().nullable().optional(),
});

export async function GET(): Promise<NextResponse> {
  try {
    const user = await requireSessionUser();
    const paymentLinks = await prisma.paymentLink.findMany({
      where: {
        userId: user.id,
      },
      select: {
        id: true,
        title: true,
        amount: true,
        currency: true,
        razorpayLinkId: true,
        shortUrl: true,
        status: true,
        expiresAt: true,
        createdAt: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(
      {
        paymentLinks: paymentLinks.map((link) => toPaymentLinkDto(link as any)),
      },
      {
        headers: {
          "Cache-Control": "private, max-age=60, stale-while-revalidate=300",
        },
      }
    );
  } catch (error: unknown) {
    return jsonError(error);
  }
}

export async function POST(request: Request): Promise<NextResponse> {
  try {
    const user = await requireSessionUser();
    const input = await parseJsonBody(request, createPaymentLinkSchema);
    const paymentLink = await createPaymentLink({
      userId: user.id,
      title: input.title,
      amount: input.amount,
      currency: input.currency,
      expiresAt: input.expiresAt ? new Date(input.expiresAt) : null,
    });

    revalidateTag(`dashboard-stats-${user.id}`);
    return NextResponse.json({ paymentLink }, { status: 201 });
  } catch (error: unknown) {
    return jsonError(error);
  }
}
