"use client";

import dynamic from "next/dynamic";

const FloatingAIAssistant = dynamic(
  () =>
    import("@/components/shared/FloatingAIAssistant").then(
      (mod) => mod.FloatingAIAssistant,
    ),
  { ssr: false },
);

export function DashboardFloatingAssistant() {
  return <FloatingAIAssistant />;
}
