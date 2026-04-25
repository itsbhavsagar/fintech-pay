"use client";

import { Landmark } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/status-badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { fetchJson } from "@/lib/fetcher";
import { formatCompactNumber, formatCurrency, formatDateTime } from "@/lib/utils";
import type { SettlementDto } from "@/types/domain";

type SettlementsResponse = {
  settlements: SettlementDto[];
  summary: {
    pendingPayout: number;
    nextSettlementDate: string;
  };
};

export default function SettlementsPage() {
  const settlements = useQuery({
    queryKey: ["settlements"],
    queryFn: () => fetchJson<SettlementsResponse>("/api/settlements"),
  });

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-semibold tracking-normal">Settlements</h2>
        <p className="text-sm text-muted-foreground">Track pending, processing, and settled payouts.</p>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <CardTitle>Total Pending Payout</CardTitle>
            <Landmark className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-semibold tracking-normal">
              {formatCompactNumber(settlements.data?.summary.pendingPayout ?? 0)}
            </div>
            <p className="mt-1 text-sm text-muted-foreground">Across unsettled records</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Next Settlement Date</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-semibold tracking-normal">
              {settlements.data ? formatDateTime(settlements.data.summary.nextSettlementDate) : "Loading"}
            </div>
            <p className="mt-1 text-sm text-muted-foreground">Derived from the current payout cycle</p>
          </CardContent>
        </Card>
      </div>
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Amount</TableHead>
                <TableHead>Currency</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Created</TableHead>
                <TableHead>Settled</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {(settlements.data?.settlements ?? []).map((settlement) => (
                <TableRow key={settlement.id}>
                  <TableCell className="font-medium">{formatCurrency(settlement.amount, settlement.currency)}</TableCell>
                  <TableCell>{settlement.currency}</TableCell>
                  <TableCell>
                    <StatusBadge status={settlement.status} />
                  </TableCell>
                  <TableCell className="text-muted-foreground">{formatDateTime(settlement.createdAt)}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {settlement.settledAt ? formatDateTime(settlement.settledAt) : "Pending"}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
