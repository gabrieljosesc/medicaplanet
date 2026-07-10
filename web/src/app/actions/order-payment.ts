"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/admin";
import { digitsOnly, inferBrand, luhnValid, parseExpiryMmYy } from "@/lib/card-validation";
import { encryptCardPan, encryptCardCvv } from "@/lib/payment-card-crypto";
import { sendAdminPaymentUpdatedEmail } from "@/lib/email/order-emails";

export type UpdateOrderPaymentResult = { ok: true } | { ok: false; message: string };

/**
 * Customer-facing: replaces the payment card snapshot on their own order after
 * a payment problem (admin sends them a link via requestPaymentUpdateAction).
 * Ownership is checked through the RLS-scoped client before the service-role
 * update writes the new snapshot.
 */
export async function updateOrderPaymentAction(formData: FormData): Promise<UpdateOrderPaymentResult> {
  const orderId = String(formData.get("order_id") ?? "");
  const pan = digitsOnly(String(formData.get("card_number") ?? ""));
  const nameOnCard = String(formData.get("name_on_card") ?? "").trim();
  const expiry = String(formData.get("expiry") ?? "").trim();
  const cvv = digitsOnly(String(formData.get("cvv") ?? ""));

  if (!luhnValid(pan)) {
    return { ok: false, message: "Please enter a valid card number." };
  }
  if (nameOnCard.length < 2) {
    return { ok: false, message: "Please enter the name on card." };
  }
  const exp = parseExpiryMmYy(expiry);
  if (!exp) {
    return { ok: false, message: "Expiry must be MM/YY (e.g. 08/27)." };
  }
  const expEnd = new Date(exp.year, exp.month, 0, 23, 59, 59, 999);
  if (expEnd < new Date()) {
    return { ok: false, message: "This card appears to be expired." };
  }
  if (cvv.length < 3 || cvv.length > 4) {
    return { ok: false, message: "Please enter the 3–4 digit CVV on your card." };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, message: "You must be signed in." };

  // RLS-scoped read proves the order belongs to this user.
  const { data: order } = await supabase
    .from("orders")
    .select("id, reference_number, email, full_name, status, subtotal, shipping_amount, shipping_label")
    .eq("id", orderId)
    .eq("user_id", user.id)
    .single();
  if (!order) return { ok: false, message: "Order not found." };
  if (order.status === "cancelled") {
    return { ok: false, message: "This order has been cancelled and can no longer be updated." };
  }

  let panEncrypted: string;
  let cvvEncrypted: string;
  try {
    panEncrypted = encryptCardPan(pan);
    cvvEncrypted = encryptCardCvv(cvv);
  } catch {
    return { ok: false, message: "Payment updates are not available right now. Please contact us." };
  }

  const snapshot = {
    source: "manual_encrypted" as const,
    saved_card_id: null,
    brand: inferBrand(pan),
    last4: pan.slice(-4),
    exp_month: exp.month,
    exp_year: exp.year,
    name_on_card: nameOnCard,
    pan_encrypted: panEncrypted,
    cvv_encrypted: cvvEncrypted,
    updated_by_customer_at: new Date().toISOString(),
  };

  const svc = createServiceClient();
  const { error } = await svc
    .from("orders")
    .update({ payment_card_snapshot: snapshot, payment_update_requested_at: null })
    .eq("id", orderId);
  if (error) {
    return { ok: false, message: "Could not save your card. Please try again or contact us." };
  }

  void sendAdminPaymentUpdatedEmail(order).catch((err) =>
    console.error("[email] admin payment updated:", err)
  );

  revalidatePath(`/account/orders/${orderId}`);
  revalidatePath(`/admin/orders/${orderId}`);
  return { ok: true };
}
