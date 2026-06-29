import { NextResponse } from "next/server";
import { jsonError } from "@/lib/api";
import { revalidateUserDashboard } from "@/lib/cache";
import { prisma } from "@/lib/prisma";
import { verifyRazorpayWebhookSignature } from "@/lib/razorpay";
import { isRecord } from "@/lib/utils";

type RazorpayPaymentEntity = {
  id: string;
  amount: number;
  currency: string;
  status: string;
  method?: string;
  description?: string | null;
  created_at?: number;
  notes?: Record<string, unknown>;
};

function readPaymentEntity(payload: unknown): RazorpayPaymentEntity | null {
  if (!isRecord(payload)) {
    return null;
  }

  const payloadRecord = payload.payload;

  if (!isRecord(payloadRecord)) {
    return null;
  }

  const payment = payloadRecord.payment;

  if (!isRecord(payment)) {
    return null;
  }

  const entity = payment.entity;

  if (!isRecord(entity)) {
    return null;
  }

  if (
    typeof entity.id !== "string" ||
    typeof entity.amount !== "number" ||
    typeof entity.currency !== "string" ||
    typeof entity.status !== "string"
  ) {
    return null;
  }

  return {
    id: entity.id,
    amount: entity.amount,
    currency: entity.currency,
    status: entity.status,
    method: typeof entity.method === "string" ? entity.method : undefined,
    description: typeof entity.description === "string" ? entity.description : null,
    created_at: typeof entity.created_at === "number" ? entity.created_at : undefined,
    notes: isRecord(entity.notes) ? entity.notes : undefined,
  };
}

function readEvent(payload: unknown): string | null {
  return isRecord(payload) && typeof payload.event === "string" ? payload.event : null;
}

function readPaymentLinkId(payload: unknown): string | null {
  if (!isRecord(payload) || !isRecord(payload.payload)) {
    return null;
  }

  const paymentLink = payload.payload.payment_link;

  if (!isRecord(paymentLink) || !isRecord(paymentLink.entity)) {
    return null;
  }

  return typeof paymentLink.entity.id === "string" ? paymentLink.entity.id : null;
}

export async function POST(request: Request): Promise<NextResponse> {
  try {
    const signature = request.headers.get("x-razorpay-signature");
    const body = await request.text();

    if (!signature || !verifyRazorpayWebhookSignature(body, signature)) {
      return NextResponse.json({ error: "Invalid Razorpay signature." }, { status: 400 });
    }

    const payload: unknown = JSON.parse(body);
    const event = readEvent(payload);

    if (event !== "payment.captured") {
      return NextResponse.json({ received: true });
    }

    const payment = readPaymentEntity(payload);

    if (!payment) {
      return NextResponse.json({ error: "Unsupported Razorpay payload." }, { status: 422 });
    }

    const userId = typeof payment.notes?.userId === "string" ? payment.notes.userId : null;

    if (!userId) {
      return NextResponse.json({ error: "Webhook payload is missing merchant context." }, { status: 422 });
    }

    const existingTransaction = await prisma.transaction.findFirst({
      where: {
        userId,
        razorpayId: payment.id,
      },
      select: {
        id: true,
      },
    });
    const transactionData = {
      userId,
      amount: payment.amount / 100,
      currency: payment.currency,
      status: "success",
      country: "IN",
      paymentMethod: payment.method ?? "card",
      razorpayId: payment.id,
      description: payment.description ?? "Razorpay captured payment",
      createdAt: payment.created_at ? new Date(payment.created_at * 1000) : new Date(),
    };

    if (existingTransaction) {
      await prisma.transaction.update({
        where: {
          id: existingTransaction.id,
        },
        data: transactionData,
      });
    } else {
      await prisma.transaction.create({
        data: transactionData,
      });
    }

    const paymentLinkId = readPaymentLinkId(payload);

    if (paymentLinkId) {
      await prisma.paymentLink.updateMany({
        where: {
          userId,
          razorpayLinkId: paymentLinkId,
        },
        data: {
          status: "paid",
        },
      });
    }

    revalidateUserDashboard(userId);

    return NextResponse.json({ received: true });
  } catch (error: unknown) {
    return jsonError(error);
  }
}
