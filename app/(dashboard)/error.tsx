"use client";

import { useEffect } from "react";
import { DatabaseUnavailable } from "@/components/shared/DatabaseUnavailable";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { isDatabaseConnectionError } from "@/lib/db-errors";

type DashboardErrorProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function DashboardError({ error, reset }: DashboardErrorProps) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  if (isDatabaseConnectionError(error)) {
    return <DatabaseUnavailable onRetry={reset} />;
  }

  return (
    <div className="flex min-h-[50vh] items-center justify-center p-6">
      <Card className="w-full max-w-md">
        <CardContent className="space-y-4 px-6 py-10 text-center">
          <h1 className="text-lg font-semibold">Something went wrong</h1>
          <p className="text-sm text-muted-foreground">
            An unexpected error occurred while loading this page.
          </p>
          <Button type="button" onClick={reset} className="interact-premium">
            Try again
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
