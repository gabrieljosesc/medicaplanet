"use server";

import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/admin";
import { parsePriceTiersJson, unitPriceForQuantity } from "@/lib/price-tiers";

const checkoutSchema = z.object({
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  company: z.string().optional(),
  email: z.string().email(),
  phone: z.string().min(3),
  recipientName: z.string().min(2),
  line1: z.string().min(2),
  line2: z.string().optional(),
  city: z.string().min(1),
  state: z.string().min(1),
  postalCode: z.string().min(2),
  country: z.string().min(2),
  customerNotes: z.string().optional(),
  paymentNotes: z.string().optional(),
  doctorName: z.string().min(1),
  doctorLicenseNumber: z.string().min(1),
  doctorLicenseExpiry: z.string().min(1),
  policyAccepted: z.boolean().refine((v) => v === true, {
    message: "Policy acknowledgement is required.",
  }),
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
    recipientName: input.recipientName,
    phone: input.phone,
    line1: input.line1,
    line2: input.line2 ?? "",
    city: input.city,
    state: input.state,
    postalCode: input.postalCode,
    country: input.country,
  };
  /** Same physical address as shipping; license + company kept here for CSR records. */
  const billing_address = {
    line1: input.line1,
    city: input.city,
    state: input.state,
    postalCode: input.postalCode,
    country: input.country,
    company: input.company ?? "",
    recipientName: input.recipientName,
    phone: input.phone,
    doctorName: input.doctorName,
    doctorLicenseNumber: input.doctorLicenseNumber,
    doctorLicenseExpiry: input.doctorLicenseExpiry,
  };
  const fullName = `${input.firstName} ${input.lastName}`.trim();

  const baseOrderInsert = {
    user_id: user.id,
    email: input.email,
    full_name: fullName,
    phone: input.phone ?? null,
    shipping_address,
    billing_address: billing_address,
    payment_notes: input.paymentNotes ?? null,
    customer_notes: input.customerNotes ?? null,
    status: "pending_csr" as const,
    subtotal,
  };

  const withPolicy = {
    ...baseOrderInsert,
    policy_acknowledged_at: new Date().toISOString(),
    policy_acknowledgement: {
      source: "checkout",
      terms_version: "2026-04",
      shipping_cold_chain_version: "2026-04",
      returns_cancellations_version: "2026-04",
    },
  };

  let order:
    | {
        id: string;
      }
    | null = null;
  let oErr: { message?: string; code?: string } | null = null;

  // Preferred insert with policy audit fields.
  {
    const res = await svc.from("orders").insert(withPolicy).select("id").single();
    order = res.data;
    oErr = res.error;
  }

  // Backward-compatible fallback for databases that have not applied the migration yet.
  if (!order && oErr) {
    const msg = String(oErr.message ?? "");
    const missingPolicyColumns =
      msg.includes("policy_acknowledged_at") || msg.includes("policy_acknowledgement");
    if (missingPolicyColumns) {
      const retry = await svc.from("orders").insert(baseOrderInsert).select("id").single();
      order = retry.data;
      oErr = retry.error;
    }
  }

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
