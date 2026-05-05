"use client";

import { ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { StatusBadge } from "@/components/ui/status-badge";
import { formatCurrency, formatDateTime } from "@/lib/utils";
import type { TransactionDto } from "@/types/domain";
import Link from "next/link";

type TransactionDetailProps = {
  transaction: TransactionDto | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function TransactionDetail({
  transaction,
  open,
  onOpenChange,
}: TransactionDetailProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Transaction Detail</DialogTitle>
          <DialogDescription>
            {transaction?.id ?? "Payment record"}
          </DialogDescription>
        </DialogHeader>
        {transaction ? (
          <div className="space-y-5">
            <div className="flex items-center justify-between rounded-lg border bg-secondary p-4">
              <div>
                <p className="text-sm text-muted-foreground">Amount</p>
                <p className="text-2xl font-semibold tracking-normal">
                  {formatCurrency(transaction.amount, transaction.currency)}
                </p>
              </div>
              <StatusBadge status={transaction.status} />
            </div>

            <dl className="grid gap-3 text-sm sm:grid-cols-2">
              <div>
                <dt className="text-muted-foreground">Country</dt>
                <dd className="font-medium">{transaction.country}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Payment method</dt>
                <dd className="font-medium">{transaction.paymentMethod}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Created</dt>
                <dd className="font-medium">
                  {formatDateTime(transaction.createdAt)}
                </dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Description</dt>
                <dd className="font-medium">
                  {transaction.description ?? "Payment"}
                </dd>
              </div>
            </dl>

            <dl className="grid gap-3 text-sm sm:grid-cols-2">
              <div>
                <dt className="text-muted-foreground">Transaction ID</dt>
                <dd className="font-mono text-xs">{transaction.id}</dd>
              </div>
              {"idempotencyKey" in transaction &&
                transaction.idempotencyKey && (
                  <div>
                    <dt className="text-muted-foreground">Idempotency Key</dt>
                    <dd className="font-mono text-xs">
                      {transaction.idempotencyKey.slice(0, 12)}...
                    </dd>
                  </div>
                )}
            </dl>

            {transaction.razorpayId ? (
              <Button variant="outline" asChild>
                <Link
                  href={`https://dashboard.razorpay.com/app/payments/${transaction.razorpayId}`}
                  target="_blank"
                  rel="noreferrer"
                >
                  <ExternalLink className="size-4" />
                  Open Razorpay Payment
                </Link>
              </Button>
            ) : null}

            <div className="space-y-3">
              <p className="text-sm font-medium">Payment lifecycle</p>

              {(() => {
                const steps = [
                  { key: "created", label: "Created" },
                  { key: "authorized", label: "Authorized" },
                  { key: "captured", label: "Captured" },
                ];

                const map: Record<string, number> = {
                  created: 0,
                  authorized: 1,
                  captured: 2,
                };

                const current =
                  map[(transaction as any).paymentState as string] ?? 0;

                return (
                  <div className="flex items-center gap-2">
                    {steps.map((step, index) => (
                      <div key={step.key} className="flex items-center gap-2">
                        <div
                          className={`h-2 w-2 rounded-full ${
                            index <= current ? "bg-green-500" : "bg-muted"
                          }`}
                        />
                        <span className="text-xs">{step.label}</span>
                        {index < steps.length - 1 && (
                          <div className="h-px w-6 bg-muted" />
                        )}
                      </div>
                    ))}
                  </div>
                );
              })()}
            </div>

            <div className="flex items-center gap-2 text-xs">
              {(transaction as any).paymentState === "failed" && (
                <span className="text-red-500">Payment failed</span>
              )}
              {(transaction as any).paymentState === "retrying" && (
                <span className="text-yellow-500">Retrying payment</span>
              )}
            </div>

            <p className="text-xs text-muted-foreground">
              Current state: {(transaction as any).paymentState ?? "created"}
            </p>
          </div>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
