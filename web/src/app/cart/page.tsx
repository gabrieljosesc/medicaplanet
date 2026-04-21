"use client";

import Link from "next/link";
import { useCart } from "@/context/cart-context";
import { QtyStepper } from "@/components/qty-stepper";
import { formatMoney } from "@/lib/price-tiers";

export default function CartPage() {
  const { lines, setQty, removeLine, setSelected, setAllSelected, selectedLines, selectedSubtotal } =
    useCart();
  const allSelected = lines.length > 0 && selectedLines.length === lines.length;

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
          <label className="inline-flex items-center gap-2 text-sm text-zinc-700">
            <input
              type="checkbox"
              checked={allSelected}
              onChange={(e) => setAllSelected(e.target.checked)}
              className="size-4 rounded border-zinc-400"
            />
            Select all
          </label>
          {lines.map((l) => (
            <div
              key={l.slug}
              className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-zinc-200 bg-white p-4 shadow-sm"
            >
              <div className="flex items-start gap-3">
                <input
                  type="checkbox"
                  checked={l.selected === true}
                  onChange={(e) => setSelected(l.slug, e.target.checked)}
                  className="mt-1 size-4 rounded border-zinc-400"
                />
                <div>
                <Link href={`/product/${l.slug}`} className="font-medium text-emerald-900 hover:underline">
                  {l.title}
                </Link>
                <p className="text-xs text-zinc-500">{l.slug}</p>
                </div>
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
              {formatMoney(lines[0]?.currency ?? "USD", selectedSubtotal)}
            </span>
          </div>
          <div className="space-y-2">
            <Link
              href={selectedLines.length > 0 ? "/checkout" : "/cart"}
              className={`inline-flex rounded-full px-6 py-3 text-sm font-semibold text-white transition ${
                selectedLines.length > 0
                  ? "bg-emerald-800 hover:bg-emerald-900 hover:shadow-md"
                  : "cursor-not-allowed bg-zinc-400"
              }`}
              onClick={(e) => {
                if (selectedLines.length === 0) e.preventDefault();
              }}
            >
              Proceed to checkout
            </Link>
            <p className="text-xs text-zinc-500">
              Select at least one item to continue. You must be signed in to check out.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
