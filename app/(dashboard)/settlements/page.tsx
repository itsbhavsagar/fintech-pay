"use client";

import { Landmark, CalendarDays } from "lucide-react";
import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/status-badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatCompactNumber, formatCurrency, formatDateTime } from "@/lib/utils";
import { useSettlements } from "@/hooks/useSettlements";
import { LoadMoreButton } from "@/components/shared/LoadMoreButton";
import { Skeleton } from "@/components/ui/skeleton";

export default function SettlementsPage() {
  const settlementsQuery = useSettlements();

  const isInitialLoading = settlementsQuery.isLoading && !settlementsQuery.data;
  const isRefreshing = settlementsQuery.isFetching && !settlementsQuery.isFetchingNextPage && Boolean(settlementsQuery.data);

  const settlements = useMemo(
    () => settlementsQuery.data?.pages.flatMap((page) => page.settlements) ?? [],
    [settlementsQuery.data]
  );

  const summary = settlementsQuery.data?.pages[0]?.summary ?? { pendingPayout: 0, nextSettlementDate: new Date().toISOString() };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold tracking-normal">Settlements</h1>
        <p className="text-sm text-muted-foreground">Track pending, processing, and settled payouts.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card className="bg-gradient-to-br from-primary/5 via-transparent to-transparent border-primary/10 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
            <Landmark className="size-24" />
          </div>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Pending Payout</CardTitle>
            <div className="size-8 rounded-full bg-primary/10 flex items-center justify-center">
              <Landmark className="size-4 text-primary" />
            </div>
          </CardHeader>
          <CardContent>
            {isInitialLoading ? (
              <Skeleton className="h-9 w-32 mb-1" />
            ) : (
              <div className="text-3xl font-bold tracking-tight">
                {formatCompactNumber(summary.pendingPayout)}
              </div>
            )}
            <p className="text-xs text-muted-foreground">Across unsettled records</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-muted/50 to-transparent relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
            <CalendarDays className="size-24" />
          </div>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Next Settlement Date</CardTitle>
            <div className="size-8 rounded-full bg-muted flex items-center justify-center">
              <CalendarDays className="size-4 text-muted-foreground" />
            </div>
          </CardHeader>
          <CardContent>
            {isInitialLoading ? (
              <Skeleton className="h-9 w-48 mb-1" />
            ) : (
              <div className="text-3xl font-bold tracking-tight">
                {formatDateTime(summary.nextSettlementDate)}
              </div>
            )}
            <p className="text-xs text-muted-foreground">Derived from the current payout cycle</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Created</TableHead>
                <TableHead className="text-right">Settled</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isInitialLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-16 rounded-full" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                    <TableCell className="flex justify-end"><Skeleton className="h-4 w-32" /></TableCell>
                  </TableRow>
                ))
              ) : (
                settlements.map((settlement) => (
                  <TableRow key={settlement.id} className="group transition-colors hover:bg-muted/50">
                    <TableCell className="font-bold">{formatCurrency(settlement.amount, settlement.currency)}</TableCell>
                    <TableCell>
                      <StatusBadge status={settlement.status} />
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground whitespace-nowrap">{formatDateTime(settlement.createdAt)}</TableCell>
                    <TableCell className="text-sm text-muted-foreground whitespace-nowrap text-right">
                      {settlement.settledAt ? formatDateTime(settlement.settledAt) : "Pending"}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
          
          {settlements.length === 0 && !isInitialLoading ? (
            <div className="p-8 text-center text-sm text-muted-foreground">
              No settlements found.
            </div>
          ) : null}
        </CardContent>
      </Card>

      <LoadMoreButton
        hasNextPage={settlementsQuery.hasNextPage}
        isFetchingNextPage={settlementsQuery.isFetchingNextPage}
        fetchNextPage={() => void settlementsQuery.fetchNextPage()}
        itemName="settlements"
        isInitialLoading={isInitialLoading}
        isRefreshing={isRefreshing}
        itemCount={settlements.length}
      />
    </div>
  );
}
