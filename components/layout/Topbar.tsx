"use client";

import { Laptop, LogOut, Menu, Moon, Sun, WalletCards } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuPortal,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Notifications } from "@/components/layout/Notifications";
import { useUser } from "@/hooks/useUser";
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
  const match = mobileItems.find((item) =>
    item.href === "/" ? pathname === "/" : pathname.startsWith(item.href),
  );
  return match?.label ?? "Dashboard";
}

export function Topbar({ user: initialUser }: TopbarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { setTheme } = useTheme();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const { data: user } = useUser(initialUser);

  const currentUser = user ?? initialUser;

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      localStorage.clear();
      toast.success("Logged out successfully");
      router.push("/login");
    } catch {
      toast.error("Logout failed");
    } finally {
      setIsLoggingOut(false);
    }
  };

  const initials = (currentUser.name ?? currentUser.email).slice(0, 1).toUpperCase();

  return (
    <header className="sticky top-0 z-40 flex h-16 items-center justify-between border-b bg-background/95 px-4 backdrop-blur supports-backdrop-filter:bg-background/75 lg:px-6">
      <div className="flex items-center gap-3">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              aria-label="Open navigation"
            >
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
          <h1 className="text-base font-semibold tracking-normal">
            {getPageTitle(pathname)}
          </h1>
          <p className="hidden text-xs text-muted-foreground sm:block">
            {currentUser.businessName ?? currentUser.email}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <Notifications />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="gap-2 hidden sm:flex cursor-pointer px-2">
              <Avatar className="size-9 rounded-md">
                <AvatarImage src={currentUser.image ?? undefined} alt={currentUser.name ?? ""} />
                <AvatarFallback className="rounded-md bg-secondary text-sm font-semibold">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div className="text-right">
                <p className="text-sm font-medium leading-none">
                  {currentUser.name ?? "Merchant"}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {currentUser.email}
                </p>
              </div>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuItem asChild>
              <Link href="/settings" className="cursor-pointer">Settings</Link>
            </DropdownMenuItem>
            <DropdownMenuSub>
              <DropdownMenuSubTrigger>Theme</DropdownMenuSubTrigger>
              <DropdownMenuPortal>
                <DropdownMenuSubContent className="mr-2">
                  <DropdownMenuItem onClick={() => setTheme("light")}>
                    <Sun className="mr-2 size-4" />
                    <span>Light</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setTheme("dark")}>
                    <Moon className="mr-2 size-4" />
                    <span>Dark</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setTheme("system")}>
                    <Laptop className="mr-2 size-4" />
                    <span>System</span>
                  </DropdownMenuItem>
                </DropdownMenuSubContent>
              </DropdownMenuPortal>
            </DropdownMenuSub>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={handleLogout}
              disabled={isLoggingOut}
              className="text-destructive cursor-pointer"
            >
              <LogOut className="mr-2 size-4" />
              {isLoggingOut ? "Logging out..." : "Logout"}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <Avatar className="size-9 rounded-md sm:hidden">
          <AvatarImage src={currentUser.image ?? undefined} alt={currentUser.name ?? ""} />
          <AvatarFallback className="rounded-md bg-secondary text-sm font-semibold">
            {initials}
          </AvatarFallback>
        </Avatar>
      </div>
    </header>
  );
}

