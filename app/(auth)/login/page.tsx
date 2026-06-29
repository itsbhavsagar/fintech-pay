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
import { DEMO_EMAIL, PRODUCT_NAME } from "@/lib/brand";

import { useEffect } from "react";
import Image from "next/image";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const savedEmail = localStorage.getItem("rememberedEmail");
    const savedPassword = localStorage.getItem("rememberedPassword");
    if (savedEmail && savedPassword) {
      setEmail(savedEmail);
      setPassword(savedPassword);
      setRememberMe(true);
    } else {
      setEmail(DEMO_EMAIL);
      setPassword("demo123");
    }
  }, []);

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
          rememberMe,
        }),
      });

      if (rememberMe) {
        localStorage.setItem("rememberedEmail", email);
        localStorage.setItem("rememberedPassword", password);
      } else {
        localStorage.removeItem("rememberedEmail");
        localStorage.removeItem("rememberedPassword");
      }

      router.push("/");
      router.refresh();
    } catch (caughtError: unknown) {
      setError(
        caughtError instanceof Error ? caughtError.message : "Login failed",
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
            src="https://images.pexels.com/photos/18069861/pexels-photo-18069861.png?auto=compress&cs=tinysrgb&w=1400&dpr=1&fm=webp&q=82"
            alt="Abstract Art"
            className="h-full w-full object-cover"
          />

          <div className="absolute inset-0 bg-black/5" />
        </div>

        <div className="flex w-full flex-col items-center justify-center px-4 py-8 md:px-12 lg:w-1/2">
          <div className="w-full max-w-md space-y-8">
            <div className="flex flex-col items-center space-y-3 text-center">
              <div className="mb-2 flex items-center gap-2">
                <Logo />
                <span className="text-4xl font-bold tracking-tight text-foreground">
                  {PRODUCT_NAME}
                </span>
              </div>
              <h1 className="text-xl font-bold tracking-tight text-foreground/80">
                Welcome Back!{" "}
              </h1>
              <p className="text-sm text-muted-foreground">
                Login to your account
              </p>
            </div>

            <form className="space-y-5" onSubmit={handleSubmit}>
              <div className="space-y-2">
                <Label
                  htmlFor="email"
                  className="text-sm font-medium text-foreground/70"
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
                  className="h-12 rounded-full border-border bg-muted/50 px-6 field-premium mt-2"
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label
                    htmlFor="password"
                    title="Password"
                    className="text-sm font-medium text-foreground/70"
                  >
                    Password
                  </Label>
                </div>
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  required
                  className="h-12 rounded-full border-border bg-muted/50 px-6 field-premium"
                />
              </div>

              <div className="flex items-center justify-between px-1">
                <label className="flex items-center gap-2 text-sm text-muted-foreground cursor-pointer">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="rounded border-border text-primary focus-premium"
                  />
                  Remember login
                </label>
                <Link
                  href="/forgot-password"
                  className="text-sm font-semibold text-primary hover:underline"
                >
                  Forgot Password?
                </Link>
              </div>

              {error ? (
                <p className="text-center text-sm font-medium text-destructive">
                  {error}
                </p>
              ) : null}

              <Button
                className="w-full h-12 rounded-full bg-primary text-primary-foreground text-base font-semibold transition-all hover:opacity-90"
                type="submit"
                disabled={loading}
              >
                {loading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : null}
                Login
              </Button>
            </form>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-border" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-card px-4 text-muted-foreground">
                  Or continue with
                </span>
              </div>
            </div>

            <p className="text-center text-sm text-muted-foreground">
              New here?{" "}
              <Link
                href="/register"
                className="font-bold text-primary hover:underline"
              >
                Create account
              </Link>
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
