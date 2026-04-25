import { Prisma } from "@prisma/client";
import { type NextRequest, NextResponse } from "next/server";
import { jsonError } from "@/lib/api";
import { requireSessionUser } from "@/lib/auth";
import { toTransactionDto } from "@/lib/mappers";
import { prisma } from "@/lib/prisma";
import { clamp } from "@/lib/utils";
import type { TransactionStatus } from "@/types/domain";

const statuses: readonly TransactionStatus[] = ["success", "failed", "pending"];

function getStatus(value: string | null): TransactionStatus | null {
  return statuses.find((status) => status === value) ?? null;
}

export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const user = await requireSessionUser();
    const params = request.nextUrl.searchParams;
    const limit = clamp(Number(params.get("limit") ?? "10"), 1, 50);
    const cursor = params.get("cursor");
    const search = params.get("search")?.trim();
    const currency = params.get("currency")?.trim();
    const from = params.get("from");
    const to = params.get("to");
    const status = getStatus(params.get("status"));

    const where: Prisma.TransactionWhereInput = {
      userId: user.id,
    };

    if (status) {
      where.status = status;
    }

    if (currency && currency !== "all") {
      where.currency = currency;
    }

    if (search) {
      where.OR = [
        {
          id: {
            contains: search,
          },
        },
        {
          description: {
            contains: search,
            mode: "insensitive",
          },
        },
      ];
    }

    if (from || to) {
      where.createdAt = {
        ...(from ? { gte: new Date(from) } : {}),
        ...(to ? { lte: new Date(to) } : {}),
      };
    }

    const transactions = await prisma.transaction.findMany({
      where,
      take: limit + 1,
      ...(cursor
        ? {
            cursor: {
              id: cursor,
            },
            skip: 1,
          }
        : {}),
      orderBy: [
        {
          createdAt: "desc",
        },
        {
          id: "desc",
        },
      ],
    });

    const visibleTransactions = transactions.slice(0, limit);
    const nextCursor = transactions.length > limit ? (visibleTransactions.at(-1)?.id ?? null) : null;

    return NextResponse.json({
      transactions: visibleTransactions.map(toTransactionDto),
      nextCursor,
    });
  } catch (error: unknown) {
    return jsonError(error);
  }
}
