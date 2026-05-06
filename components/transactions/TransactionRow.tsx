"use client";

import { TableCell, TableRow } from "@/components/ui/table";
import { StatusBadge } from "@/components/ui/status-badge";
import { formatCurrency, formatDateTime } from "@/lib/utils";
import type { TransactionDto } from "@/types/domain";
import { Button } from "@/components/ui/button";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRetryTransaction } from "@/hooks/useRetryTransaction";

type TransactionRowProps = {
  transaction: TransactionDto;
  onSelect: (transaction: TransactionDto) => void;
};

export function TransactionRow({ transaction, onSelect }: TransactionRowProps) {
  const queryClient = useQueryClient();
  const retry = useRetryTransaction();


  return (
    <TableRow className="cursor-pointer" onClick={() => onSelect(transaction)}>
      <TableCell className="font-mono text-xs">
        {transaction.id.slice(-12)}
      </TableCell>

      <TableCell>{transaction.description ?? "Payment"}</TableCell>

      <TableCell>
        <StatusBadge status={transaction.status} />
      </TableCell>

      <TableCell>{transaction.paymentMethod}</TableCell>

      <TableCell className="font-medium">
        {formatCurrency(transaction.amount, transaction.currency)}
      </TableCell>

      <TableCell>{transaction.country}</TableCell>

      <TableCell className="text-muted-foreground">
        {formatDateTime(transaction.createdAt)}
      </TableCell>

      <TableCell onClick={(e) => e.stopPropagation()}>
        {transaction.status === "failed" && (
          <Button
            onClick={() => retry.mutate(transaction.id)}
            disabled={retry.isPending}
            className="cursor-pointer"
          >
            Retry
          </Button>
        )}
      </TableCell>
    </TableRow>
  );
}
