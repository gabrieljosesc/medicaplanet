"use client";

import Link from "next/link";
import { useCart } from "@/context/cart-context";
import { IconCartBag } from "@/components/nav-icons";

export function CartBadge() {
  const { count } = useCart();
  return (
    <Link
      href="/cart"
      title="View cart"
      aria-label="View cart"
      className="relative inline-flex h-9 w-9 items-center justify-center rounded-md text-emerald-800 hover:bg-emerald-50 hover:text-emerald-900"
    >
      <IconCartBag className="h-[22px] w-[22px] shrink-0" />
      {count > 0 && (
        <span className="absolute right-0 top-0 flex h-4 min-w-4 translate-x-0.5 -translate-y-0.5 items-center justify-center rounded-full bg-emerald-700 px-1 text-[10px] font-medium text-white">
          {count > 9 ? "9+" : count}
        </span>
      )}
    </Link>
  );
}
