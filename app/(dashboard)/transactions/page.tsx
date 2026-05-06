// "use client";

// import { Loader2 } from "lucide-react";
// import { useMemo, useState } from "react";
// import { useQuery } from "@tanstack/react-query";
// import { TransactionDetail } from "@/components/transactions/TransactionDetail";
// import { TransactionFilters } from "@/components/transactions/TransactionFilters";
// import { TransactionRow } from "@/components/transactions/TransactionRow";
// import { Button } from "@/components/ui/button";
// import { Card, CardContent } from "@/components/ui/card";
// import {
//   Table,
//   TableBody,
//   TableHead,
//   TableHeader,
//   TableRow,
// } from "@/components/ui/table";
// import {
//   useTransactions,
//   type TransactionFilters as TransactionFiltersValue,
// } from "@/hooks/useTransactions";
// import { fetchJson } from "@/lib/fetcher";
// import type { TransactionDto } from "@/types/domain";
// import { TransactionSkeleton } from "@/components/transactions/TransactionSkeleton";

// const defaultFilters: TransactionFiltersValue = {
//   search: "",
//   status: "all",
//   currency: "all",
//   from: "",
//   to: "",
// };

// function csvEscape(value: string): string {
//   return `"${value.replaceAll('"', '""')}"`;
// }

// export default function TransactionsPage() {
//   const [filters, setFilters] =
//     useState<TransactionFiltersValue>(defaultFilters);
//   const [selectedTransaction, setSelectedTransaction] =
//     useState<TransactionDto | null>(null);
//   const transactionsQuery = useTransactions(filters);
//   const { data: meta } = useQuery({
//     queryKey: ["transactions-meta"],
//     queryFn: () => fetchJson<{ currencies: string[]; statuses: string[] }>("/api/transactions/filters"),
//   });

//   const isInitialLoading =
//     transactionsQuery.isLoading && !transactionsQuery.data;
//   const isRefreshing =
//     transactionsQuery.isFetching &&
//     !transactionsQuery.isFetchingNextPage &&
//     Boolean(transactionsQuery.data);
//   const transactions = useMemo(
//     () =>
//       transactionsQuery.data?.pages.flatMap((page) => page.transactions) ?? [],
//     [transactionsQuery.data],
//   );
  
//   const currencies = meta?.currencies ?? [];

//   function exportCsv() {
//     const rows = [
//       [
//         "id",
//         "amount",
//         "currency",
//         "status",
//         "country",
//         "paymentMethod",
//         "razorpayId",
//         "description",
//         "createdAt",
//       ],
//       ...transactions.map((transaction) => [
//         transaction.id,
//         String(transaction.amount),
//         transaction.currency,
//         transaction.status,
//         transaction.country,
//         transaction.paymentMethod,
//         transaction.razorpayId ?? "",
//         transaction.description ?? "",
//         transaction.createdAt,
//       ]),
//     ];
//     const csv = rows.map((row) => row.map(csvEscape).join(",")).join("\n");
//     const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
//     const url = URL.createObjectURL(blob);
//     const link = document.createElement("a");
//     link.href = url;
//     link.download = "paysense-transactions.csv";
//     link.click();
//     URL.revokeObjectURL(url);
//   }

//   return (
//     <div className="space-y-5">
//       <TransactionFilters
//         value={filters}
//         currencies={currencies}
//         onChange={setFilters}
//         onExport={exportCsv}
//       />




//       <Card className="relative overflow-hidden">
//         <CardContent className="p-0">
//           <Table>
//             <TableHeader>
//               <TableRow>
//                 <TableHead>ID</TableHead>
//                 <TableHead>Description</TableHead>
//                 <TableHead>Status</TableHead>
//                 <TableHead>Method</TableHead>
//                 <TableHead>Amount</TableHead>
//                 <TableHead>Country</TableHead>
//                 <TableHead>Date</TableHead>
//                 <TableHead>Action</TableHead>
//               </TableRow>
//             </TableHeader>
//             <TableBody>
//               {isInitialLoading || isRefreshing ? (
//                 Array.from({ length: 8 }).map((_, i) => (
//                   <TransactionSkeleton key={i} />
//                 ))
//               ) : (
//                 transactions.map((transaction) => (
//                   <TransactionRow
//                     key={transaction.id}
//                     transaction={transaction}
//                     onSelect={setSelectedTransaction}
//                   />
//                 ))
//               )}
//             </TableBody>
//           </Table>
//           {transactions.length === 0 && !isInitialLoading && !isRefreshing ? (
//             <div className="p-8 text-center text-sm text-muted-foreground">
//               No transactions match these filters.
//             </div>
//           ) : null}
//         </CardContent>
//       </Card>
//       <div className="flex justify-center py-4">
//         {transactionsQuery.hasNextPage ? (
//           <Button
//             variant="outline"
//             onClick={() => void transactionsQuery.fetchNextPage()}
//             disabled={transactionsQuery.isFetchingNextPage}
//             className="min-w-[140px]"
//           >
//             {transactionsQuery.isFetchingNextPage ? (
//               <>
//                 <Loader2 className="mr-2 size-4 animate-spin" />
//                 Loading...
//               </>
//             ) : (
//               "Load More"
//             )}
//           </Button>
//         ) : !isInitialLoading && !isRefreshing && transactions.length > 0 ? (
//           <p className="text-sm text-muted-foreground">No more transactions to show</p>
//         ) : null}
//       </div>
//       <TransactionDetail
//         transaction={selectedTransaction}
//         open={Boolean(selectedTransaction)}
//         onOpenChange={(open) => {
//           if (!open) {
//             setSelectedTransaction(null);
//           }
//         }}
//       />
//     </div>
//   );
// }


"use client";

import { Loader2 } from "lucide-react";
import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
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
import { fetchJson } from "@/lib/fetcher";
import type { TransactionDto } from "@/types/domain";
import { TransactionSkeleton } from "@/components/transactions/TransactionSkeleton";

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
  const [filters, setFilters] = useState<TransactionFiltersValue>(defaultFilters);
  const [selectedTransaction, setSelectedTransaction] = useState<TransactionDto | null>(null);

  const transactionsQuery = useTransactions(filters);

  const { data: meta } = useQuery({
    queryKey: ["transactions-meta"],
    queryFn: () => fetchJson<{ currencies: string[]; statuses: string[] }>("/api/transactions/filters"),
    staleTime: 300000,
  });

  const isInitialLoading = transactionsQuery.isLoading && !transactionsQuery.data;
  const isRefreshing = transactionsQuery.isFetching && Boolean(transactionsQuery.data);

  const transactions = useMemo(
    () => transactionsQuery.data?.pages.flatMap((page) => page.transactions) ?? [],
    [transactionsQuery.data]
  );

  const currencies = meta?.currencies ?? [];

  function exportCsv() {
    const rows = [
      ["id", "amount", "currency", "status", "country", "paymentMethod", "razorpayId", "description", "createdAt"],
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

      <Card className="relative overflow-hidden">
        <CardContent className="p-0">
          <Table>
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
              {isInitialLoading ? (
                Array.from({ length: 8 }).map((_, i) => (
                  <TransactionSkeleton key={i} />
                ))
              ) : (
                transactions.map((transaction) => (
                  <TransactionRow
                    key={transaction.id}
                    transaction={transaction}
                    onSelect={setSelectedTransaction}
                  />
                ))
              )}
            </TableBody>
          </Table>

          {transactions.length === 0 && !isInitialLoading ? (
            <div className="p-8 text-center text-sm text-muted-foreground">
              No transactions match these filters.
            </div>
          ) : null}
        </CardContent>
      </Card>

      <div className="flex justify-center py-4">
        {transactionsQuery.hasNextPage ? (
          <Button
            variant="outline"
            onClick={() => void transactionsQuery.fetchNextPage()}
            disabled={transactionsQuery.isFetchingNextPage}
            className="min-w-[140px]"
          >
            {transactionsQuery.isFetchingNextPage ? (
              <>
                <Loader2 className="mr-2 size-4 animate-spin" />
                Loading...
              </>
            ) : (
              "Load More"
            )}
          </Button>
        ) : transactions.length > 0 ? (
          <p className="text-sm text-muted-foreground">No more transactions to show</p>
        ) : null}
      </div>

      <TransactionDetail
        transaction={selectedTransaction}
        open={Boolean(selectedTransaction)}
        onOpenChange={(open) => {
          if (!open) setSelectedTransaction(null);
        }}
      />
    </div>
  );
}