"use client";

import { Loader2 } from "lucide-react";
import { useMemo, useState } from "react";
import { TransactionDetail } from "@/components/transactions/TransactionDetail";
import { TransactionFilters } from "@/components/transactions/TransactionFilters";
import { TransactionRow } from "@/components/transactions/TransactionRow";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  useTransactions,
  type TransactionFilters as TransactionFiltersValue,
} from "@/hooks/useTransactions";
import type { TransactionDto } from "@/types/domain";

const defaultFilters: TransactionFiltersValue = {
  search: "",
  status: "all",
  currency: "all",
  from: "",
  to: "",
};

function csvEscape(value: string): string {
  return `"${value.replaceAll('"', '""')}"`;
}

export default function TransactionsPage() {
  const [filters, setFilters] =
    useState<TransactionFiltersValue>(defaultFilters);
  const [selectedTransaction, setSelectedTransaction] =
    useState<TransactionDto | null>(null);
  const transactionsQuery = useTransactions(filters);
  const isInitialLoading =
    transactionsQuery.isLoading && !transactionsQuery.data;
  const isRefreshing =
    transactionsQuery.isFetching &&
    !transactionsQuery.isFetchingNextPage &&
    Boolean(transactionsQuery.data);
  const transactions = useMemo(
    () =>
      transactionsQuery.data?.pages.flatMap((page) => page.transactions) ?? [],
    [transactionsQuery.data],
  );
  const currencies = useMemo(() => {
    const uniqueCurrencies = new Set(
      transactions.map((transaction) => transaction.currency),
    );
    return Array.from(uniqueCurrencies).sort();
  }, [transactions]);

  function exportCsv() {
    const rows = [
      [
        "id",
        "amount",
        "currency",
        "status",
        "country",
        "paymentMethod",
        "razorpayId",
        "description",
        "createdAt",
      ],
      ...transactions.map((transaction) => [
        transaction.id,
        String(transaction.amount),
        transaction.currency,
        transaction.status,
        transaction.country,
        transaction.paymentMethod,
        transaction.razorpayId ?? "",
        transaction.description ?? "",
        transaction.createdAt,
      ]),
    ];
    const csv = rows.map((row) => row.map(csvEscape).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "paysense-transactions.csv";
    link.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="space-y-5">
      <TransactionFilters
        value={filters}
        currencies={currencies}
        onChange={setFilters}
        onExport={exportCsv}
      />
      <Card className="relative">
        {isRefreshing ? (
          <Loader2
            aria-label="Refreshing transactions"
            className="absolute right-4 top-4 size-4 animate-spin text-muted-foreground"
          />
        ) : null}
        <CardContent className="p-0">
          <Table
            className={
              isRefreshing
                ? "opacity-70 transition-opacity"
                : "transition-opacity"
            }
          >
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Method</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Country</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {transactions.map((transaction) => (
                <TransactionRow
                  key={transaction.id}
                  transaction={transaction}
                  onSelect={setSelectedTransaction}
                />
              ))}
            </TableBody>
          </Table>
          {transactions.length === 0 && !isInitialLoading ? (
            <div className="p-8 text-center text-sm text-muted-foreground">
              No transactions match these filters.
            </div>
          ) : null}
        </CardContent>
      </Card>
      <div className="flex justify-center">
        <Button
          variant="outline"
          onClick={() => void transactionsQuery.fetchNextPage()}
          disabled={
            !transactionsQuery.hasNextPage ||
            transactionsQuery.isFetchingNextPage
          }
        >
          {transactionsQuery.isFetchingNextPage ? (
            <Loader2 className="size-4 animate-spin" />
          ) : null}
          {transactionsQuery.hasNextPage ? "Load More" : "No More Results"}
        </Button>
      </div>
      <TransactionDetail
        transaction={selectedTransaction}
        open={Boolean(selectedTransaction)}
        onOpenChange={(open) => {
          if (!open) {
            setSelectedTransaction(null);
          }
        }}
      />
    </div>
  );
}
