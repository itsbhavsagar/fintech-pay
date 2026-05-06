"use client";

import { Copy, ExternalLink, Loader2, Link2, Calendar, ShieldCheck, Globe } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/status-badge";
import { Switch } from "@/components/ui/switch";
import { formatCurrency, formatDate } from "@/lib/utils";
import type { PaymentLinkDto } from "@/types/domain";
import Link from "next/link";

type LinkCardProps = {
  paymentLink: PaymentLinkDto;
  onStatusChange?: (id: string, status: string) => void;
};

export function LinkCard({ paymentLink, onStatusChange }: LinkCardProps) {
  const [isUpdating, setIsUpdating] = useState(false);
  const queryClient = useQueryClient();
  const isActive = paymentLink.status === "active";

  async function copyLink() {
    if (paymentLink.shortUrl) {
      await navigator.clipboard.writeText(paymentLink.shortUrl);
      toast.success("Link copied to clipboard");
    }
  }

  async function handleToggle() {
    setIsUpdating(true);
    try {
      const newStatus = isActive ? "expired" : "active";
      const response = await fetch(`/api/payment-links/${paymentLink.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      if (response.ok) {
        toast.success(`Payment link ${newStatus === "active" ? "enabled" : "disabled"}`);
        await queryClient.invalidateQueries({ queryKey: ["payment-links"] });
        onStatusChange?.(paymentLink.id, newStatus);
      }
    } finally {
      setIsUpdating(false);
    }
  }

  return (
    <Card className={`group relative overflow-hidden transition-all duration-300 hover:shadow-lg hover:border-primary/30 ${
      !isActive ? "bg-secondary/20 grayscale-[0.4]" : "bg-card"
    }`}>
      <CardContent className="p-0">
        {/* Top Section */}
        <div className="flex items-center justify-between p-5 border-b border-border/40 bg-secondary/10 group-hover:bg-secondary/20 transition-colors">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg transition-colors ${isActive ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"}`}>
              <Link2 className="size-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold tracking-tight">{paymentLink.title}</h3>
              <div className="flex items-center gap-2 mt-0.5">
                <Calendar className="size-3 text-muted-foreground" />
                <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest">
                  {formatDate(paymentLink.createdAt)}
                </span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              {isUpdating && <Loader2 className="size-3 animate-spin text-muted-foreground" />}
              <Switch
                checked={isActive}
                onCheckedChange={handleToggle}
                disabled={isUpdating}
                className="scale-90"
              />
            </div>
            <StatusBadge status={paymentLink.status} />
          </div>
        </div>

        {/* Bottom Section */}
        <div className="p-5 flex items-end justify-between gap-4">
          <div className="space-y-1">
            <p className="text-2xl font-black tracking-tighter">
              {formatCurrency(paymentLink.amount, paymentLink.currency)}
            </p>
            <div className="flex items-center gap-1.5 py-1 px-2 rounded-md bg-secondary/50 w-fit">
              <Globe className="size-3 text-muted-foreground" />
              <p className="text-[10px] font-medium text-muted-foreground truncate max-w-[200px]">
                {paymentLink.shortUrl ?? "Link pending generation..."}
              </p>
            </div>
          </div>

          <div className="flex gap-2 shrink-0">
            <Button
              variant="secondary"
              size="icon"
              onClick={copyLink}
              disabled={!paymentLink.shortUrl}
              className="size-9 rounded-xl hover:bg-primary hover:text-primary-foreground transition-all shadow-sm"
              title="Copy Link"
            >
              <Copy className="size-4" />
            </Button>
            {paymentLink.shortUrl && (
              <Button
                variant="secondary"
                size="icon"
                asChild
                className="size-9 rounded-xl hover:bg-primary hover:text-primary-foreground transition-all shadow-sm"
                title="Open Link"
              >
                <Link href={paymentLink.shortUrl} target="_blank" rel="noreferrer">
                  <ExternalLink className="size-4" />
                </Link>
              </Button>
            )}
          </div>
        </div>

        {/* Subtle Security Indicator */}
        <div className="px-5 py-2 bg-secondary/5 flex items-center gap-2 opacity-60">
          <ShieldCheck className="size-3" />
          <span className="text-[9px] font-bold uppercase tracking-widest">Idempotent • Secured by Neon</span>
        </div>
      </CardContent>
    </Card>
  );
}
