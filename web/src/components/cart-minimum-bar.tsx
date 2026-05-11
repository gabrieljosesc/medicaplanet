"use client";

import { meetsCheckoutMinimumUsd, MIN_CHECKOUT_SUBTOTAL_USD } from "@/lib/cart-minimum";
import { formatMoney } from "@/lib/price-tiers";

type Props = {
  /** Selected-line subtotal used toward the minimum (same basis as checkout). */
  amountUsd: number;
  currency?: string;
  className?: string;
};

export function CartMinimumBar({ amountUsd, currency = "USD", className = "" }: Props) {
  const min = MIN_CHECKOUT_SUBTOTAL_USD;
  const pct = Math.min(100, Math.max(0, (amountUsd / min) * 100));
  const remaining = Math.max(0, min - amountUsd);
  const met = meetsCheckoutMinimumUsd(amountUsd);

  return (
    <div className={`rounded-xl border border-zinc-200 bg-white p-4 shadow-sm ${className}`}>
      <div className="relative flex items-center gap-3">
        <div
          className="h-3 min-w-0 flex-1 overflow-hidden rounded-full bg-zinc-200"
          role="progressbar"
          aria-valuenow={Math.round(pct)}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuetext={
            met
              ? `Minimum order reached (${formatMoney(currency, amountUsd)} of ${formatMoney(currency, min)})`
              : `${formatMoney(currency, amountUsd)} of ${formatMoney(currency, min)} toward minimum order`
          }
        >
          <div
            className="h-full rounded-full bg-orange-500 transition-[width] duration-300 ease-out"
            style={{ width: `${pct}%` }}
          />
        </div>
        <div
          className={`flex size-9 shrink-0 items-center justify-center rounded-full border text-base leading-none ${
            met ? "border-orange-200 bg-orange-50 text-orange-700" : "border-zinc-200 bg-zinc-100 text-zinc-500"
          }`}
          aria-hidden
        >
          👍
        </div>
      </div>
      <p className="mt-3 text-center text-sm leading-snug text-zinc-700">
        {met ? (
          <>
            Minimum order of {formatMoney(currency, min)} reached. You can proceed to checkout.
          </>
        ) : (
          <>
            Add{" "}
            <span className="font-semibold text-zinc-900">{formatMoney(currency, remaining)}</span> more to
            place your order{" "}
            <span className="text-zinc-500">(minimum {formatMoney(currency, min)})</span>
          </>
        )}
      </p>
    </div>
  );
}
