import { NextResponse } from "next/server";
import { jsonError } from "@/lib/api";
import { requireSessionUser } from "@/lib/auth";
import { toSettlementDto } from "@/lib/mappers";
import { prisma } from "@/lib/prisma";

export async function GET(): Promise<NextResponse> {
  try {
    const user = await requireSessionUser();
    const settlements = await prisma.settlement.findMany({
      where: {
        userId: user.id,
      },
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
    const pendingPayout = settlements
      .filter((settlement) => settlement.status === "pending" || settlement.status === "processing")
      .reduce((sum, settlement) => sum + settlement.amount, 0);
    const nextSettlementDate = new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString();

    return NextResponse.json(
      {
        settlements: settlements.map((s) => toSettlementDto(s as any)),
        summary: {
          pendingPayout: Number(pendingPayout.toFixed(2)),
          nextSettlementDate,
        },
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
