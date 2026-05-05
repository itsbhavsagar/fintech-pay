"use client";

import {
  BarChart3,
  Bot,
  CreditCard,
  Home,
  Link2,
  Settings,
  Landmark,
  Zap,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { Logo } from "@/components/Logo";
import { fetchJson } from "@/lib/fetcher";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/", label: "Dashboard", icon: Home },
  { href: "/transactions", label: "Transactions", icon: CreditCard },
  { href: "/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/ai-intelligence", label: "Intelligence", icon: Zap },
  { href: "/payment-links", label: "Payment Links", icon: Link2 },
  { href: "/settlements", label: "Settlements", icon: Landmark },
  { href: "/ai-assistant", label: "AI Assistant", icon: Bot },
  { href: "/settings", label: "Settings", icon: Settings },
] as const;

export function Sidebar() {
  const pathname = usePathname();
  const queryClient = useQueryClient();

  const handlePrefetch = (href: string) => {
    // Prefetch data based on the route
    if (href === "/" || href === "/analytics") {
      queryClient.prefetchQuery({
        queryKey: ["analytics", "30d"],
        queryFn: () => fetchJson(`/api/analytics?period=30d`),
      });
    } else if (href === "/transactions") {
      queryClient.prefetchQuery({
        queryKey: [
          "transactions",
          { search: "", status: "all", currency: "all", from: "", to: "" },
        ],
        queryFn: () => fetchJson(`/api/transactions?limit=10`),
      });
    } else if (href === "/payment-links") {
      queryClient.prefetchQuery({
        queryKey: ["payment-links"],
        queryFn: () => fetchJson(`/api/payment-links`),
      });
    } else if (href === "/ai-intelligence") {
      queryClient.prefetchQuery({
        queryKey: ["intelligence"],
        queryFn: () => fetchJson(`/api/intelligence`),
      });
    }
  };

  return (
    <aside className="hidden h-screen w-64 shrink-0 border-r bg-card lg:sticky lg:top-0 lg:flex lg:flex-col">
      <div className="flex h-16 items-center gap-3 border-b px-5">
        <Logo />
        <div>
          <p className="text-sm font-semibold leading-none">PaySense</p>
          <p className="mt-1 text-xs text-muted-foreground">
            Merchant payments
          </p>
        </div>
      </div>
      <nav className="flex-1 space-y-1 p-3">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active =
            item.href === "/"
              ? pathname === "/"
              : pathname.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              onMouseEnter={() => handlePrefetch(item.href)}
              className={cn(
                "flex h-10 items-center gap-3 rounded-md px-3 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground",
                active && "bg-accent text-accent-foreground",
              )}
            >
              <Icon className="size-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
