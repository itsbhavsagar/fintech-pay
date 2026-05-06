"use client";

import { Download, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { TransactionFilters as TransactionFiltersValue } from "@/hooks/useTransactions";
import type { TransactionStatus } from "@/types/domain";

type TransactionFiltersProps = {
  value: TransactionFiltersValue;
  currencies: string[];
  onChange: (value: TransactionFiltersValue) => void;
  onExport: () => void;
};

const statuses: readonly (TransactionStatus | "all")[] = ["all", "success", "failed", "pending"];

export function TransactionFilters({ value, currencies, onChange, onExport }: TransactionFiltersProps) {
  const today = new Date().toISOString().split("T")[0];

  return (
    <div className="grid gap-3 rounded-lg border bg-card p-4 md:grid-cols-[1.5fr_repeat(4,1fr)_auto]">
      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-3 size-4 text-muted-foreground" />
        <Input
          value={value.search}
          onChange={(event) => onChange({ ...value, search: event.target.value })}
          placeholder="Search ID or description"
          className="pl-9"
        />
      </div>
      <Select
        value={value.status}
        onValueChange={(status) => onChange({ ...value, status: status as TransactionStatus | "all" })}
      >
        <SelectTrigger>
          <SelectValue placeholder="Status" />
        </SelectTrigger>
        <SelectContent>
          {statuses.map((status) => (
            <SelectItem key={status} value={status}>
              {status === "all" ? "All statuses" : status}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Select value={value.currency} onValueChange={(currency) => onChange({ ...value, currency })}>
        <SelectTrigger>
          <SelectValue placeholder="Currency" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All currencies</SelectItem>
          {currencies.map((currency) => (
            <SelectItem key={currency} value={currency}>
              {currency}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <div className="flex items-center gap-2">
        <Input
          type="date"
          value={value.from}
          max={today}
          onChange={(event) => onChange({ ...value, from: event.target.value })}
        />
        <span className="text-xs font-medium text-muted-foreground">TO</span>
        <Input
          type="date"
          value={value.to}
          max={today}
          onChange={(event) => onChange({ ...value, to: event.target.value })}
        />
      </div>
      <Button variant="outline" onClick={onExport}>
        <Download className="size-4" />
        Export
      </Button>
    </div>
  );
}
