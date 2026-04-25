"use client";

import { CreateLinkModal } from "@/components/payment-links/CreateLinkModal";
import { LinkCard } from "@/components/payment-links/LinkCard";
import { Card, CardContent } from "@/components/ui/card";
import { usePaymentLinks } from "@/hooks/usePaymentLinks";

export default function PaymentLinksPage() {
  const paymentLinks = usePaymentLinks();

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-semibold tracking-normal">Payment Links</h2>
          <p className="text-sm text-muted-foreground">Create and manage Razorpay test payment links stored in Neon.</p>
        </div>
        <CreateLinkModal />
      </div>
      {paymentLinks.isLoading ? (
        <div className="grid gap-4 lg:grid-cols-2">
          {Array.from({ length: 4 }, (_, index) => (
            <Card key={index}>
              <CardContent className="p-5">
                <div className="h-24 rounded-md bg-secondary" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : null}
      <div className="grid gap-4 lg:grid-cols-2">
        {(paymentLinks.data?.paymentLinks ?? []).map((paymentLink) => (
          <LinkCard key={paymentLink.id} paymentLink={paymentLink} />
        ))}
      </div>
      {paymentLinks.data?.paymentLinks.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center text-sm text-muted-foreground">No payment links created yet.</CardContent>
        </Card>
      ) : null}
    </div>
  );
}
