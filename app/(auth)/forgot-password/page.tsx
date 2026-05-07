"use client";

import { Loader2, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Logo } from "@/components/Logo";
import Image from "next/image";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);

    await new Promise((resolve) => setTimeout(resolve, 1500));
    setLoading(false);
    setSubmitted(true);
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#f3f4f6] p-4 md:p-8">
      <div className="flex w-full max-w-6xl overflow-hidden rounded-[2.5rem] bg-white p-4 shadow-xl md:p-6 lg:h-[85vh]">
        <div className="relative hidden w-1/2 overflow-hidden rounded-4xl lg:block">
          <Image
            width={1920}
            height={1080}
            src="https://images.pexels.com/photos/18069861/pexels-photo-18069861.png"
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
                <span className="text-4xl font-bold tracking-tight text-zinc-800">
                  PaySense
                </span>
              </div>
              <h1 className="text-xl font-bold tracking-tight text-zinc-700">
                {submitted ? "Check your email" : "Reset your password"}
              </h1>
              <p className="text-sm text-zinc-500">
                {submitted
                  ? "We've sent a password reset link to your email."
                  : "Enter your email address and we'll send you a link to reset your password."}
              </p>
            </div>

            {!submitted ? (
              <form className="space-y-6" onSubmit={handleSubmit}>
                <div className="space-y-2">
                  <Label
                    htmlFor="email"
                    className="text-sm font-medium text-zinc-700"
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
                    className="h-12 rounded-full mt-3 border-zinc-200 bg-zinc-50 px-6 focus:border-primary focus:ring-primary/20"
                  />
                </div>

                <Button
                  className="w-full h-12 rounded-full bg-primary text-base font-semibold transition-all hover:opacity-90"
                  type="submit"
                  disabled={loading}
                >
                  {loading ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : null}
                  Send Reset Link
                </Button>
              </form>
            ) : (
              <div className="text-center">
                <p className="text-sm text-zinc-500 mb-6">
                  Didn&apos;t receive the email? Check your spam folder or try again.
                </p>
                <Button
                  variant="outline"
                  className="w-full h-12 rounded-full border-zinc-200 font-semibold"
                  onClick={() => setSubmitted(false)}
                >
                  Try another email
                </Button>
              </div>
            )}

            <p className="text-center text-sm text-zinc-500 pt-4">
              <Link
                href="/login"
                className="inline-flex items-center font-bold text-primary hover:underline"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Login
              </Link>
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
