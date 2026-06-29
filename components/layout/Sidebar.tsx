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
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { Logo } from "@/components/Logo";
import { PRODUCT_NAME } from "@/lib/brand";
import { prefetchDashboardRoute } from "@/lib/prefetch-dashboard";
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

const paymentIcons = [
  {
    src: "https://cdn.jsdelivr.net/npm/simple-icons@v11/icons/visa.svg",
    alt: "Visa",
  },
  {
    src: "https://cdn.jsdelivr.net/npm/simple-icons@v11/icons/mastercard.svg",
    alt: "Mastercard",
  },
  {
    src: "https://www.vectorlogo.zone/logos/upi/upi-ar21.svg",
    alt: "UPI",
  },
  {
    src: "https://cdn.jsdelivr.net/npm/simple-icons@v11/icons/americanexpress.svg",
    alt: "Amex",
  },
] as const;

export function Sidebar() {
  const pathname = usePathname();
  const queryClient = useQueryClient();

  return (
    <aside className="hidden h-screen w-64 shrink-0 border-r bg-card lg:sticky lg:top-0 lg:flex lg:flex-col">
      <div className="flex h-16 items-center gap-3 border-b px-5">
        <Logo />
        <div>
          <p className="text-sm font-semibold leading-none">{PRODUCT_NAME}</p>
          <p className="mt-1 text-xs text-muted-foreground">Merchant Dashboard</p>
        </div>
      </div>

      <nav className="flex-1 space-y-1 p-3">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive =
            item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              prefetch
              onMouseEnter={() => prefetchDashboardRoute(queryClient, item.href)}
              onFocus={() => prefetchDashboardRoute(queryClient, item.href)}
              className={cn(
                "flex h-10 items-center gap-3 rounded-md px-3 text-sm font-medium text-muted-foreground transition-all hover:bg-accent hover:text-accent-foreground",
                isActive && "bg-accent text-accent-foreground font-semibold"
              )}
            >
              <Icon className="size-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto border-t bg-muted/10 p-4 space-y-4">
        <div className="rounded-xl border bg-card p-3 shadow-sm overflow-hidden relative">
          <div className="absolute inset-y-0 left-0 w-8 bg-linear-to-r from-card to-transparent z-10" />
          <div className="absolute inset-y-0 right-0 w-8 bg-linear-to-l from-card to-transparent z-10" />

          <p className="text-xs font-semibold text-foreground relative z-20"> Accepted Payments </p>
          <p className="mt-0.5 text-[10px] text-muted-foreground leading-relaxed relative z-20">
            Largest Selection Of Payment Methods.
          </p>

          <div className="mt-3 overflow-hidden">
            <div className="flex w-max animate-marquee gap-2">
              {[1, 2].map((group) => (
                <div key={group} className="flex gap-2 shrink-0">
                  {paymentIcons.map((icon) => (
                    <div
                      key={`${group}-${icon.alt}`}
                      className="flex h-6 w-10 items-center justify-center rounded border border-border/50 bg-white px-1 shadow-sm shrink-0"
                    >
                      <Image
                        src={icon.src}
                        alt={icon.alt}
                        width={40}
                        height={24}
                        unoptimized
                        className="h-full w-full object-contain opacity-80"
                      />
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}