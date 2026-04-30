"use client";

import Link from "next/link";
import { useCart } from "@/context/cart-context";
import { IconCartBag } from "@/components/nav-icons";

/**
 * Floating cart button shown only on mobile (bottom-right). Mirrors the
 * cart count from the cart context. Hidden on `md` and up since the desktop
 * top bar already exposes a cart button.
 */
export function FloatingCart() {
  const { count } = useCart();
  return (
    <Link
      href="/cart"
      aria-label={`View cart, ${count} items`}
      className="fixed bottom-4 right-4 z-[80] inline-flex h-14 w-14 items-center justify-center rounded-full bg-white text-filler-rose-800 shadow-lg ring-1 ring-filler-peach-200 transition hover:bg-filler-peach-50 md:hidden"
    >
      <IconCartBag className="h-7 w-7" />
      <span
        className="absolute -right-1 -top-1 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1 text-[11px] font-semibold text-white shadow"
        aria-hidden
      >
        {count > 9 ? "9+" : count}
      </span>
    </Link>
  );
}
