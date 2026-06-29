"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Database, RefreshCw, WifiOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

type DatabaseUnavailableProps = {
  onRetry?: () => void;
  title?: string;
  description?: string;
};

export function DatabaseUnavailable({
  onRetry,
  title = "Connection unavailable",
  description = `We can't reach the database right now. If you're on Neon, the project may be waking up — wait a few seconds and try again.`,
}: DatabaseUnavailableProps) {
  const router = useRouter();
  const [isRetrying, startTransition] = useTransition();

  function handleRetry() {
    startTransition(() => {
      if (onRetry) {
        onRetry();
        return;
      }
      router.refresh();
    });
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-6">
      <Card className="w-full max-w-md border-dashed shadow-sm">
        <CardContent className="flex flex-col items-center gap-5 px-6 py-12 text-center">
          <div className="relative">
            <div className="flex size-16 items-center justify-center rounded-2xl bg-muted">
              <Database className="size-8 text-muted-foreground" />
            </div>
            <div className="absolute -bottom-1 -right-1 flex size-7 items-center justify-center rounded-full border bg-card">
              <WifiOff className="size-3.5 text-destructive" />
            </div>
          </div>
          <div className="space-y-2">
            <h1 className="text-lg font-semibold tracking-normal">{title}</h1>
            <p className="text-sm leading-relaxed text-muted-foreground">{description}</p>
          </div>
          <Button
            type="button"
            onClick={handleRetry}
            disabled={isRetrying}
            className="min-w-36 interact-premium"
          >
            <RefreshCw className={`size-4 ${isRetrying ? "animate-spin" : ""}`} />
            {isRetrying ? "Retrying…" : "Try again"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
