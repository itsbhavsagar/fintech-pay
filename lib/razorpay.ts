import Razorpay from "razorpay";
import type { PaymentLinks } from "razorpay/dist/types/paymentLink";
import type { PaymentLinkStatus } from "@/types/domain";

export const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

export type RazorpayPaymentLink = PaymentLinks.RazorpayPaymentLink;
export type RazorpayPaymentLinkCreateInput = PaymentLinks.RazorpayPaymentLinkCreateRequestBody;

export function assertRazorpayConfigured(): void {
  if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
    throw new Error("Razorpay credentials are not configured.");
  }
}

export function verifyRazorpayWebhookSignature(body: string, signature: string): boolean {
  assertRazorpayConfigured();
  const secret = process.env.RAZORPAY_KEY_SECRET;

  if (!secret) {
    throw new Error("Razorpay credentials are not configured.");
  }

  return Razorpay.validateWebhookSignature(body, signature, secret);
}

export function normalizeRazorpayPaymentLinkStatus(status: RazorpayPaymentLink["status"]): PaymentLinkStatus {
  if (status === "paid") {
    return "paid";
  }

  if (status === "expired" || status === "cancelled") {
    return "expired";
  }

  return "active";
}
