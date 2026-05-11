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
    <div className={`mx-auto w-full max-w-xs px-1 ${className}`}>
      <div
        className="h-2 w-full overflow-hidden rounded-full bg-zinc-200"
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
          className="h-full rounded-full bg-teal-700 transition-[width] duration-300 ease-out"
          style={{ width: `${pct}%` }}
        />
      </div>
      <p className="mt-2 text-center text-xs leading-snug text-zinc-600">
        {met ? (
          <>
            Minimum order of{" "}
            <span className="font-semibold text-teal-900">{formatMoney(currency, min)}</span> reached. You can
            proceed to checkout.
          </>
        ) : (
          <>
            Add{" "}
            <span className="font-semibold text-teal-900">{formatMoney(currency, remaining)}</span> more to place
            your order{" "}
            <span className="text-zinc-500">(minimum {formatMoney(currency, min)})</span>
          </>
        )}
      </p>
    </div>
  );
}
