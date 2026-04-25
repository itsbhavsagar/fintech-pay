"use client";

import { Copy, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/status-badge";
import { formatCurrency, formatDate } from "@/lib/utils";
import type { PaymentLinkDto } from "@/types/domain";

type LinkCardProps = {
  paymentLink: PaymentLinkDto;
};

export function LinkCard({ paymentLink }: LinkCardProps) {
  async function copyLink() {
    if (paymentLink.shortUrl) {
      await navigator.clipboard.writeText(paymentLink.shortUrl);
    }
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-start justify-between gap-3 space-y-0">
        <div>
          <CardTitle className="text-base">{paymentLink.title}</CardTitle>
          <p className="mt-1 text-sm text-muted-foreground">{formatDate(paymentLink.createdAt)}</p>
        </div>
        <StatusBadge status={paymentLink.status} />
      </CardHeader>
      <CardContent>
        <div className="flex items-end justify-between gap-3">
          <div>
            <p className="text-2xl font-semibold tracking-normal">
              {formatCurrency(paymentLink.amount, paymentLink.currency)}
            </p>
            <p className="mt-1 truncate text-sm text-muted-foreground">{paymentLink.shortUrl ?? "Razorpay link pending"}</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="icon" onClick={copyLink} disabled={!paymentLink.shortUrl} aria-label="Copy payment link">
              <Copy className="size-4" />
            </Button>
            {paymentLink.shortUrl ? (
              <Button variant="outline" size="icon" asChild aria-label="Open payment link">
                <a href={paymentLink.shortUrl} target="_blank" rel="noreferrer">
                  <ExternalLink className="size-4" />
                </a>
              </Button>
            ) : null}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
