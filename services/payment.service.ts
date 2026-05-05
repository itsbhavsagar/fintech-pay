import { prisma } from "@/lib/prisma";
import { checkIdempotency, storeIdempotency } from "@/lib/idempotency";

type PaymentStateTransition =
  | "created"
  | "authorized"
  | "captured"
  | "failed"
  | "retrying";

export type CreatePaymentInput = {
  userId: string;
  razorpayId: string;
  amount: number;
  currency: string;
  country: string;
  paymentMethod: string;
  status: string;
  description?: string;
  idempotencyKey?: string;
};

export type WebhookEventInput = {
  razorpayId: string;
  event: "payment.authorized" | "payment.captured" | "payment.failed";
  amount: number;
  currency: string;
  status: string;
};

//  Create or retrieve idempotent payment transaction

export async function createPaymentTransaction(input: CreatePaymentInput) {
  // Check idempotency
  if (input.idempotencyKey) {
    const existing = await checkIdempotency(input.idempotencyKey);
    if (existing) {
      return existing;
    }
  }

  // Ensure currency is uppercase
  const currency = input.currency.toUpperCase();

  // Create transaction
  const transaction = await prisma.transaction.create({
    data: {
      userId: input.userId,
      razorpayId: input.razorpayId,
      amount: input.amount,
      currency,
      country: input.country,
      paymentMethod: input.paymentMethod,
      status: input.status,
      paymentState: "created",
      description: input.description,
      idempotencyKey: input.idempotencyKey,
    },
  });

  return transaction;
}

/**
 * Handle payment lifecycle transitions based on webhook events
 */
export async function handlePaymentStateTransition(
  input: WebhookEventInput,
): Promise<{ success: boolean; transaction?: unknown; error?: string }> {
  try {
    // Find existing transaction by razorpayId
    const existing = await prisma.transaction.findFirst({
      where: {
        razorpayId: input.razorpayId,
      },
    });

    if (!existing) {
      return {
        success: false,
        error: `Transaction with razorpayId ${input.razorpayId} not found`,
      };
    }

    // Determine new state based on event
    let newState: PaymentStateTransition;
    switch (input.event) {
      case "payment.authorized":
        newState = "authorized";
        break;
      case "payment.captured":
        newState = "captured";
        break;
      case "payment.failed":
        newState = "failed";
        break;
      default:
        return {
          success: false,
          error: `Unknown payment event: ${input.event}`,
        };
    }

    // Update transaction with new state
    const updated = await prisma.transaction.update({
      where: { id: existing.id },
      data: {
        paymentState: newState,
        status: input.status,
        currency: input.currency.toUpperCase(),
        amount: input.amount,
        updatedAt: new Date(),
      },
    });

    return {
      success: true,
      transaction: updated,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Get transaction with payment state
 */
export async function getTransactionWithState(transactionId: string) {
  return prisma.transaction.findUnique({
    where: { id: transactionId },
  });
}

/**
 * Get all transactions for a user with pagination
 */
export async function getUserTransactions(
  userId: string,
  limit: number = 10,
  cursor?: string,
  filters?: {
    search?: string;
    status?: string;
    currency?: string;
    from?: string;
    to?: string;
  },
) {
  const where: any = { userId };

  if (filters?.search) {
    where.OR = [
      { razorpayId: { contains: filters.search, mode: "insensitive" } },
      { country: { contains: filters.search, mode: "insensitive" } },
      { description: { contains: filters.search, mode: "insensitive" } },
    ];
  }

  if (filters?.status && filters.status !== "all") {
    where.status = filters.status;
  }

  if (filters?.currency && filters.currency !== "all") {
    where.currency = filters.currency.toUpperCase();
  }

  if (filters?.from) {
    where.createdAt = {
      ...where.createdAt,
      gte: new Date(filters.from),
    };
  }

  if (filters?.to) {
    where.createdAt = {
      ...where.createdAt,
      lte: new Date(filters.to),
    };
  }

  const transactions = await prisma.transaction.findMany({
    where,
    orderBy: { createdAt: "desc" },
    take: limit + 1,
    cursor: cursor ? { id: cursor } : undefined,
    skip: cursor ? 1 : 0,
  });

  const hasMore = transactions.length > limit;
  const data = hasMore ? transactions.slice(0, -1) : transactions;
  const nextCursor = hasMore ? data[data.length - 1]?.id : null;

  return {
    transactions: data,
    nextCursor,
    hasMore,
  };
}
