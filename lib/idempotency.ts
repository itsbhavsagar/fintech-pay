import { prisma } from "@/lib/prisma";

type IdempotencyResult = {
  id: string;
  data: {
    id: string;
    amount: number;
    currency: string;
    status: string;
    paymentState: string;
    idempotencyKey: string | null;
  };
};

const IDEMPOTENCY_TTL_MS = 24 * 60 * 60 * 1000;

export async function checkIdempotency(
  key: string,
): Promise<IdempotencyResult | null> {
  const existing = await prisma.transaction.findUnique({
    where: { idempotencyKey: key },
  });

  if (!existing) {
    return null;
  }

  const age = Date.now() - existing.createdAt.getTime();
  if (age < IDEMPOTENCY_TTL_MS) {
    return {
      id: existing.id,
      data: {
        id: existing.id,
        amount: existing.amount,
        currency: existing.currency,
        status: existing.status,
        paymentState: existing.paymentState,
        idempotencyKey: existing.idempotencyKey,
      },
    };
  }

  return null;
}

export async function storeIdempotency(
  key: string,
  transactionId: string,
): Promise<void> {
  await prisma.transaction.update({
    where: { id: transactionId },
    data: { idempotencyKey: key },
  });
}

export function generateIdempotencyKey(
  userId: string,
  amount: number,
  currency: string,
  razorpayId?: string | null,
): string {
  const components = [userId, amount, currency, razorpayId || ""].join("|");
  return Buffer.from(components).toString("base64");
}
