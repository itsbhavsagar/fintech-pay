import { NextResponse } from "next/server";
import { revalidateUserDashboard } from "@/lib/cache";
import { z } from "zod";
import { jsonError, parseJsonBody } from "@/lib/api";
import { requireSessionUser, requireSessionUserId } from "@/lib/auth";
import { toPaymentLinkDto } from "@/lib/mappers";
import { createPaymentLink } from "@/lib/payment-links";
import { prisma } from "@/lib/prisma";
import { getPaginationParams } from "@/lib/utils";

const createPaymentLinkSchema = z.object({
  title: z.string().min(2).max(120),
  amount: z.number().positive(),
  currency: z.string().length(3).transform((value) => value.toUpperCase()),
  expiresAt: z.string().datetime().nullable().optional(),
});

export async function GET(request: Request): Promise<NextResponse> {
  try {
    const userId = await requireSessionUserId();
    const { searchParams } = new URL(request.url);
    const { limit, cursor } = getPaginationParams(request, 10);
    const search = searchParams.get("search");
    const status = searchParams.get("status");
    const month = searchParams.get("month");

    const where: {
      userId: string;
      title?: { contains: string; mode: "insensitive" };
      status?: string;
      createdAt?: { gte: Date; lte?: Date; lt?: Date };
    } = { userId };

    if (search) {
      where.title = { contains: search, mode: "insensitive" };
    }

    if (status && status !== "all") {
      where.status = status;
    }

    if (month && month !== "all") {
      const now = new Date();
      let startDate: Date | null = null;
      let endDate: Date | null = null;

      if (month === "30d") {
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      } else if (month === "90d") {
        startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
      } else if (month === "this-year") {
        startDate = new Date(now.getFullYear(), 0, 1);
      } else if (month === "last-year") {
        startDate = new Date(now.getFullYear() - 1, 0, 1);
        endDate = new Date(now.getFullYear(), 0, 1);
      }

      if (startDate) {
        where.createdAt = {
          gte: startDate,
          ...(endDate && { lt: endDate }),
        };
      }
    }

    const paymentLinks = await prisma.paymentLink.findMany({
      where,
      take: limit + 1,
      ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
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
      orderBy: [
        { createdAt: "desc" },
        { id: "desc" }
      ],
    });

    const visibleLinks = paymentLinks.slice(0, limit);
    const nextCursor = paymentLinks.length > limit ? (visibleLinks.at(-1)?.id ?? null) : null;

    return NextResponse.json(
      {
        paymentLinks: visibleLinks.map((link) => toPaymentLinkDto(link as any)),
        nextCursor,
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

    revalidateUserDashboard(user.id);
    return NextResponse.json({ paymentLink }, { status: 201 });
  } catch (error: unknown) {
    return jsonError(error);
  }
}
