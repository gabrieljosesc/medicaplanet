"use client";

import { useState } from "react";
import { toggleCouponAction, deleteCouponAction } from "@/app/actions/admin";

type Coupon = {
  id: string;
  code: string;
  description: string | null;
  discount_type: string;
  discount_value: number;
  min_order_amount: number | null;
  max_uses: number | null;
  used_count: number;
  expires_at: string | null;
  is_active: boolean;
};

export function CouponRow({ coupon: initial }: { coupon: Coupon }) {
  const [coupon, setCoupon] = useState(initial);
  const [busy, setBusy] = useState(false);

  async function handleToggle() {
    setBusy(true);
    const res = await toggleCouponAction(coupon.id, !coupon.is_active);
    if (res.ok) setCoupon((c) => ({ ...c, is_active: !c.is_active }));
    setBusy(false);
  }

  async function handleDelete() {
    if (!confirm(`Delete coupon "${coupon.code}"? This cannot be undone.`)) return;
    setBusy(true);
    await deleteCouponAction(coupon.id);
  }

  const discountLabel =
    coupon.discount_type === "percent"
      ? `${Number(coupon.discount_value)}% off`
      : `$${Number(coupon.discount_value).toFixed(2)} off`;

  const isExpired = coupon.expires_at ? new Date(coupon.expires_at) < new Date() : false;
  const maxed = coupon.max_uses !== null && coupon.used_count >= coupon.max_uses;

  return (
    <tr className="border-b border-zinc-100 hover:bg-zinc-50">
      <td className="py-2 pr-3">
        <span className="font-mono font-semibold text-zinc-900">{coupon.code}</span>
        {coupon.description ? (
          <p className="text-xs text-zinc-400">{coupon.description}</p>
        ) : null}
      </td>
      <td className="py-2 pr-3 text-zinc-700">{discountLabel}</td>
      <td className="py-2 pr-3 text-zinc-500">
        {Number(coupon.min_order_amount ?? 0) > 0
          ? `$${Number(coupon.min_order_amount).toFixed(2)}`
          : "—"}
      </td>
      <td className="py-2 pr-3 text-zinc-500">
        {coupon.used_count}
        {coupon.max_uses !== null ? ` / ${coupon.max_uses}` : ""}
        {maxed ? <span className="ml-1 text-xs text-amber-600">(limit reached)</span> : null}
      </td>
      <td className="py-2 pr-3 text-xs text-zinc-500">
        {coupon.expires_at ? (
          <span className={isExpired ? "text-red-600" : ""}>
            {new Date(coupon.expires_at).toLocaleDateString()}
            {isExpired ? " (expired)" : ""}
          </span>
        ) : (
          "Never"
        )}
      </td>
      <td className="py-2 pr-3">
        {coupon.is_active && !isExpired && !maxed ? (
          <span className="rounded-full bg-teal-100 px-2 py-0.5 text-xs font-medium text-teal-800">
            Active
          </span>
        ) : (
          <span className="rounded-full bg-zinc-100 px-2 py-0.5 text-xs font-medium text-zinc-500">
            Inactive
          </span>
        )}
      </td>
      <td className="py-2">
        <div className="flex gap-2">
          <button
            onClick={handleToggle}
            disabled={busy}
            className="rounded-md border border-zinc-300 px-2 py-1 text-xs text-zinc-700 hover:bg-zinc-100 disabled:opacity-50"
          >
            {coupon.is_active ? "Deactivate" : "Activate"}
          </button>
          <button
            onClick={handleDelete}
            disabled={busy}
            className="rounded-md border border-red-200 px-2 py-1 text-xs text-red-600 hover:bg-red-50 disabled:opacity-50"
          >
            Delete
          </button>
        </div>
      </td>
    </tr>
  );
}
