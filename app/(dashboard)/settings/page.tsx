"use client";

import {
  KeyRound,
  Loader2,
  RotateCcw,
  Save,
  Send,
  UserRound,
} from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useUser } from "@/hooks/useUser";
import { fetchJson } from "@/lib/fetcher";
import { maskSecret } from "@/lib/utils";
import type { ThemePreference, UserDto } from "@/types/domain";

export default function SettingsPage() {
  const queryClient = useQueryClient();
  const { setTheme, theme } = useTheme();
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
  const themeOptions: readonly ThemePreference[] = ["light", "dark", "system"];

  if (isUserLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="size-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <TooltipProvider>
      <div className="grid gap-5 xl:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserRound className="size-4" />
              Profile
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-4">
              <Avatar className="size-16">
                <AvatarImage src={image} alt={name} />
                <AvatarFallback className="text-xl font-semibold">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 space-y-1">
                <p className="text-sm font-medium leading-none">{name || "Merchant"}</p>
                <p className="text-xs text-muted-foreground">{currentUser?.email}</p>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={name}
                onChange={(event) => setName(event.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="image">Avatar URL</Label>
              <Input
                id="image"
                placeholder="paste your avatar URL"
                value={image}
                onChange={(event) => setImage(event.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="businessName">Business name</Label>
              <Input
                id="businessName"
                value={businessName}
                onChange={(event) => setBusinessName(event.target.value)}
              />
            </div>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  onClick={() => profileMutation.mutate()}
                  disabled={profileMutation.isPending || !name || !businessName}
                >
                  {profileMutation.isPending ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : (
                    <Save className="size-4" />
                  )}
                  Save Profile
                </Button>
              </TooltipTrigger>
              <TooltipContent>Save your profile changes</TooltipContent>
            </Tooltip>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <KeyRound className="size-4" />
              API Keys
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-lg border bg-secondary p-4 font-mono text-sm">
              {currentUser ? maskSecret(currentUser.apiKey) : "Loading"}
            </div>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  onClick={() => apiKeyMutation.mutate()}
                  disabled={apiKeyMutation.isPending}
                >
                  {apiKeyMutation.isPending ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : (
                    <RotateCcw className="size-4" />
                  )}
                  Regenerate
                </Button>
              </TooltipTrigger>
              <TooltipContent>Regenerate your API key</TooltipContent>
            </Tooltip>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Webhook</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="webhookUrl">Webhook URL</Label>
              <Input
                id="webhookUrl"
                type="url"
                value={webhookUrl}
                onChange={(event) => setWebhookUrl(event.target.value)}
                placeholder="https://example.com/webhooks/paysense"
              />
            </div>
            <div className="flex flex-wrap gap-2">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    onClick={() => webhookMutation.mutate()}
                    disabled={webhookMutation.isPending}
                  >
                    {webhookMutation.isPending ? (
                      <Loader2 className="size-4 animate-spin" />
                    ) : (
                      <Save className="size-4" />
                    )}
                    Save Webhook
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Save your webhook endpoint</TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    onClick={() => testWebhookMutation.mutate()}
                    disabled={testWebhookMutation.isPending}
                  >
                    {testWebhookMutation.isPending ? (
                      <Loader2 className="size-4 animate-spin" />
                    ) : (
                      <Send className="size-4" />
                    )}
                    Test Webhook
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Send a test event to your webhook</TooltipContent>
              </Tooltip>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Theme</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
           <div className="flex rounded-md border p-1 bg-muted/50">
  {themeOptions.map((option) => (
    <Button
      key={option}
      variant={theme === option ? "default" : "ghost"}
      className="flex-1 transition-all"
      onClick={() => setTheme(option)}
    >
      {option.charAt(0).toUpperCase() + option.slice(1)}
    </Button>
  ))}
</div>
          </CardContent>
        </Card>
      </div>
    </TooltipProvider>
  );
}
