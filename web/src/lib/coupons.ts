import type { SupabaseClient } from "@supabase/supabase-js";

export type CouponRow = {
  id: string;
  code: string;
  description: string | null;
  discount_type: "percent" | "fixed";
  discount_value: number;
  min_order_amount: number | null;
  max_uses: number | null;
  used_count: number;
  expires_at: string | null;
  is_active: boolean;
  created_at: string;
};

export type AppliedCoupon = {
  id: string;
  code: string;
  discountAmount: number;
  label: string;
};

export type CouponValidationResult =
  | { ok: true; coupon: AppliedCoupon }
  | { ok: false; message: string };

/**
 * Validate a coupon code against a given subtotal.
 * Uses service client so it can read coupons regardless of RLS.
 */
export async function validateCouponCode(
  supabase: SupabaseClient,
  code: string,
  subtotalUsd: number
): Promise<CouponValidationResult> {
  const { data, error } = await supabase
    .from("coupons")
    .select("*")
    .eq("is_active", true)
    .ilike("code", code.trim())
    .single();

  if (error || !data) {
    return { ok: false, message: "Coupon code not found or no longer valid." };
  }

  const coupon = data as CouponRow;

  if (coupon.expires_at && new Date(coupon.expires_at) < new Date()) {
    return { ok: false, message: "This coupon has expired." };
  }

  if (coupon.max_uses !== null && coupon.used_count >= coupon.max_uses) {
    return { ok: false, message: "This coupon has reached its usage limit." };
  }

  const min = Number(coupon.min_order_amount ?? 0);
  if (subtotalUsd < min) {
    return {
      ok: false,
      message: `This coupon requires a minimum order of $${min.toFixed(2)}.`,
    };
  }

  let discountAmount: number;
  let label: string;

  if (coupon.discount_type === "percent") {
    discountAmount = Math.min(subtotalUsd * (Number(coupon.discount_value) / 100), subtotalUsd);
    label = `Coupon ${coupon.code.toUpperCase()} (${Number(coupon.discount_value)}% off)`;
  } else {
    discountAmount = Math.min(Number(coupon.discount_value), subtotalUsd);
    label = `Coupon ${coupon.code.toUpperCase()} ($${Number(coupon.discount_value).toFixed(2)} off)`;
  }

  discountAmount = Math.round(discountAmount * 100) / 100;

  return {
    ok: true,
    coupon: {
      id: coupon.id,
      code: coupon.code.toUpperCase(),
      discountAmount,
      label,
    },
  };
}
