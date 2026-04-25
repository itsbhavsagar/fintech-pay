import type { PaymentLink, Settlement, Transaction } from "@prisma/client";
import type {
  PaymentLinkDto,
  PaymentLinkStatus,
  SettlementDto,
  SettlementStatus,
  TransactionDto,
  TransactionStatus,
} from "@/types/domain";

const transactionStatuses: readonly TransactionStatus[] = ["success", "failed", "pending"];
const paymentLinkStatuses: readonly PaymentLinkStatus[] = ["active", "expired", "paid"];
const settlementStatuses: readonly SettlementStatus[] = ["pending", "processing", "settled"];

function normalizeStatus<TStatus extends string>(value: string, allowed: readonly TStatus[], fallback: TStatus): TStatus {
  const status = allowed.find((allowedStatus) => allowedStatus === value);
  return status ?? fallback;
}

export function toTransactionDto(transaction: Transaction): TransactionDto {
  return {
    id: transaction.id,
    amount: transaction.amount,
    currency: transaction.currency,
    status: normalizeStatus(transaction.status, transactionStatuses, "pending"),
    country: transaction.country,
    paymentMethod: transaction.paymentMethod,
    razorpayId: transaction.razorpayId,
    description: transaction.description,
    createdAt: transaction.createdAt.toISOString(),
  };
}

export function toPaymentLinkDto(paymentLink: PaymentLink): PaymentLinkDto {
  return {
    id: paymentLink.id,
    title: paymentLink.title,
    amount: paymentLink.amount,
    currency: paymentLink.currency,
    razorpayLinkId: paymentLink.razorpayLinkId,
    shortUrl: paymentLink.shortUrl,
    status: normalizeStatus(paymentLink.status, paymentLinkStatuses, "active"),
    expiresAt: paymentLink.expiresAt?.toISOString() ?? null,
    createdAt: paymentLink.createdAt.toISOString(),
  };
}

export function toSettlementDto(settlement: Settlement): SettlementDto {
  return {
    id: settlement.id,
    amount: settlement.amount,
    currency: settlement.currency,
    status: normalizeStatus(settlement.status, settlementStatuses, "pending"),
    settledAt: settlement.settledAt?.toISOString() ?? null,
    createdAt: settlement.createdAt.toISOString(),
  };
}
