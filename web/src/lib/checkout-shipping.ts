import type { SupabaseClient } from "@supabase/supabase-js";

/** Flat shipping for returning customers (USD). */
export const PRIORITY_SHIPPING_USD = 50;

export type OrderShippingLine = {
  amount: number;
  label: string;
  isFirstOrder: boolean;
};

/**
 * First order in the system for this user ships free ($0).
 * We only count non-cancelled orders so a cancelled attempt does not consume the promo.
 * Later orders add flat Priority Shipping (see PRIORITY_SHIPPING_USD).
 */
export async function getOrderShippingLine(
  supabase: SupabaseClient,
  userId: string
): Promise<OrderShippingLine> {
  const { count, error } = await supabase
    .from("orders")
    .select("id", { count: "exact", head: true })
    .eq("user_id", userId)
    .in("status", ["pending_csr", "confirmed", "shipped"]);

  if (error) {
    throw new Error(error.message);
  }

  const prior = count ?? 0;
  if (prior === 0) {
    return {
      amount: 0,
      label: "Complimentary shipping (first order)",
      isFirstOrder: true,
    };
  }

  return {
    amount: PRIORITY_SHIPPING_USD,
    label: "Priority Shipping",
    isFirstOrder: false,
  };
}

export function orderGrandTotal(subtotal: number, shippingAmount: number): number {
  return Number(subtotal) + Number(shippingAmount);
}
