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

type TransactionDetailProps = {
  transaction: TransactionDto | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function TransactionDetail({ transaction, open, onOpenChange }: TransactionDetailProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Transaction Detail</DialogTitle>
          <DialogDescription>{transaction?.id ?? "Payment record"}</DialogDescription>
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
                <dd className="font-medium">{formatDateTime(transaction.createdAt)}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Description</dt>
                <dd className="font-medium">{transaction.description ?? "Payment"}</dd>
              </div>
            </dl>
            {transaction.razorpayId ? (
              <Button variant="outline" asChild>
                <a href={`https://dashboard.razorpay.com/app/payments/${transaction.razorpayId}`} target="_blank" rel="noreferrer">
                  <ExternalLink className="size-4" />
                  Open Razorpay Payment
                </a>
              </Button>
            ) : null}
            <div className="space-y-3 border-l pl-4">
              <div>
                <p className="text-sm font-medium">Payment created</p>
                <p className="text-xs text-muted-foreground">{formatDateTime(transaction.createdAt)}</p>
              </div>
              <div>
                <p className="text-sm font-medium">Status recorded</p>
                <p className="text-xs text-muted-foreground">{transaction.status}</p>
              </div>
            </div>
          </div>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
