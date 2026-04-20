import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { CartProvider } from "@/context/cart-context";
import { LayoutShell } from "@/components/layout-shell";

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
    "Licensed-professional supply for dermal fillers, botulinum toxins, orthopedic injectables, mesotherapy, and research peptides.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} h-full`}>
      <body className="flex min-h-full flex-col bg-zinc-50 text-zinc-900 antialiased">
        <CartProvider>
          <LayoutShell>{children}</LayoutShell>
        </CartProvider>
      </body>
    </html>
  );
}
