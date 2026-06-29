"use client";

import { useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { prefetchAllDashboardRoutes } from "@/lib/prefetch-dashboard";

export function DashboardPrefetcher() {
  const queryClient = useQueryClient();

  useEffect(() => {
    prefetchAllDashboardRoutes(queryClient);
  }, [queryClient]);

  return null;
}
