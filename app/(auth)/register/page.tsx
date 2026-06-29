"use client";

import { Loader2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { fetchJson } from "@/lib/fetcher";
import { Logo } from "@/components/Logo";
import { PRODUCT_NAME } from "@/lib/brand";
import Image from "next/image";

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
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : "Registration failed",
      );
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-secondary p-4 md:p-8">
      <div className="flex w-full max-w-6xl overflow-hidden rounded-[2.5rem] bg-card p-4 shadow-xl md:p-6 lg:h-[85vh]">
        <div className="relative hidden w-1/2 overflow-hidden rounded-4xl lg:block">
          <Image
            width={1920}
            height={1080}
            src="https://images.pexels.com/photos/18069828/pexels-photo-18069828.png?auto=compress&cs=tinysrgb&w=1400&dpr=1&fm=webp&q=82"
            alt="Abstract Art"
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-black/5" />
        </div>

        <div className="flex w-full flex-col items-center justify-center px-4 py-8 md:px-12 lg:w-1/2">
          <div className="w-full max-w-md space-y-6">
            <div className="flex flex-col items-center space-y-3 text-center">
              <div className="mb-2 flex items-center gap-2">
                <Logo />
                <span className="text-4xl font-bold tracking-tight text-foreground">
                  {PRODUCT_NAME}
                </span>
              </div>
              <h1 className="text-xl font-bold tracking-tight text-foreground">
                Create your account
              </h1>
              <p className="text-sm text-muted-foreground">
                Join {PRODUCT_NAME} and start managing your payments
              </p>
            </div>

            <form className="space-y-4" onSubmit={handleSubmit}>
              <div className="space-y-1.5">
                <Label
                  htmlFor="name"
                  className="text-sm font-medium text-foreground/70 ml-1"
                >
                  Name
                </Label>
                <Input
                  id="name"
                  placeholder="Enter your name"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  required
                  className="h-11 rounded-full border-border bg-muted/50 px-6 field-premium"
                />
              </div>

              <div className="space-y-1.5">
                <Label
                  htmlFor="businessName"
                  className="text-sm font-medium text-foreground/70 ml-1"
                >
                  Business Name
                </Label>
                <Input
                  id="businessName"
                  placeholder="Enter your business name"
                  value={businessName}
                  onChange={(event) => setBusinessName(event.target.value)}
                  required
                  className="h-11 rounded-full border-border bg-muted/50 px-6 field-premium"
                />
              </div>

              <div className="space-y-1.5">
                <Label
                  htmlFor="email"
                  className="text-sm font-medium text-foreground/70 ml-1"
                >
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  required
                  className="h-11 rounded-full border-border bg-muted/50 px-6 field-premium"
                />
              </div>

              <div className="space-y-1.5">
                <Label
                  htmlFor="password"
                  title="Password"
                  className="text-sm font-medium text-foreground/70 ml-1"
                >
                  Password
                </Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Create a password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  required
                  className="h-11 rounded-full border-border bg-muted/50 px-6 field-premium"
                />
              </div>

              {error ? (
                <p className="text-center text-sm font-medium text-destructive">
                  {error}
                </p>
              ) : null}

              <Button
                className="w-full h-11 rounded-full bg-primary text-primary-foreground text-base font-semibold transition-all hover:opacity-90 mt-2"
                type="submit"
                disabled={loading}
              >
                {loading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : null}
                Create account
              </Button>
            </form>

            <p className="text-center text-sm text-muted-foreground">
              Already have an account?{" "}
              <Link
                href="/login"
                className="font-bold text-primary hover:underline"
              >
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
