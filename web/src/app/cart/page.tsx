"use client";

import Link from "next/link";
import { useCart } from "@/context/cart-context";
import { QtyStepper } from "@/components/qty-stepper";
import { formatMoney } from "@/lib/price-tiers";

export default function CartPage() {
  const { lines, setQty, removeLine } = useCart();
  const subtotal = lines.reduce((s, l) => s + l.unitPrice * l.quantity, 0);

  return (
    <div>
      <h1 className="text-2xl font-semibold text-zinc-900">Cart</h1>
      {lines.length === 0 ? (
        <p className="mt-4 text-sm text-zinc-600">
          Your cart is empty.{" "}
          <Link href="/shop" className="font-medium text-emerald-800 hover:underline">
            Browse categories
          </Link>
          .
        </p>
      ) : (
        <div className="mt-6 space-y-4">
          {lines.map((l) => (
            <div
              key={l.slug}
              className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-zinc-200 bg-white p-4 shadow-sm"
            >
              <div>
                <Link href={`/product/${l.slug}`} className="font-medium text-emerald-900 hover:underline">
                  {l.title}
                </Link>
                <p className="text-xs text-zinc-500">{l.slug}</p>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <QtyStepper value={l.quantity} onChange={(n) => setQty(l.slug, n)} />
                <span className="text-sm text-zinc-700">
                  {formatMoney(l.currency ?? "USD", l.unitPrice * l.quantity)}
                </span>
                <button
                  type="button"
                  className="text-sm text-red-700 hover:underline"
                  onClick={() => removeLine(l.slug)}
                >
                  Remove
                </button>
              </div>
            </div>
          ))}
          <div className="flex items-center justify-between border-t border-zinc-200 pt-4">
            <span className="font-semibold text-zinc-900">Subtotal</span>
            <span className="text-lg font-semibold text-emerald-900">
              {formatMoney(lines[0]?.currency ?? "USD", subtotal)}
            </span>
          </div>
          <div className="space-y-2">
            <Link
              href="/checkout"
              className="inline-flex rounded-full bg-emerald-800 px-6 py-3 text-sm font-semibold text-white transition hover:bg-emerald-900 hover:shadow-md"
            >
              Proceed to checkout
            </Link>
            <p className="text-xs text-zinc-500">
              You must be signed in to check out. If you are not, you will be asked to register or sign in.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
