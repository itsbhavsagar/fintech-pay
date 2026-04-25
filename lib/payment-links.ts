import { prisma } from "@/lib/prisma";
import {
  assertRazorpayConfigured,
  normalizeRazorpayPaymentLinkStatus,
  razorpay,
  type RazorpayPaymentLinkCreateInput,
} from "@/lib/razorpay";
import { amountToMinorUnits } from "@/lib/utils";
import { toPaymentLinkDto } from "@/lib/mappers";
import type { PaymentLinkDto } from "@/types/domain";

type CreatePaymentLinkInput = {
  userId: string;
  title: string;
  amount: number;
  currency: string;
  expiresAt?: Date | null;
};

export async function createPaymentLink(input: CreatePaymentLinkInput): Promise<PaymentLinkDto> {
  assertRazorpayConfigured();

  const user = await prisma.user.findUniqueOrThrow({
    where: {
      id: input.userId,
    },
    select: {
      email: true,
      name: true,
      businessName: true,
    },
  });

  const payload: RazorpayPaymentLinkCreateInput = {
    amount: amountToMinorUnits(input.amount, input.currency),
    currency: input.currency,
    description: input.title,
    customer: {
      name: user.name ?? user.businessName ?? "PaySense Merchant",
      email: user.email,
    },
    notify: {
      email: true,
      sms: false,
    },
    reminder_enable: true,
    notes: {
      userId: input.userId,
      title: input.title,
    },
  };

  if (input.expiresAt) {
    payload.expire_by = Math.floor(input.expiresAt.getTime() / 1000);
  }

  const razorpayLink = await razorpay.paymentLink.create(payload);

  const paymentLink = await prisma.paymentLink.create({
    data: {
      userId: input.userId,
      title: input.title,
      amount: input.amount,
      currency: input.currency,
      razorpayLinkId: razorpayLink.id,
      shortUrl: razorpayLink.short_url,
      status: normalizeRazorpayPaymentLinkStatus(razorpayLink.status),
      expiresAt: input.expiresAt ?? null,
    },
  });

  return toPaymentLinkDto(paymentLink);
}
