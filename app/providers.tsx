"use client";

import { useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider, useTheme } from "next-themes";
import { Toaster } from "sonner";
import { QUERY_GC_TIME, QUERY_STALE_TIME } from "@/lib/query-config";

type ProvidersProps = {
  children: React.ReactNode;
};

function AppToaster() {
  const { theme = "light" } = useTheme();

  return (
    <Toaster
      position="top-right"
      theme={theme as "light" | "dark" | "system"}
      toastOptions={{
        classNames: {
          toast:
            "bg-card text-card-foreground border-border shadow-lg rounded-lg",
          title: "text-foreground",
          description: "text-muted-foreground",
          actionButton: "bg-primary text-primary-foreground",
          cancelButton: "bg-muted text-muted-foreground",
          success: "!bg-success !text-success-foreground !border-success",
          error:
            "!bg-destructive !text-destructive-foreground !border-destructive",
          warning: "!bg-warning !text-warning-foreground !border-warning",
        },
      }}
    />
  );
}

export function Providers({ children }: ProvidersProps) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: QUERY_STALE_TIME,
            gcTime: QUERY_GC_TIME,
            retry: 1,
            refetchOnMount: false,
            refetchOnWindowFocus: false,
          },
        },
      }),
  );

  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="light"
      enableSystem
      disableTransitionOnChange
    >
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>

      <AppToaster />
    </ThemeProvider>
  );
}
