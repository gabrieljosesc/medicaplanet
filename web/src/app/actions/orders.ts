"use server";

import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/admin";
import { meetsCheckoutMinimumUsd, MIN_CHECKOUT_SUBTOTAL_USD } from "@/lib/cart-minimum";
import { getOrderShippingLine } from "@/lib/checkout-shipping";
import { parsePriceTiersJson, unitPriceForQuantity } from "@/lib/price-tiers";
import { displayOrderReference } from "@/lib/order-reference";
import { sendOrderReceivedEmail, sendAdminNewOrderEmail } from "@/lib/email/order-emails";

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
  checkoutType: z.enum(["saved_manual_card", "bank_transfer"]),
  userSavedCardId: z.string().uuid().optional(),
}).refine(
  (d) => d.checkoutType !== "saved_manual_card" || Boolean(d.userSavedCardId),
  { message: "Select a saved card.", path: ["userSavedCardId"] }
);

function isCardExpired(expMonth: number, expYear: number): boolean {
  const expiryEnd = new Date(expYear, expMonth, 0, 23, 59, 59, 999);
  return expiryEnd < new Date();
}

export type CheckoutResult =
  | { ok: true; orderId: string; orderReference: string }
  | { ok: false; message: string };

const ORDER_INSERT_SELECT = "id, reference_number";

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

  if (input.checkoutType !== "saved_manual_card" || !input.userSavedCardId) {
    return { ok: false, message: "Add a non-expired card on file before placing this order." };
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

  if (!meetsCheckoutMinimumUsd(subtotal)) {
    return {
      ok: false,
      message: `Minimum order is $${MIN_CHECKOUT_SUBTOTAL_USD.toFixed(2)}. Add more items before checking out.`,
    };
  }

  let shippingLine: { amount: number; label: string };
  try {
    shippingLine = await getOrderShippingLine(svc, user.id);
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Could not determine shipping.";
    return { ok: false, message: msg };
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
  /** Same physical address as shipping; license + company kept for order review records. */
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

  let paymentCardSnapshot: {
    source: "manual_encrypted";
    saved_card_id: string;
    brand: string | null;
    last4: string;
    exp_month: number;
    exp_year: number;
    name_on_card: string;
    pan_encrypted: string;
  } | null = null;

  if (input.checkoutType === "saved_manual_card") {
    const { data: card, error: cardErr } = await supabase
      .from("user_saved_cards")
      .select("id, brand, last4, exp_month, exp_year, name_on_card, pan_encrypted")
      .eq("id", input.userSavedCardId as string)
      .eq("user_id", user.id)
      .single();
    if (cardErr || !card) {
      return {
        ok: false,
        message: "Invalid or missing saved card. Add a valid card under Banks & cards.",
      };
    }
    if (isCardExpired(card.exp_month, card.exp_year)) {
      return { ok: false, message: "Your saved card has expired. Please add or select a non-expired card." };
    }
    paymentCardSnapshot = {
      source: "manual_encrypted",
      saved_card_id: card.id,
      brand: card.brand,
      last4: card.last4,
      exp_month: card.exp_month,
      exp_year: card.exp_year,
      name_on_card: card.name_on_card,
      pan_encrypted: card.pan_encrypted,
    };
  }

  const paymentHeader =
    input.checkoutType === "saved_manual_card" && paymentCardSnapshot
      ? `Payment: saved card · ${paymentCardSnapshot.brand ?? "card"} ····${paymentCardSnapshot.last4} · ${paymentCardSnapshot.name_on_card}\n`
      : "Payment: direct bank transfer (transfer instructions sent after order review)\n";
  const mergedPaymentNotes = `${paymentHeader}${input.paymentNotes ?? ""}`.trim() || null;

  const baseOrderInsert = {
    user_id: user.id,
    email: input.email,
    full_name: fullName,
    phone: input.phone ?? null,
    shipping_address,
    billing_address: billing_address,
    payment_notes: mergedPaymentNotes,
    customer_notes: input.customerNotes ?? null,
    status: "pending_csr" as const,
    subtotal,
    shipping_amount: shippingLine.amount,
    shipping_label: shippingLine.label,
    payment_card_snapshot: paymentCardSnapshot,
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
        reference_number?: string | null;
      }
    | null = null;
  let oErr: { message?: string; code?: string } | null = null;

  // Preferred insert with policy audit fields.
  {
    const res = await svc.from("orders").insert(withPolicy).select(ORDER_INSERT_SELECT).single();
    order = res.data;
    oErr = res.error;
  }

  // Backward-compatible fallback for databases that have not applied the migration yet.
  if (!order && oErr) {
    const msg = String(oErr.message ?? "");
    const missingPolicyColumns =
      msg.includes("policy_acknowledged_at") || msg.includes("policy_acknowledgement");
    if (missingPolicyColumns) {
      const retry = await svc.from("orders").insert(baseOrderInsert).select(ORDER_INSERT_SELECT).single();
      order = retry.data;
      oErr = retry.error;
    }
  }
  if (!order && oErr) {
    const msg = String(oErr.message ?? "");
    if (msg.includes("payment_card_snapshot")) {
      const noCardCols = {
        user_id: user.id,
        email: input.email,
        full_name: fullName,
        phone: input.phone ?? null,
        shipping_address,
        billing_address,
        payment_notes: mergedPaymentNotes,
        customer_notes: input.customerNotes ?? null,
        status: "pending_csr" as const,
        subtotal,
        shipping_amount: shippingLine.amount,
        shipping_label: shippingLine.label,
        policy_acknowledged_at: withPolicy.policy_acknowledged_at,
        policy_acknowledgement: withPolicy.policy_acknowledgement,
      };
      const res = await svc.from("orders").insert(noCardCols).select(ORDER_INSERT_SELECT).single();
      order = res.data;
      oErr = res.error;
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

  const orderEmailPayload = {
    id: order.id,
    reference_number: order.reference_number,
    email: input.email,
    full_name: fullName,
    status: "pending_csr" as const,
    subtotal,
    shipping_amount: shippingLine.amount,
    shipping_label: shippingLine.label,
    order_items: lines.map((l) => ({
      title: l.title,
      quantity: l.quantity,
      unit_price: l.unit_price,
    })),
  };

  void sendOrderReceivedEmail(orderEmailPayload).catch((err) =>
    console.error("[email] order received:", err)
  );
  void sendAdminNewOrderEmail(orderEmailPayload).catch((err) =>
    console.error("[email] admin new order:", err)
  );

  return {
    ok: true,
    orderId: order.id,
    orderReference: displayOrderReference(order),
  };
}
