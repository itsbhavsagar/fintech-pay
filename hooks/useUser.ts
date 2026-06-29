"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchJson } from "@/lib/fetcher";
import { QUERY_STALE_TIME } from "@/lib/query-config";
import type { UserDto } from "@/types/domain";

type MeResponse = {
  user: UserDto;
};

export function useUser(initialData?: UserDto) {
  return useQuery({
    queryKey: ["me"],
    queryFn: () =>
      fetchJson<MeResponse>("/api/auth/me").then((res) => res.user),
    initialData,
    staleTime: QUERY_STALE_TIME,
    refetchOnMount: initialData ? false : true,
  });
}
