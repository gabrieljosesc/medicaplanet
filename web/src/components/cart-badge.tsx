"use client";

import Link from "next/link";
import { useCart } from "@/context/cart-context";
import { IconCartBag } from "@/components/nav-icons";

export function CartBadge({
  tone = "default",
  showLabel = false,
}: {
  tone?: "default" | "light";
  showLabel?: boolean;
}) {
  const { count } = useCart();
  const isLight = tone === "light";
  const countLabel = count > 9 ? "9+" : String(count);

  if (showLabel) {
    const onDark = isLight;
    return (
      <Link
        href="/cart"
        title="View cart"
        aria-label={`Cart, ${count} items`}
        className={
          onDark
            ? "relative inline-flex h-9 items-center rounded-full px-3 text-sm font-medium text-white hover:bg-white/10"
            : "relative inline-flex h-9 items-center rounded-full px-3 text-sm font-medium text-zinc-800 hover:bg-zinc-100"
        }
      >
        <span className="tabular-nums">Cart ({countLabel})</span>
        {count > 0 ? (
          <span
            className={
              onDark
                ? "absolute right-2 top-2 h-2 w-2 rounded-full bg-red-500 ring-2 ring-white/30"
                : "absolute right-2 top-2 h-2 w-2 rounded-full bg-red-500 ring-2 ring-white"
            }
          />
        ) : null}
      </Link>
    );
  }

  return (
    <Link
      href="/cart"
      title="View cart"
      aria-label="View cart"
      className={
        isLight
          ? "relative inline-flex h-9 w-9 items-center justify-center rounded-full text-white hover:bg-white/10"
          : "relative inline-flex h-9 w-9 items-center justify-center rounded-md text-filler-rose-800 hover:bg-filler-peach-200/90 hover:text-filler-ink"
      }
    >
      <IconCartBag className="h-[22px] w-[22px] shrink-0" />
      {count > 0 && (
        <span
          className={
            isLight
              ? "absolute right-0 top-0 flex h-4 min-w-4 translate-x-0.5 -translate-y-0.5 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-medium text-white"
              : "absolute right-0 top-0 flex h-4 min-w-4 translate-x-0.5 -translate-y-0.5 items-center justify-center rounded-full bg-filler-rose-700 px-1 text-[10px] font-medium text-white"
          }
        >
          {count > 9 ? "9+" : count}
        </span>
      )}
    </Link>
  );
}
