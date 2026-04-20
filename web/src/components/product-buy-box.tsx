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
  disabled,
}: {
  slug: string;
  title: string;
  currency: string;
  basePrice: number;
  priceTiersRaw: unknown;
  disabled?: boolean;
}) {
  const tiers = useMemo(() => parsePriceTiersJson(priceTiersRaw), [priceTiersRaw]);
  const { addLine } = useCart();
  const [qty, setQty] = useState(1);
  const [msg, setMsg] = useState<string | null>(null);

  const hasPrice = basePrice > 0 || tiers.length > 0;
  const unit = useMemo(
    () => unitPriceForQuantity(tiers, qty, basePrice),
    [tiers, qty, basePrice]
  );
  const lineTotal = unit * qty;

  if (!hasPrice) {
    return (
      <div className="mt-6">
        <p className="text-lg font-semibold text-zinc-600">Request pricing</p>
        <p className="mt-2 text-sm text-zinc-500">CSR will confirm availability and pricing.</p>
      </div>
    );
  }

  return (
    <div className="mt-6 space-y-4">
      <p className="text-2xl font-semibold text-emerald-900">{formatMoney(currency, unit)}</p>
      {tiers.length > 1 && (
        <p className="text-xs text-zinc-500">Price per unit updates from the quantity you choose.</p>
      )}

      {tiers.length > 0 && (
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
                <span className="font-medium text-emerald-900 tabular-nums">{formatMoney(currency, t.price)}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="flex flex-wrap items-center gap-3">
        <span className="text-sm text-zinc-600">Qty</span>
        <QtyStepper value={qty} onChange={setQty} disabled={disabled} />
        <button
          type="button"
          disabled={disabled}
          onClick={() => {
            addLine({
              slug,
              title,
              unitPrice: unit,
              quantity: qty,
              currency,
              priceTiers: tiers.length ? tiers : undefined,
            });
            setMsg("Added to cart");
            setTimeout(() => setMsg(null), 2000);
          }}
          className="rounded-full bg-emerald-800 px-6 py-2.5 text-sm font-semibold text-white shadow hover:bg-emerald-900 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Add to cart
        </button>
        {msg && <span className="text-sm text-emerald-800">{msg}</span>}
      </div>

      {qty > 1 && (
        <p className="text-sm text-zinc-600">
          {qty} × {formatMoney(currency, unit)} ={" "}
          <span className="font-semibold text-emerald-900">{formatMoney(currency, lineTotal)}</span>
        </p>
      )}
    </div>
  );
}
