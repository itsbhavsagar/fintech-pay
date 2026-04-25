"use client";

import { Menu, WalletCards } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/layout/ThemeToggle";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { UserDto } from "@/types/domain";

type TopbarProps = {
  user: UserDto;
};

const mobileItems = [
  { href: "/", label: "Dashboard" },
  { href: "/transactions", label: "Transactions" },
  { href: "/analytics", label: "Analytics" },
  { href: "/payment-links", label: "Payment Links" },
  { href: "/settlements", label: "Settlements" },
  { href: "/ai-assistant", label: "AI Assistant" },
  { href: "/settings", label: "Settings" },
] as const;

function getPageTitle(pathname: string): string {
  const match = mobileItems.find((item) => (item.href === "/" ? pathname === "/" : pathname.startsWith(item.href)));
  return match?.label ?? "Dashboard";
}

export function Topbar({ user }: TopbarProps) {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-40 flex h-16 items-center justify-between border-b bg-background/95 px-4 backdrop-blur supports-[backdrop-filter]:bg-background/75 lg:px-6">
      <div className="flex items-center gap-3">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="lg:hidden" aria-label="Open navigation">
              <Menu className="size-5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-56">
            {mobileItems.map((item) => (
              <DropdownMenuItem key={item.href} asChild>
                <Link href={item.href}>{item.label}</Link>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
        <div className="lg:hidden">
          <WalletCards className="size-5 text-primary" />
        </div>
        <div>
          <h1 className="text-base font-semibold tracking-normal">{getPageTitle(pathname)}</h1>
          <p className="hidden text-xs text-muted-foreground sm:block">{user.businessName ?? user.email}</p>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <ThemeToggle />
        <div className="hidden text-right sm:block">
          <p className="text-sm font-medium leading-none">{user.name ?? "Merchant"}</p>
          <p className="mt-1 text-xs text-muted-foreground">{user.email}</p>
        </div>
        <div className="flex size-9 items-center justify-center rounded-md bg-secondary text-sm font-semibold">
          {(user.name ?? user.email).slice(0, 1).toUpperCase()}
        </div>
      </div>
    </header>
  );
}
