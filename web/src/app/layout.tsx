import type { Metadata } from "next";
import { Fraunces, Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { CartProvider } from "@/context/cart-context";
import { LayoutShell } from "@/components/layout-shell";
import { createClient } from "@/lib/supabase/server";

const displaySerif = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
});

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "MedicaPlanet — Professional aesthetic & peptide supply",
    template: "%s | MedicaPlanet",
  },
  description:
    "Licensed-professional supply for dermal fillers, botulinum toxins, mesotherapy, skincare, and research peptides.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${displaySerif.variable} h-full`}
    >
      <body className="flex min-h-full flex-col bg-[var(--mp-surface)] text-zinc-900 antialiased">
        <CartProvider cartOwnerKey={user?.id ?? null}>
          <LayoutShell>{children}</LayoutShell>
        </CartProvider>
      </body>
    </html>
  );
}
