import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Suspense } from "react";
import "./globals.css";
import { CartProvider } from "@/context/cart-context";
import { LayoutShell } from "@/components/layout-shell";
import { MarketingPixels } from "@/components/marketing-pixels";
import { NavigationProgressProvider } from "@/components/navigation-progress";
import { createClient } from "@/lib/supabase/server";

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
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} h-full`}>
      <body className="flex min-h-full flex-col bg-filler-cream text-filler-ink antialiased">
        <MarketingPixels />
        <CartProvider cartOwnerKey={user?.id ?? null}>
          <Suspense fallback={null}>
            <NavigationProgressProvider>
              <LayoutShell>{children}</LayoutShell>
            </NavigationProgressProvider>
          </Suspense>
        </CartProvider>
      </body>
    </html>
  );
}
