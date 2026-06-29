"use client";

import {
  Loader2,
  RotateCcw,
  Save,
  Send,
  UserRound,
  Code
} from "lucide-react";
import { useEffect, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { SettingsCard } from "@/components/settings/SettingsCard";
import { SettingsAction } from "@/components/settings/SettingsAction";
import { SkeletonSettingsPage } from "@/components/layout/ContentAreaLoader";
import { useUser } from "@/hooks/useUser";
import { fetchJson } from "@/lib/fetcher";
import { maskSecret } from "@/lib/utils";
import type { UserDto } from "@/types/domain";

export default function SettingsPage() {
  const queryClient = useQueryClient();
  const { data: currentUser, isLoading: isUserLoading } = useUser();
  
  const [name, setName] = useState("");
  const [image, setImage] = useState("");
  const [businessName, setBusinessName] = useState("");
  const [webhookUrl, setWebhookUrl] = useState("");

  useEffect(() => {
    if (currentUser) {
      setName(currentUser.name ?? "");
      setImage(currentUser.image ?? "");
      setBusinessName(currentUser.businessName ?? "");
      setWebhookUrl(currentUser.webhookUrl ?? "");
    }
  }, [currentUser]);

  const profileMutation = useMutation({
    mutationFn: () =>
      fetchJson<{ user: UserDto }>("/api/settings/profile", {
        method: "PATCH",
        body: JSON.stringify({
          name,
          businessName,
          image: image.trim() || null,
        }),
      }),
    onSuccess: async () => {
      toast.success("Profile updated successfully");
      await queryClient.invalidateQueries({
        queryKey: ["me"],
      });
    },
    onError: () => {
      toast.error("Failed to update profile");
    },
  });

  const webhookMutation = useMutation({
    mutationFn: () =>
      fetchJson<{ webhookUrl: string | null }>("/api/settings/webhook", {
        method: "PATCH",
        body: JSON.stringify({
          webhookUrl: webhookUrl.trim() ? webhookUrl.trim() : null,
        }),
      }),
    onSuccess: async () => {
      toast.success("Webhook settings saved");
      await queryClient.invalidateQueries({
        queryKey: ["me"],
      });
    },
    onError: () => {
      toast.error("Failed to save webhook settings");
    },
  });

  const apiKeyMutation = useMutation({
    mutationFn: () =>
      fetchJson<{ apiKey: string }>("/api/settings/api-key", {
        method: "POST",
      }),
    onSuccess: async () => {
      toast.success("API key regenerated");
      await queryClient.invalidateQueries({
        queryKey: ["me"],
      });
    },
    onError: () => {
      toast.error("Failed to regenerate API key");
    },
  });

  const testWebhookMutation = useMutation({
    mutationFn: () =>
      fetchJson<{ ok: boolean; status: number }>("/api/settings/webhook/test", {
        method: "POST",
      }),
    onSuccess: (result) => {
      if (result.ok) {
        toast.success("Webhook test delivered successfully");
      } else {
        toast.error(`Webhook test failed with status ${result.status}`);
      }
    },
  });

  const initials = (currentUser?.name ?? currentUser?.email ?? "?").slice(0, 1).toUpperCase();

  if (isUserLoading) {
    return <SkeletonSettingsPage />;
  }

  return (
    <TooltipProvider>
      <div className="grid gap-6 xl:grid-cols-2 max-w-5xl">
        <SettingsCard title="Profile" icon={UserRound}>
          <div className="flex items-center gap-4 pb-2">
            <Avatar className="size-16 border border-border/50">
              <AvatarImage src={image} alt={name} className="object-cover" />
              <AvatarFallback className="text-xl font-semibold bg-primary/10 text-primary">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 space-y-1">
              <p className="text-sm font-semibold leading-none">{name || "Merchant"}</p>
              <p className="text-xs text-muted-foreground">{currentUser?.email}</p>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              value={name}
              onChange={(event) => setName(event.target.value)}
              className="bg-background"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="image">Avatar URL</Label>
            <Input
              id="image"
              placeholder="https://example.com/avatar.jpg"
              value={image}
              onChange={(event) => setImage(event.target.value)}
              className="bg-background"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="businessName">Business Name</Label>
            <Input
              id="businessName"
              value={businessName}
              onChange={(event) => setBusinessName(event.target.value)}
              className="bg-background"
            />
          </div>
          <div className="pt-2">
            <SettingsAction
              label="Save Profile"
              tooltip="Save your profile changes"
              icon={Save}
              onClick={() => profileMutation.mutate()}
              isPending={profileMutation.isPending}
              disabled={!name || !businessName}
            />
          </div>
        </SettingsCard>

        <SettingsCard title="Developer Settings" icon={Code}>
          <div className="space-y-6">
            <div>
              <div className="space-y-2">
                <Label>Live Secret Key</Label>
                <div className="rounded-lg border bg-background px-4 py-3 font-mono text-sm tracking-widest opacity-80 select-all">
                  {currentUser ? maskSecret(currentUser.apiKey) : "Loading"}
                </div>
              </div>
              <div className="pt-2">
                <SettingsAction
                  label="Regenerate Key"
                  tooltip="Invalidates old key and generates a new one"
                  icon={RotateCcw}
                  onClick={() => apiKeyMutation.mutate()}
                  isPending={apiKeyMutation.isPending}
                  variant="outline"
                />
              </div>
            </div>

            <div className="h-px bg-border/50" />

            <div>
              <div className="space-y-2">
                <Label htmlFor="webhookUrl">Webhook URL</Label>
                <Input
                  id="webhookUrl"
                  type="url"
                  value={webhookUrl}
                  onChange={(event) => setWebhookUrl(event.target.value)}
                  placeholder="https://example.com/webhooks/fintechpay"
                  className="bg-background"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Receive real-time event payloads when payment links are fulfilled.
                </p>
              </div>
              <div className="flex flex-wrap gap-3 pt-2">
                <SettingsAction
                  label="Save Webhook"
                  tooltip="Save your webhook endpoint"
                  icon={Save}
                  onClick={() => webhookMutation.mutate()}
                  isPending={webhookMutation.isPending}
                />
                <SettingsAction
                  label="Test Webhook"
                  tooltip="Send a test ping event"
                  icon={Send}
                  onClick={() => testWebhookMutation.mutate()}
                  isPending={testWebhookMutation.isPending}
                  variant="outline"
                />
              </div>
            </div>
          </div>
        </SettingsCard>
      </div>
    </TooltipProvider>
  );
}
