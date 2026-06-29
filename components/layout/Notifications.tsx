"use client";

import { Bell, AlertCircle, Info } from "lucide-react";
import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ScrollArea } from "@/components/ui/scroll-area";
import { fetchJson } from "@/lib/fetcher";
import { NOTIFICATIONS_POLL_INTERVAL } from "@/lib/query-config";
import { cn } from "@/lib/utils";

type Notification = {
  id: string;
  type: "success_rate" | "volume_spike" | "failure_rate" | "zero_transactions" | "success" | "failure";
  severity: "critical" | "warning" | "info";
  title: string;
  description: string;
  date: string;
  read: boolean;
};

export function Notifications() {
  const [readIds, setReadIds] = useState<Set<string>>(new Set());

  const { data } = useQuery({
    queryKey: ["notifications"],
    queryFn: () => fetchJson<{ anomalies: Notification[] }>("/api/notifications"),
    refetchInterval: NOTIFICATIONS_POLL_INTERVAL,
    staleTime: NOTIFICATIONS_POLL_INTERVAL,
  });

  const notifications = useMemo(() => {
    if (!data?.anomalies) return [];

    return data.anomalies.map((anomaly: any, index: number) => ({
      id: `anomaly-${index}-${anomaly.date}`,
      type: anomaly.type,
      severity: anomaly.severity,
      title: anomaly.type.replace("_", " ").toUpperCase(),
      description: anomaly.description,
      date: anomaly.date || new Date().toISOString(),
      read: readIds.has(`anomaly-${index}-${anomaly.date}`),
    })) as Notification[];
  }, [data, readIds]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAsRead = (id: string) => {
    setReadIds((prev) => new Set(prev).add(id));
  };

  const markAllAsRead = () => {
    setReadIds(new Set(notifications.map((n) => n.id)));
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative h-9 w-9 rounded-full"
          aria-label="Notifications"
        >
          <Bell className="size-5" />
          {unreadCount > 0 && (
            <span className="absolute right-1 top-1 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-[10px] font-bold text-white animate-in zoom-in">
              {unreadCount}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80 p-0" sideOffset={8}>
        <div className="flex items-center justify-between border-b px-4 py-3">
          <p className="text-sm font-semibold">Notifications</p>
          {unreadCount > 0 && (
            <button
              onClick={markAllAsRead}
              className="text-xs text-primary hover:underline"
            >
              Mark all as read
            </button>
          )}
        </div>
        <ScrollArea className="h-[350px]">
          {notifications.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center p-8 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                <Bell className="size-6 text-muted-foreground" />
              </div>
              <p className="mt-4 text-sm font-medium">No notifications yet</p>
              <p className="mt-1 text-xs text-muted-foreground">
                We&apos;ll notify you when something important happens.
              </p>
            </div>
          ) : (
            <div className="flex flex-col">
              {notifications.map((notification) => (
                <DropdownMenuItem
                  key={notification.id}
                  className={cn(
                    "flex cursor-pointer flex-col items-start gap-1 p-4 focus:bg-accent",
                    !notification.read && "bg-accent/40"
                  )}
                  onSelect={() => markAsRead(notification.id)}
                >
                  <div className="flex w-full items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      {notification.severity === "critical" ? (
                        <AlertCircle className="size-4 text-destructive" />
                      ) : notification.severity === "warning" ? (
                        <AlertCircle className="size-4 text-yellow-500" />
                      ) : (
                        <Info className="size-4 text-blue-500" />
                      )}
                      <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                        {notification.title}
                      </span>
                    </div>
                    {!notification.read && (
                      <span className="h-2 w-2 rounded-full bg-primary" />
                    )}
                  </div>
                  <p className="text-sm font-medium leading-snug">
                    {notification.description}
                  </p>
                  <p className="text-[10px] text-muted-foreground">
                    {new Date(notification.date).toLocaleDateString(undefined, {
                      month: "short",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </DropdownMenuItem>
              ))}
            </div>
          )}
        </ScrollArea>
        <div className="border-t p-2">
          <Button variant="ghost" className="w-full justify-center text-xs" asChild>
            <a href="/ai-intelligence">View all intelligence</a>
          </Button>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
