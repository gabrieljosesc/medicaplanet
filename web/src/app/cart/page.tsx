"use client";

import Link from "next/link";
import { CartLineThumbnail } from "@/components/cart-line-thumbnail";
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
          <Link href="/shop" className="font-medium text-teal-800 hover:underline">
            Browse categories
          </Link>
          .
        </p>
      ) : (
        <div className="mt-6 space-y-4">
          <div className="flex items-center gap-3 rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm font-medium text-zinc-700 shadow-sm md:grid md:grid-cols-[28px_minmax(0,1fr)_120px_150px_120px_90px]">
            <input
              type="checkbox"
              checked={allSelected}
              onChange={(e) => setAllSelected(e.target.checked)}
              className="size-4 rounded border-teal-300 text-teal-700 accent-teal-700 focus:ring-teal-300"
            />
            <span className="md:hidden">Select all products</span>
            <span className="hidden md:inline">Product</span>
            <span className="hidden text-right md:inline">Unit Price</span>
            <span className="hidden text-center md:inline">Quantity</span>
            <span className="hidden text-right md:inline">Total Price</span>
            <span className="hidden text-right md:inline">Action</span>
          </div>
          {lines.map((l) => (
            <div
              key={l.slug}
              className="grid grid-cols-[28px_72px_minmax(0,1fr)] items-center gap-3 rounded-xl border border-zinc-200 bg-white px-4 py-4 shadow-sm md:grid-cols-[28px_minmax(0,1fr)_120px_150px_120px_90px]"
            >
              <input
                type="checkbox"
                checked={l.selected === true}
                onChange={(e) => setSelected(l.slug, e.target.checked)}
                className="size-4 rounded border-teal-300 text-teal-700 accent-teal-700 focus:ring-teal-300"
              />
              <div className="md:hidden">
                <CartLineThumbnail slug={l.slug} title={l.title} imageSrc={l.imageSrc} />
              </div>
              <div className="min-w-0 md:flex md:items-center md:gap-3">
                <div className="min-w-0 flex-1">
                  <Link href={`/product/${l.slug}`} className="font-medium text-teal-900 hover:underline">
                    {l.title}
                  </Link>
                  <p className="mt-1 line-clamp-2 text-xs leading-snug text-zinc-500">
                    SKU: {l.slug}
                  </p>
                  <div className="mt-3 flex items-center justify-between gap-3 md:hidden">
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-zinc-900">
                        {formatMoney(l.currency ?? "USD", l.unitPrice)}
                      </p>
                      {l.quantity > 1 ? (
                        <p className="text-xs text-zinc-500">
                          Total {formatMoney(l.currency ?? "USD", l.unitPrice * l.quantity)}
                        </p>
                      ) : null}
                    </div>
                    <QtyStepper value={l.quantity} onChange={(n) => setQty(l.slug, n)} size="sm" />
                  </div>
                  <button
                    type="button"
                    className="mt-2 text-xs text-red-700 hover:underline md:hidden"
                    onClick={() => removeLine(l.slug)}
                  >
                    Remove
                  </button>
                </div>
                <div className="hidden md:block">
                  <CartLineThumbnail slug={l.slug} title={l.title} imageSrc={l.imageSrc} />
                </div>
              </div>
              <span className="hidden text-right text-sm text-zinc-700 md:block">
                {formatMoney(l.currency ?? "USD", l.unitPrice)}
              </span>
              <div className="hidden justify-center md:flex">
                <QtyStepper value={l.quantity} onChange={(n) => setQty(l.slug, n)} size="sm" />
              </div>
              <span className="hidden text-right text-sm text-zinc-700 md:block">
                {formatMoney(l.currency ?? "USD", l.unitPrice * l.quantity)}
              </span>
              <div className="hidden text-right md:block">
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
            <span className="text-lg font-semibold text-teal-900">
              {formatMoney(lines[0]?.currency ?? "USD", selectedSubtotal)}
            </span>
          </div>
          <div className="space-y-2">
            <Link
              href={selectedLines.length > 0 ? "/checkout" : "/cart"}
              className={`inline-flex rounded-full px-6 py-3 text-sm font-semibold text-white transition ${
                selectedLines.length > 0
                  ? "bg-teal-800 hover:bg-teal-900 hover:shadow-md"
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
