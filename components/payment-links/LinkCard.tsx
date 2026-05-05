"use client";

import { Copy, ExternalLink, Loader2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/status-badge";
import { formatCurrency, formatDate } from "@/lib/utils";
import type { PaymentLinkDto } from "@/types/domain";
import Link from "next/link";
import { Dialog, DialogTrigger, DialogContent } from "@/components/ui/dialog";

type LinkCardProps = {
  paymentLink: PaymentLinkDto;
  onStatusChange?: (id: string, status: string) => void;
};

export function LinkCard({ paymentLink, onStatusChange }: LinkCardProps) {
  const [isUpdating, setIsUpdating] = useState(false);
  const [showDialog, setShowDialog] = useState(false);

  async function copyLink() {
    if (paymentLink.shortUrl) {
      await navigator.clipboard.writeText(paymentLink.shortUrl);
      toast.success("Link copied to clipboard");
    }
  }

  async function handleToggle() {
    setIsUpdating(true);
    try {
      const newStatus = paymentLink.status === "active" ? "expired" : "active";
      const response = await fetch(`/api/payment-links/${paymentLink.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      if (response.ok) {
        setShowDialog(false);
        onStatusChange?.(paymentLink.id, newStatus);
      }
    } finally {
      setIsUpdating(false);
    }
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-start justify-between gap-3 space-y-0">
        <div>
          <CardTitle className="text-base">{paymentLink.title}</CardTitle>
          <p className="mt-1 text-sm text-muted-foreground">
            {formatDate(paymentLink.createdAt)}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <StatusBadge status={paymentLink.status} />
          <Dialog open={showDialog} onOpenChange={setShowDialog}>
            <DialogTrigger asChild>
              <Button variant="ghost" size="sm" className="h-6 text-xs">
                {paymentLink.status === "active" ? "Disable" : "Enable"}
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-sm">
              <div className="space-y-4">
                <div>
                  <h2 className="text-lg font-semibold">
                    {paymentLink.status === "active" ? "Disable" : "Enable"}{" "}
                    Payment Link?
                  </h2>
                  <p className="mt-2 text-sm text-muted-foreground">
                    {paymentLink.status === "active"
                      ? `This will disable the payment link "${paymentLink.title}". Customers won't be able to access it anymore.`
                      : `This will enable the payment link "${paymentLink.title}". Customers can access it again.`}
                  </p>
                </div>
                <div className="flex gap-3 justify-end">
                  <Button
                    variant="outline"
                    onClick={() => setShowDialog(false)}
                    disabled={isUpdating}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleToggle}
                    disabled={isUpdating}
                    variant={
                      paymentLink.status === "active"
                        ? "destructive"
                        : "default"
                    }
                  >
                    {isUpdating ? (
                      <>
                        <Loader2 className="mr-2 size-4 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      "Continue"
                    )}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-end justify-between gap-3">
          <div>
            <p className="text-2xl font-semibold tracking-normal">
              {formatCurrency(paymentLink.amount, paymentLink.currency)}
            </p>
            <p className="mt-1 truncate text-sm text-muted-foreground">
              {paymentLink.shortUrl ?? "Razorpay link pending"}
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={copyLink}
              disabled={!paymentLink.shortUrl}
              aria-label="Copy payment link"
            >
              <Copy className="size-4" />
            </Button>
            {paymentLink.shortUrl ? (
              <Button
                variant="outline"
                size="icon"
                asChild
                aria-label="Open payment link"
              >
                <Link
                  href={paymentLink.shortUrl}
                  target="_blank"
                  rel="noreferrer"
                >
                  <ExternalLink className="size-4" />
                </Link>
              </Button>
            ) : null}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
