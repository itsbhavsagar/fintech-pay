"use client";

import { CreateLinkModal } from "@/components/payment-links/CreateLinkModal";
import { LinkCard } from "@/components/payment-links/LinkCard";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { FloatingAIAssistant } from "@/components/shared/FloatingAIAssistant";
import { usePaymentLinks } from "@/hooks/usePaymentLinks";
import { LoadMoreButton } from "@/components/shared/LoadMoreButton";
import { Search, Filter, Plus, LayoutGrid, List as ListIcon, MoreHorizontal, ExternalLink, Copy, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useState, useEffect, useMemo } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatCurrency, formatDate } from "@/lib/utils";
import { StatusBadge } from "@/components/ui/status-badge";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import Link from "next/link";

function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);
    return () => clearTimeout(handler);
  }, [value, delay]);
  return debouncedValue;
}

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
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedSearch = useDebounce(searchQuery, 400);
  const [statusFilter, setStatusFilter] = useState("all");
  const [monthFilter, setMonthFilter] = useState("all");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  const paymentLinks = usePaymentLinks({
    search: debouncedSearch,
    status: statusFilter,
    month: monthFilter,
  });

  const isInitialLoading = paymentLinks.isLoading && !paymentLinks.data;
  const isRefreshing = paymentLinks.isFetching && !paymentLinks.isFetchingNextPage && Boolean(paymentLinks.data);

  const links = useMemo(
    () => paymentLinks.data?.pages.flatMap((page) => page.paymentLinks) ?? [],
    [paymentLinks.data]
  );


  return (
    <div className="space-y-6 pb-20">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight">Payment Links</h1>
          <p className="text-sm text-muted-foreground">Deploy and monitor test links anchored in your Razorpay & Neon stack.</p>
        </div>
        <div className="flex items-center gap-2">
          <CreateLinkModal />
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative flex-1 w-full max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input 
            placeholder="Search by link title..." 
            className="pl-9 bg-card/50 border-border/50 h-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[130px] h-10 bg-card/50 border-border/50">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="expired">Expired</SelectItem>
            </SelectContent>
          </Select>

          <Select value={monthFilter} onValueChange={setMonthFilter}>
            <SelectTrigger className="w-[140px] h-10 bg-card/50 border-border/50">
              <SelectValue placeholder="Date" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Time</SelectItem>
              <SelectItem value="30d">Last 30 Days</SelectItem>
              <SelectItem value="90d">Last 90 Days</SelectItem>
              <SelectItem value="this-year">This Year</SelectItem>
              <SelectItem value="last-year">Last Year</SelectItem>
            </SelectContent>
          </Select>

          <div className="flex bg-card/50 border border-border/50 rounded-md p-0.5 ml-2">
            <Button
              variant="ghost"
              size="icon"
              className={`size-8 rounded ${viewMode === "grid" ? "bg-secondary text-primary shadow-sm" : "text-muted-foreground"}`}
              onClick={() => setViewMode("grid")}
            >
              <LayoutGrid className="size-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className={`size-8 rounded ${viewMode === "list" ? "bg-secondary text-primary shadow-sm" : "text-muted-foreground"}`}
              onClick={() => setViewMode("list")}
            >
              <ListIcon className="size-4" />
            </Button>
          </div>
        </div>
      </div>

      {isInitialLoading ? (
        <div className="grid gap-4 lg:grid-cols-2">
          {Array.from({ length: 4 }, (_, index) => (
            <SkeletonLinkCard key={index} />
          ))}
        </div>
      ) : (
        <>
          {links.length > 0 ? (
            viewMode === "grid" ? (
              <div className="grid gap-4 lg:grid-cols-2">
                {links.map((paymentLink) => (
                  <LinkCard key={paymentLink.id} paymentLink={paymentLink} />
                ))}
              </div>
            ) : (
              <Card className="overflow-hidden border-border/50">
                <Table>
                  <TableHeader className="bg-secondary/20">
                    <TableRow className="hover:bg-transparent">
                      <TableHead>Title</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Status</TableHead>
                    
                      <TableHead>Created At</TableHead>
                      <TableHead className="text-center">Enable/Disable</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {links.map((paymentLink) => (
                      <LinkCard key={paymentLink.id} paymentLink={paymentLink} viewMode="list" />
                    ))}
                  </TableBody>
                </Table>
              </Card>
            )
          ) : (
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

      <LoadMoreButton
        hasNextPage={paymentLinks.hasNextPage}
        isFetchingNextPage={paymentLinks.isFetchingNextPage}
        fetchNextPage={() => void paymentLinks.fetchNextPage()}
        itemName="payment links"
        isInitialLoading={isInitialLoading}
        isRefreshing={isRefreshing}
        itemCount={links.length}
      />

      <FloatingAIAssistant />
    </div>
  );
}

