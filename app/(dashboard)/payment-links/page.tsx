"use client";

import { CreateLinkModal } from "@/components/payment-links/CreateLinkModal";
import { LinkCard } from "@/components/payment-links/LinkCard";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { FloatingAIAssistant } from "@/components/shared/FloatingAIAssistant";
import { usePaymentLinks } from "@/hooks/usePaymentLinks";
import { Search, Filter, Plus } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useState } from "react";

function SkeletonLinkCard() {
  return (
    <Card className="overflow-hidden border-border/50">
      <CardContent className="p-0">
        <div className="flex items-center justify-between p-5 border-b border-border/40">
          <div className="space-y-2">
            <Skeleton className="h-5 w-40" />
            <Skeleton className="h-3 w-24" />
          </div>
          <Skeleton className="h-6 w-20 rounded-full" />
        </div>
        <div className="p-5 flex items-end justify-between gap-4">
          <div className="space-y-2">
            <Skeleton className="h-8 w-32" />
            <Skeleton className="h-4 w-56" />
          </div>
          <div className="flex gap-2">
            <Skeleton className="size-9 rounded-lg" />
            <Skeleton className="size-9 rounded-lg" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function PaymentLinksPage() {
  const paymentLinks = usePaymentLinks();
  const [searchQuery, setSearchQuery] = useState("");

  const links = paymentLinks.data?.paymentLinks ?? [];
  const filteredLinks = links.filter(link => 
    link.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6 pb-20">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <h2 className="text-2xl font-bold tracking-tight">Payment Links</h2>
          <p className="text-sm text-muted-foreground">Deploy and monitor test links anchored in your Razorpay & Neon stack.</p>
        </div>
        <div className="flex items-center gap-2">
          <CreateLinkModal />
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 items-center">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input 
            placeholder="Search by link title..." 
            className="pl-9 bg-card/50 border-border/50 h-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Button variant="outline" size="sm" className="h-10 px-4 border-border/50 bg-card/50 gap-2 flex-1 sm:flex-initial">
            <Filter className="size-3.5" />
            Status
          </Button>
          <div className="text-xs text-muted-foreground px-2 whitespace-nowrap">
            {filteredLinks.length} Links
          </div>
        </div>
      </div>

      {paymentLinks.isLoading ? (
        <div className="grid gap-4 lg:grid-cols-2">
          {Array.from({ length: 4 }, (_, index) => (
            <SkeletonLinkCard key={index} />
          ))}
        </div>
      ) : (
        <>
          <div className="grid gap-4 lg:grid-cols-2">
            {filteredLinks.map((paymentLink) => (
              <LinkCard key={paymentLink.id} paymentLink={paymentLink} />
            ))}
          </div>

          {filteredLinks.length === 0 && (
            <Card className="border-dashed border-2 bg-secondary/10">
              <CardContent className="flex flex-col items-center justify-center py-16 text-center space-y-4">
                <div className="size-12 rounded-full bg-secondary flex items-center justify-center">
                  <Plus className="size-6 text-muted-foreground" />
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-semibold">No payment links found</p>
                  <p className="text-xs text-muted-foreground max-w-[240px]">
                    Create your first payment link to start collecting test transactions.
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </>
      )}

      <FloatingAIAssistant />
    </div>
  );
}

import { Button } from "@/components/ui/button";
