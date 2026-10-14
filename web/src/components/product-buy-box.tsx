"use client";

import { useMemo, useState } from "react";
import { useCart } from "@/context/cart-context";
import {
  formatMoney,
  parsePriceTiersJson,
  tierQuantityLabel,
  unitPriceForQuantity,
  type PriceTierRow,
} from "@/lib/price-tiers";
import { QtyStepper } from "@/components/qty-stepper";

export function ProductBuyBox({
  slug,
  title,
  currency,
  basePrice,
  priceTiersRaw,
  isFree,
  disabled,
  heroImageSrc,
}: {
  slug: string;
  title: string;
  currency: string;
  basePrice: number;
  priceTiersRaw: unknown;
  /** Complimentary item — shows "FREE", stays addable to cart at $0. */
  isFree?: boolean;
  disabled?: boolean;
  /** Main product image URL for cart thumbnails */
  heroImageSrc?: string | null;
}) {
  const tiers = useMemo(() => parsePriceTiersJson(priceTiersRaw), [priceTiersRaw]);
  const { addLine } = useCart();
  const [qty, setQty] = useState(1);
  const [msg, setMsg] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);

  const free = isFree === true;
  const hasPrice = basePrice > 0 || tiers.length > 0 || free;
  const unit = useMemo(
    () => (free ? 0 : unitPriceForQuantity(tiers, qty, basePrice)),
    [free, tiers, qty, basePrice]
  );
  const lineTotal = unit * qty;

  if (!hasPrice) {
    return (
      <div className="mt-6">
        <p className="text-lg font-semibold text-zinc-600">Request pricing</p>
        <p className="mt-2 text-sm text-zinc-500">Our team will confirm availability and pricing.</p>
      </div>
    );
  }

  return (
    <div className="mt-6 space-y-4">
      {free ? (
        <div>
          <p className="text-3xl font-bold uppercase tracking-wide text-green-700">Free</p>
          <p className="mt-1 text-sm text-zinc-600">
            Complimentary with your peptide order — add it to your cart at no charge.
          </p>
        </div>
      ) : (
        <p className="text-2xl font-semibold text-teal-900">{formatMoney(currency, unit)}</p>
      )}
      {!free && tiers.length > 1 && (
        <p className="text-xs text-zinc-500">Price per unit updates from the quantity you choose.</p>
      )}

      {!free && tiers.length > 0 && (
        <div className="rounded-xl border border-zinc-200 bg-zinc-50/80">
          <p className="border-b border-zinc-200 px-3 py-2 text-xs font-medium uppercase tracking-wide text-zinc-600">
            Volume pricing
          </p>
          <ul className="divide-y divide-zinc-200">
            {tiers.map((t: PriceTierRow, i: number) => (
              <li
                key={`${t.minQ}-${t.maxQ}-${i}`}
                className="flex items-center justify-between px-3 py-2 text-sm text-zinc-700"
              >
                <span>{tierQuantityLabel(t)}</span>
                <span className="font-medium text-teal-900 tabular-nums">{formatMoney(currency, t.price)}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="flex flex-wrap items-center gap-3">
        <span className="text-sm text-zinc-600">Qty</span>
        <QtyStepper value={qty} onChange={setQty} disabled={disabled} />
      </div>
      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          disabled={disabled || adding}
          aria-busy={adding}
          onClick={() => {
            setAdding(true);
            addLine({
              slug,
              title,
              unitPrice: unit,
              quantity: qty,
              currency,
              priceTiers: free ? undefined : tiers.length ? tiers : undefined,
              imageSrc: heroImageSrc ?? undefined,
              isFree: free || undefined,
            });
            setMsg("Added to cart");
            setTimeout(() => {
              setAdding(false);
              setMsg(null);
            }, 1200);
          }}
          className="rounded-full bg-teal-800 px-6 py-2.5 text-sm font-semibold text-white shadow transition hover:bg-teal-900 active:scale-[0.98] active:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {adding ? "Added ✓" : "Add to cart"}
        </button>
        {msg && <span className="text-sm text-teal-800">{msg}</span>}
      </div>

      {qty > 1 && !free && (
        <p className="text-sm text-zinc-600">
          {qty} × {formatMoney(currency, unit)} ={" "}
          <span className="font-semibold text-teal-900">{formatMoney(currency, lineTotal)}</span>
        </p>
      )}
    </div>
  );
}
