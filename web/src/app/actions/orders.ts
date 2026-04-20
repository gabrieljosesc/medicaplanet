"use server";

import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/admin";
import { parsePriceTiersJson, unitPriceForQuantity } from "@/lib/price-tiers";

const checkoutSchema = z.object({
  email: z.string().email(),
  fullName: z.string().min(2),
  phone: z.string().optional(),
  line1: z.string().min(2),
  line2: z.string().optional(),
  city: z.string().min(1),
  state: z.string().min(1),
  postalCode: z.string().min(2),
  country: z.string().min(2),
  customerNotes: z.string().optional(),
  paymentNotes: z.string().optional(),
  items: z
    .array(
      z.object({
        slug: z.string(),
        quantity: z.number().int().positive(),
      })
    )
    .min(1),
});

export type CheckoutResult =
  | { ok: true; orderId: string }
  | { ok: false; message: string };

export async function submitOrder(
  raw: z.infer<typeof checkoutSchema>
): Promise<CheckoutResult> {
  const parsed = checkoutSchema.safeParse(raw);
  if (!parsed.success) {
    return { ok: false, message: "Please check the form fields." };
  }
  const input = parsed.data;
  const svc = createServiceClient();
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { ok: false, message: "You must be signed in to place an order. Register or sign in first." };
  }

  const slugs = input.items.map((i) => i.slug);
  const { data: products, error: pErr } = await svc
    .from("products")
    .select("id, slug, title, base_price, currency, price_tiers, is_active")
    .in("slug", slugs);
  if (pErr || !products?.length) {
    return { ok: false, message: "Could not load products for checkout." };
  }
  const bySlug = Object.fromEntries(products.map((p) => [p.slug, p]));
  let subtotal = 0;
  const lines: {
    product_id: string | null;
    title: string;
    quantity: number;
    unit_price: number;
  }[] = [];

  for (const it of input.items) {
    const p = bySlug[it.slug];
    if (!p || !p.is_active) {
      return { ok: false, message: `Unavailable product: ${it.slug}` };
    }
    const qty = it.quantity;
    const tiers = parsePriceTiersJson(p.price_tiers);
    const base = Number(p.base_price);
    const unit = tiers.length ? unitPriceForQuantity(tiers, qty, base) : base;
    subtotal += unit * qty;
    lines.push({
      product_id: p.id,
      title: p.title,
      quantity: qty,
      unit_price: unit,
    });
  }

  const shipping_address = {
    line1: input.line1,
    line2: input.line2 ?? "",
    city: input.city,
    state: input.state,
    postalCode: input.postalCode,
    country: input.country,
  };

  const { data: order, error: oErr } = await svc
    .from("orders")
    .insert({
      user_id: user.id,
      email: input.email,
      full_name: input.fullName,
      phone: input.phone ?? null,
      shipping_address,
      billing_address: shipping_address,
      payment_notes: input.paymentNotes ?? null,
      customer_notes: input.customerNotes ?? null,
      status: "pending_csr",
      subtotal,
    })
    .select("id")
    .single();

  if (oErr || !order) {
    return { ok: false, message: oErr?.message ?? "Order failed." };
  }

  const { error: iErr } = await svc.from("order_items").insert(
    lines.map((l) => ({
      order_id: order.id,
      product_id: l.product_id,
      title: l.title,
      quantity: l.quantity,
      unit_price: l.unit_price,
    }))
  );
  if (iErr) {
    return { ok: false, message: iErr.message };
  }
  return { ok: true, orderId: order.id };
}
