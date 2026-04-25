"use client";

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { StatusBadge } from "@/components/ui/status-badge";
import { formatCurrency, formatDateTime } from "@/lib/utils";
import type { TransactionDto } from "@/types/domain";

type TransactionTableProps = {
  transactions: TransactionDto[];
  onSelect?: (transaction: TransactionDto) => void;
};

export function TransactionTable({ transactions, onSelect }: TransactionTableProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>ID</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Amount</TableHead>
          <TableHead>Country</TableHead>
          <TableHead>Date</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {transactions.map((transaction) => (
          <TableRow
            key={transaction.id}
            className="cursor-pointer"
            onClick={() => onSelect?.(transaction)}
            tabIndex={0}
          >
            <TableCell className="font-mono text-xs">{transaction.id.slice(-10)}</TableCell>
            <TableCell>
              <StatusBadge status={transaction.status} />
            </TableCell>
            <TableCell className="font-medium">{formatCurrency(transaction.amount, transaction.currency)}</TableCell>
            <TableCell>{transaction.country}</TableCell>
            <TableCell className="text-muted-foreground">{formatDateTime(transaction.createdAt)}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
