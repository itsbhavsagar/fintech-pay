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
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { fetchJson } from "@/lib/fetcher";
import { maskSecret } from "@/lib/utils";
import type { ThemePreference, UserDto } from "@/types/domain";

type MeResponse = {
  user: UserDto;
};

export default function SettingsPage() {
  const queryClient = useQueryClient();
  const { setTheme, theme } = useTheme();
  const me = useQuery({
    queryKey: ["me"],
    queryFn: () => fetchJson<MeResponse>("/api/auth/me"),
  });
  const [name, setName] = useState("");
  const [businessName, setBusinessName] = useState("");
  const [webhookUrl, setWebhookUrl] = useState("");
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    if (me.data?.user) {
      setName(me.data.user.name ?? "");
      setBusinessName(me.data.user.businessName ?? "");
      setWebhookUrl(me.data.user.webhookUrl ?? "");
    }
  }, [me.data]);

  const profileMutation = useMutation({
    mutationFn: () =>
      fetchJson<MeResponse>("/api/settings/profile", {
        method: "PATCH",
        body: JSON.stringify({
          name,
          businessName,
        }),
      }),
    onSuccess: async () => {
      setMessage("Profile saved");
      await queryClient.invalidateQueries({
        queryKey: ["me"],
      });
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
      setMessage("Webhook saved");
      await queryClient.invalidateQueries({
        queryKey: ["me"],
      });
    },
  });

  const apiKeyMutation = useMutation({
    mutationFn: () =>
      fetchJson<{ apiKey: string }>("/api/settings/api-key", {
        method: "POST",
      }),
    onSuccess: async () => {
      setMessage("API key regenerated");
      await queryClient.invalidateQueries({
        queryKey: ["me"],
      });
    },
  });

  const testWebhookMutation = useMutation({
    mutationFn: () =>
      fetchJson<{ ok: boolean; status: number }>("/api/settings/webhook/test", {
        method: "POST",
      }),
    onSuccess: (result) => {
      setMessage(
        result.ok
          ? "Webhook test delivered"
          : `Webhook returned ${result.status}`,
      );
    },
  });

  const currentUser = me.data?.user;
  const themeOptions: readonly ThemePreference[] = ["light", "dark", "system"];

  return (
    <div className="grid gap-5 xl:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserRound className="size-4" />
            Profile
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              value={name}
              onChange={(event) => setName(event.target.value)}
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
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Theme</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex rounded-md border p-1">
            {themeOptions.map((option) => (
              <Button
                key={option}
                variant={theme === option ? "secondary" : "ghost"}
                className="flex-1"
                onClick={() => setTheme(option)}
              >
                {option}
              </Button>
            ))}
          </div>
          {message ? (
            <p className="text-sm text-muted-foreground">{message}</p>
          ) : null}
        </CardContent>
      </Card>
    </div>
  );
}
