import { type NextRequest, NextResponse } from "next/server";
import { jsonError } from "@/lib/api";
import { requireSessionUserId } from "@/lib/auth";
import { toSettlementDto } from "@/lib/mappers";
import { prisma } from "@/lib/prisma";
import { getPaginationParams } from "@/lib/utils";

export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const userId = await requireSessionUserId();
    const { limit, cursor } = getPaginationParams(request, 10);

    const settlements = await prisma.settlement.findMany({
      where: {
        userId: userId,
      },
      take: limit + 1,
      ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
      select: {
        id: true,
        amount: true,
        currency: true,
        status: true,
        settledAt: true,
        createdAt: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });
    const visibleSettlements = settlements.slice(0, limit);
    const nextCursor = settlements.length > limit ? (visibleSettlements.at(-1)?.id ?? null) : null;

    const pendingAgg = await prisma.settlement.aggregate({
      where: {
        userId: userId,
        status: { in: ["pending", "processing"] },
      },
      _sum: { amount: true },
    });
    const pendingPayout = pendingAgg._sum.amount ?? 0;
    const nextSettlementDate = new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString();

    return NextResponse.json(
      {
        settlements: visibleSettlements.map((s) => toSettlementDto(s as any)),
        summary: {
          pendingPayout: Number(pendingPayout.toFixed(2)),
          nextSettlementDate,
        },
        nextCursor,
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
