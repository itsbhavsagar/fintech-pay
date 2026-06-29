import { Prisma } from "@prisma/client";
import { unstable_cache } from "next/cache";
import {
  dateInputToEndOfDay,
  dateInputToStartOfDay,
  normalizeDateRange,
} from "@/lib/date-range";
import { toTransactionDto } from "@/lib/mappers";
import { prisma } from "@/lib/prisma";
import type { TransactionDto, TransactionStatus } from "@/types/domain";

export type TransactionListFilters = {
  search?: string;
  status?: TransactionStatus | "all";
  currency?: string;
  from?: string;
  to?: string;
  limit?: number;
  cursor?: string | null;
};

export type TransactionsPage = {
  transactions: TransactionDto[];
  nextCursor: string | null;
};

function buildWhere(
  userId: string,
  filters: TransactionListFilters,
): Prisma.TransactionWhereInput {
  const where: Prisma.TransactionWhereInput = { userId };

  if (filters.status && filters.status !== "all") {
    where.status = filters.status;
  }

  if (filters.currency && filters.currency !== "all") {
    where.currency = filters.currency;
  }

  if (filters.search?.trim()) {
    where.OR = [
      { id: { contains: filters.search.trim() } },
      {
        description: {
          contains: filters.search.trim(),
          mode: "insensitive",
        },
      },
    ];
  }

  if (filters.from || filters.to) {
    const { from, to } = normalizeDateRange(filters.from, filters.to);
    where.createdAt = {
      ...(from ? { gte: dateInputToStartOfDay(from) } : {}),
      ...(to ? { lte: dateInputToEndOfDay(to) } : {}),
    };
  }

  return where;
}

export async function getTransactionsPage(
  userId: string,
  filters: TransactionListFilters = {},
): Promise<TransactionsPage> {
  const limit = filters.limit ?? 10;
  const where = buildWhere(userId, filters);

  const transactions = await prisma.transaction.findMany({
    where,
    take: limit + 1,
    ...(filters.cursor
      ? {
          cursor: { id: filters.cursor },
          skip: 1,
        }
      : {}),
    orderBy: [{ createdAt: "desc" }, { id: "desc" }],
    select: {
      id: true,
      amount: true,
      currency: true,
      status: true,
      paymentState: true,
      country: true,
      paymentMethod: true,
      razorpayId: true,
      idempotencyKey: true,
      description: true,
      createdAt: true,
    },
  });

  const visibleTransactions = transactions.slice(0, limit);
  const nextCursor =
    transactions.length > limit
      ? (visibleTransactions.at(-1)?.id ?? null)
      : null;

  return {
    transactions: visibleTransactions.map((tx) => toTransactionDto(tx as any)),
    nextCursor,
  };
}

export async function getTransactionFilters(userId: string): Promise<{
  currencies: string[];
  statuses: string[];
}> {
  const cachedFn = unstable_cache(
    async (uid: string) => {
      const [currencies, statuses] = await Promise.all([
        prisma.transaction.findMany({
          where: { userId: uid },
          select: { currency: true },
          distinct: ["currency"],
          orderBy: { currency: "asc" },
        }),
        prisma.transaction.findMany({
          where: { userId: uid },
          select: { status: true },
          distinct: ["status"],
          orderBy: { status: "asc" },
        }),
      ]);

      return {
        currencies: currencies.map((item) => item.currency),
        statuses: statuses.map((item) => item.status),
      };
    },
    ["transaction-filters"],
    { revalidate: 300, tags: [`transaction-filters-${userId}`] },
  );

  return cachedFn(userId);
}
