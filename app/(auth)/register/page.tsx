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

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [businessName, setBusinessName] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await fetchJson<{ user: unknown }>("/api/auth/register", {
        method: "POST",
        body: JSON.stringify({
          name,
          email,
          businessName,
          password,
        }),
      });
      router.push("/");
      router.refresh();
    } catch (caughtError: unknown) {
      setError(caughtError instanceof Error ? caughtError.message : "Registration failed");
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
            <CardTitle className="text-2xl">Create a PaySense account</CardTitle>
            <p className="mt-2 text-sm text-muted-foreground">Launch a merchant dashboard backed by your Neon database.</p>
          </div>
        </CardHeader>
        <CardContent>
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input id="name" value={name} onChange={(event) => setName(event.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="businessName">Business name</Label>
              <Input id="businessName" value={businessName} onChange={(event) => setBusinessName(event.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                minLength={6}
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                required
              />
            </div>
            {error ? <p className="text-sm text-destructive">{error}</p> : null}
            <Button className="w-full" type="submit" disabled={loading}>
              {loading ? <Loader2 className="size-4 animate-spin" /> : null}
              Register
            </Button>
          </form>
          <p className="mt-5 text-center text-sm text-muted-foreground">
            Already registered?{" "}
            <Link href="/login" className="font-medium text-primary">
              Sign in
            </Link>
          </p>
        </CardContent>
      </Card>
    </main>
  );
}
