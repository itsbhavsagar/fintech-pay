"use client";

import { Loader2, WalletCards } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { fetchJson } from "@/lib/fetcher";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("demo@paysense.in");
  const [password, setPassword] = useState("demo123");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await fetchJson<{ user: unknown }>("/api/auth/login", {
        method: "POST",
        body: JSON.stringify({
          email,
          password,
        }),
      });
      router.push("/");
      router.refresh();
    } catch (caughtError: unknown) {
      setError(
        caughtError instanceof Error ? caughtError.message : "Login failed",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-secondary px-4 py-10">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-4">
          <div className="flex size-11 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <WalletCards className="size-6" />
          </div>
          <div>
            <CardTitle className="text-2xl">Sign in to PaySense</CardTitle>
            <p className="mt-2 text-sm text-muted-foreground">
              Access your merchant payment operations dashboard.
            </p>
          </div>
        </CardHeader>
        <CardContent>
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                required
              />
            </div>
            {error ? <p className="text-sm text-destructive">{error}</p> : null}
            <Button className="w-full" type="submit" disabled={loading}>
              {loading ? <Loader2 className="size-4 animate-spin" /> : null}
              Login
            </Button>
          </form>
          <p className="mt-5 text-center text-sm text-muted-foreground">
            New merchant?{" "}
            <Link href="/register" className="font-medium text-primary">
              Create account
            </Link>
          </p>
        </CardContent>
      </Card>
    </main>
  );
}
