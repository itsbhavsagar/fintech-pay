import type { Metadata } from "next";
import { Bricolage_Grotesque, Schibsted_Grotesk } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";

const bricolage = Bricolage_Grotesque({
  subsets: ["latin"],
  variable: "--font-bricolage",
});

const schibsted = Schibsted_Grotesk({
  subsets: ["latin"],
  variable: "--font-schibsted",
});

export const metadata: Metadata = {
  title: "PaySense",
  description: "Merchant payment dashboard for global payment operations.",
  icons: {
    icon: "/favicon.svg",
    apple: "/apple-touch-icon.svg",
  },
};

type RootLayoutProps = {
  children: React.ReactNode;
};

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${bricolage.variable} ${schibsted.variable} min-h-screen bg-background font-sans text-foreground antialiased`}
      >
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
