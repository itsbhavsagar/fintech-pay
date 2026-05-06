"use client";

import { Copy, ExternalLink, Loader2, Link2, Calendar, ShieldCheck, Globe, AlertTriangle } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { StatusBadge } from "@/components/ui/status-badge";
import { Switch } from "@/components/ui/switch";
import { formatCurrency, formatDate } from "@/lib/utils";
import type { PaymentLinkDto } from "@/types/domain";
import Link from "next/link";

import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { TableRow, TableCell } from "@/components/ui/table";

type LinkCardProps = {
  paymentLink: PaymentLinkDto;
  onStatusChange?: (id: string, status: string) => void;
  viewMode?: "grid" | "list";
};

export function LinkCard({ paymentLink, onStatusChange, viewMode = "grid" }: LinkCardProps) {
  const [isUpdating, setIsUpdating] = useState(false);
  const [showExpiryDialog, setShowExpiryDialog] = useState(false);
  const [newExpiryDate, setNewExpiryDate] = useState("");
  const queryClient = useQueryClient();
  
  const isExpiredByDate = Boolean(paymentLink.expiresAt && new Date(paymentLink.expiresAt).getTime() < Date.now());
  const isActive = paymentLink.status === "active" && !isExpiredByDate;

  async function copyLink() {
    if (paymentLink.shortUrl) {
      await navigator.clipboard.writeText(paymentLink.shortUrl);
      toast.success("Link copied to clipboard");
    }
  }

  async function handleToggle() {
    if (!isActive && isExpiredByDate) {
      setShowExpiryDialog(true);
      return;
    }
    await performToggle(isActive ? "expired" : "active");
  }

  async function performToggle(newStatus: string, expiresAt?: string) {
    setIsUpdating(true);
    try {
      const body: any = { status: newStatus };
      if (expiresAt) {
        body.expiresAt = new Date(`${expiresAt}T23:59:59.999Z`).toISOString();
      }

      const response = await fetch(`/api/payment-links/${paymentLink.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (response.ok) {
        toast.success(`Payment link ${newStatus === "active" ? "enabled" : "disabled"}`);
        
        queryClient.setQueriesData<any>({ queryKey: ["payment-links"] }, (oldData: any) => {
          if (!oldData || !oldData.pages) return oldData;
          return {
            ...oldData,
            pages: oldData.pages.map((page: any) => ({
              ...page,
              paymentLinks: page.paymentLinks.map((link: any) =>
                link.id === paymentLink.id ? { ...link, status: newStatus, ...(expiresAt && { expiresAt: body.expiresAt }) } : link
              ),
            })),
          };
        });
        
        queryClient.setQueriesData<any>({ queryKey: ["analytics"] }, (oldData: any) => {
          if (!oldData || !oldData.stats) return oldData;
          return {
            ...oldData,
            stats: {
              ...oldData.stats,
              activePaymentLinks: Math.max(0, oldData.stats.activePaymentLinks + (newStatus === "active" ? 1 : -1))
            }
          };
        });

        onStatusChange?.(paymentLink.id, newStatus);
        setShowExpiryDialog(false);
        setNewExpiryDate("");
      } else {
        toast.error("Failed to update payment link");
      }
    } finally {
      setIsUpdating(false);
    }
  }

  const gridContent = (
    <Card className={`group relative overflow-hidden transition-all duration-300 hover:shadow-lg hover:border-primary/30 ${
      !isActive ? "bg-secondary/20 grayscale-[0.4]" : "bg-card"
    }`}>
      <CardContent className="p-0">

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
            <TooltipProvider delayDuration={100}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="secondary"
                    size="icon"
                    onClick={copyLink}
                    disabled={!paymentLink.shortUrl}
                    className="size-9 rounded-xl hover:bg-primary hover:text-primary-foreground transition-all shadow-sm"
                  >
                    <Copy className="size-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Copy Link</TooltipContent>
              </Tooltip>
            </TooltipProvider>

            {paymentLink.shortUrl && (
              <TooltipProvider delayDuration={100}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="secondary"
                      size="icon"
                      asChild
                      className="size-9 rounded-xl hover:bg-primary hover:text-primary-foreground transition-all shadow-sm"
                    >
                      <Link href={paymentLink.shortUrl} target="_blank" rel="noreferrer">
                        <ExternalLink className="size-4" />
                      </Link>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Open Link</TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
          </div>
        </div>
    
        <div className="px-5 py-2 bg-secondary/5 flex items-center gap-2 opacity-60">
          <ShieldCheck className="size-3" />
          <span className="text-[9px] font-bold uppercase tracking-widest">Idempotent • Secured by Neon</span>
        </div>
      </CardContent>
    </Card>
  );

  const listContent = (
    <TableRow>
      <TableCell className="font-medium">
        <div className="flex flex-col">
          <span className="truncate max-w-[200px]">{paymentLink.title}</span>
          <span className="text-[10px] text-muted-foreground truncate max-w-[200px]">{paymentLink.shortUrl}</span>
        </div>
      </TableCell>
      <TableCell className="font-bold whitespace-nowrap">{formatCurrency(paymentLink.amount, paymentLink.currency)}</TableCell>
      <TableCell><StatusBadge status={paymentLink.status} /></TableCell>
      <TableCell className="text-xs text-muted-foreground whitespace-nowrap">{formatDate(paymentLink.createdAt)}</TableCell>
      <TableCell>
        <div className="flex items-center justify-center gap-2">
          {isUpdating && <Loader2 className="size-3 animate-spin text-muted-foreground" />}
          <Switch
            checked={isActive}
            onCheckedChange={handleToggle}
            disabled={isUpdating}
            className="scale-90"
          />
        </div>
      </TableCell>
      <TableCell className="text-right">
        <div className="flex items-center justify-end gap-2">
          <TooltipProvider delayDuration={100}>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-8"
                  disabled={!paymentLink.shortUrl}
                  onClick={copyLink}
                >
                  <Copy className="size-3.5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Copy Link</TooltipContent>
            </Tooltip>
          </TooltipProvider>
          {paymentLink.shortUrl && (
            <TooltipProvider delayDuration={100}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" className="size-8" asChild>
                    <Link href={paymentLink.shortUrl} target="_blank" rel="noreferrer">
                      <ExternalLink className="size-3.5" />
                    </Link>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Open Link</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </div>
      </TableCell>
    </TableRow>
  );

  return (
    <>
    {viewMode === "grid" ? gridContent : listContent}


    <Dialog open={showExpiryDialog} onOpenChange={setShowExpiryDialog}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="size-5 text-warning" />
            Link Expired
          </DialogTitle>
          <DialogDescription>
            This payment link has passed its expiry date. To re-enable it, please set a new expiry date in the future.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label htmlFor={`new-expiry-${paymentLink.id}`}>New Expiry Date</Label>
            <Input
              id={`new-expiry-${paymentLink.id}`}
              type="date"
              min={new Date().toISOString().split("T")[0]}
              value={newExpiryDate}
              onChange={(e) => setNewExpiryDate(e.target.value)}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setShowExpiryDialog(false)} disabled={isUpdating}>
            Cancel
          </Button>
          <Button
            onClick={() => performToggle("active", newExpiryDate)}
            disabled={!newExpiryDate || isUpdating}
          >
            {isUpdating && <Loader2 className="mr-2 size-4 animate-spin" />}
            Enable Link
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
    </>
  );
}
