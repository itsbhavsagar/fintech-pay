"use client";

import { Loader2, Plus } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useCreatePaymentLink } from "@/hooks/usePaymentLinks";

const currencies = ["USD", "EUR", "GBP", "INR", "SGD", "AED"] as const;

export function CreateLinkModal() {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");
  const [currency, setCurrency] = useState<string>("USD");
  const [expiresAt, setExpiresAt] = useState("");
  const createPaymentLink = useCreatePaymentLink();

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const parsedAmount = Number(amount);

    if (!title.trim() || Number.isNaN(parsedAmount) || parsedAmount <= 0) {
      return;
    }

    await createPaymentLink.mutateAsync({
      title: title.trim(),
      amount: parsedAmount,
      currency,
      expiresAt: expiresAt ? new Date(expiresAt).toISOString() : null,
    });

    setTitle("");
    setAmount("");
    setCurrency("USD");
    setExpiresAt("");
    setOpen(false);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="size-4" />
          Create Link
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create Payment Link</DialogTitle>
        </DialogHeader>
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input id="title" value={title} onChange={(event) => setTitle(event.target.value)} required />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="amount">Amount</Label>
              <Input id="amount" type="number" min="1" step="0.01" value={amount} onChange={(event) => setAmount(event.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label>Currency</Label>
              <Select value={currency} onValueChange={setCurrency}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {currencies.map((item) => (
                    <SelectItem key={item} value={item}>
                      {item}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="expiresAt">Expiry date</Label>
            <Input id="expiresAt" type="date" value={expiresAt} onChange={(event) => setExpiresAt(event.target.value)} />
          </div>
          {createPaymentLink.error ? <p className="text-sm text-destructive">{createPaymentLink.error.message}</p> : null}
          <DialogFooter>
            <Button type="submit" disabled={createPaymentLink.isPending}>
              {createPaymentLink.isPending ? <Loader2 className="size-4 animate-spin" /> : <Plus className="size-4" />}
              Create
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
