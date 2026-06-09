import "server-only";

import { orderGrandTotal } from "@/lib/checkout-shipping";
import { displayOrderReference } from "@/lib/order-reference";
import { emailHeaderHtml } from "@/lib/email/email-branding";
import { SITE_EMAIL, SITE_PHONE_DISPLAY, SITE_PUBLIC_URL } from "@/lib/site-constants";
import { sendTransactionalEmail } from "@/lib/email/resend";

export type OrderStatus = "pending_csr" | "confirmed" | "shipped" | "cancelled";

export type OrderEmailRow = {
  id: string;
  reference_number?: string | null;
  email: string;
  full_name: string;
  status: OrderStatus;
  subtotal: number | string;
  shipping_amount?: number | string | null;
  shipping_label?: string | null;
  order_items?: { title: string; quantity: number; unit_price: number | string }[] | null;
};

function orderRef(order: OrderEmailRow): string {
  return displayOrderReference(order);
}

function orderTotal(order: OrderEmailRow): number {
  return orderGrandTotal(
    Number(order.subtotal),
    Number(order.shipping_amount ?? 0)
  );
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function emailLayout(bodyHtml: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width"></head>
<body style="margin:0;padding:0;background:#f4f4f5;font-family:system-ui,-apple-system,Segoe UI,Roboto,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f5;padding:24px 12px;">
    <tr><td align="center">
      <table width="100%" style="max-width:520px;background:#fff;border-radius:12px;border:1px solid #e4e4e7;overflow:hidden;">
        <tr><td>${emailHeaderHtml()}</td></tr>
        <tr><td style="padding:24px;color:#18181b;font-size:15px;line-height:1.55;">${bodyHtml}</td></tr>
        <tr><td style="padding:16px 24px 24px;border-top:1px solid #e4e4e7;font-size:12px;color:#71717a;line-height:1.5;">
          Questions? <a href="mailto:${SITE_EMAIL}" style="color:#0f766e;">${SITE_EMAIL}</a> · ${SITE_PHONE_DISPLAY}<br>
          <a href="${SITE_PUBLIC_URL}" style="color:#0f766e;">${SITE_PUBLIC_URL}</a>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body></html>`;
}

function itemSummaryHtml(order: OrderEmailRow): string {
  const items = Array.isArray(order.order_items) ? order.order_items : [];
  if (!items.length) return "";
  const rows = items
    .map(
      (it) =>
        `<tr>
          <td style="padding:6px 0;border-bottom:1px solid #f4f4f5;">${escapeHtml(it.title)} × ${it.quantity}</td>
          <td style="padding:6px 0;border-bottom:1px solid #f4f4f5;text-align:right;">$${(Number(it.unit_price) * it.quantity).toFixed(2)}</td>
        </tr>`
    )
    .join("");
  return `<table width="100%" cellpadding="0" cellspacing="0" style="margin:16px 0;font-size:14px;">${rows}</table>`;
}

function orderMetaHtml(order: OrderEmailRow): string {
  const ref = escapeHtml(orderRef(order));
  const total = orderTotal(order).toFixed(2);
  return `<p style="margin:0 0 8px;"><strong>Reference:</strong> ${ref}</p>
    <p style="margin:0 0 8px;"><strong>Order total:</strong> $${total}</p>`;
}

/** Matches checkout success page — sent immediately after order is placed. */
export async function sendOrderReceivedEmail(order: OrderEmailRow): Promise<void> {
  const ref = orderRef(order);
  const name = escapeHtml(order.full_name.trim() || "there");

  const text = [
    `Hi ${order.full_name.trim() || "there"},`,
    "",
    "Thank you! Your order is being processed.",
    "You'll receive another email when your order is confirmed.",
    "",
    `Reference: ${ref}`,
    "",
    `Order total: $${orderTotal(order).toFixed(2)}`,
    "",
    `— MedicaPlanet · ${SITE_EMAIL}`,
  ].join("\n");

  const html = emailLayout(`
    <p style="margin:0 0 16px;">Hi ${name},</p>
    <p style="margin:0 0 12px;">Thank you! Your order is being processed.</p>
    <p style="margin:0 0 20px;">You&apos;ll receive another email when your order is confirmed.</p>
    ${orderMetaHtml(order)}
    ${itemSummaryHtml(order)}
    <p style="margin:20px 0 0;font-size:14px;color:#52525b;">
      You can view this order anytime after signing in at
      <a href="${SITE_PUBLIC_URL}/account/purchases" style="color:#0f766e;">My purchases</a>.
    </p>
  `);

  await sendTransactionalEmail({
    to: order.email,
    subject: `Order received — ${ref}`,
    html,
    text,
  });
}

/** Sent when admin sets status to confirmed. */
export async function sendOrderConfirmedEmail(order: OrderEmailRow): Promise<void> {
  const ref = orderRef(order);
  const name = escapeHtml(order.full_name.trim() || "there");

  const text = [
    `Hi ${order.full_name.trim() || "there"},`,
    "",
    "Your order is successful and your items are being prepared for shipment.",
    "Shipping status notifications will be sent to this email when your order ships.",
    "",
    `Reference: ${ref}`,
    `Order total: $${orderTotal(order).toFixed(2)}`,
    "",
    `— MedicaPlanet · ${SITE_EMAIL}`,
  ].join("\n");

  const html = emailLayout(`
    <p style="margin:0 0 16px;">Hi ${name},</p>
    <p style="margin:0 0 12px;"><strong>Your order is confirmed.</strong></p>
    <p style="margin:0 0 12px;">Your order is successful and your items are being prepared for shipment.</p>
    <p style="margin:0 0 20px;">Shipping status notifications will be sent to this email when your order ships.</p>
    ${orderMetaHtml(order)}
    ${itemSummaryHtml(order)}
  `);

  await sendTransactionalEmail({
    to: order.email,
    subject: `Order confirmed — ${ref}`,
    html,
    text,
  });
}

/** Sent when admin sets status to shipped. */
export async function sendOrderShippedEmail(order: OrderEmailRow): Promise<void> {
  const ref = orderRef(order);
  const name = escapeHtml(order.full_name.trim() || "there");

  const text = [
    `Hi ${order.full_name.trim() || "there"},`,
    "",
    "Your order has shipped and is on its way to you.",
    "If tracking details are available, we will send them in a separate message.",
    "",
    `Reference: ${ref}`,
    "",
    `— MedicaPlanet · ${SITE_EMAIL}`,
  ].join("\n");

  const html = emailLayout(`
    <p style="margin:0 0 16px;">Hi ${name},</p>
    <p style="margin:0 0 12px;"><strong>Your order has shipped.</strong></p>
    <p style="margin:0 0 12px;">Your goods are on the way to you.</p>
    <p style="margin:0 0 20px;">Shipping status updates will continue to be sent to this email when available.</p>
    ${orderMetaHtml(order)}
  `);

  await sendTransactionalEmail({
    to: order.email,
    subject: `Order shipped — ${ref}`,
    html,
    text,
  });
}

/** Sent when admin sets status to cancelled. */
export async function sendOrderCancelledEmail(order: OrderEmailRow): Promise<void> {
  const ref = orderRef(order);
  const name = escapeHtml(order.full_name.trim() || "there");

  const text = [
    `Hi ${order.full_name.trim() || "there"},`,
    "",
    "Your order has been cancelled.",
    "If you have questions or believe this was in error, please contact us.",
    "",
    `Reference: ${ref}`,
    "",
    `— MedicaPlanet · ${SITE_EMAIL} · ${SITE_PHONE_DISPLAY}`,
  ].join("\n");

  const html = emailLayout(`
    <p style="margin:0 0 16px;">Hi ${name},</p>
    <p style="margin:0 0 12px;"><strong>Your order has been cancelled.</strong></p>
    <p style="margin:0 0 20px;">If you have questions or believe this was in error, please reply to this email or contact our team.</p>
    ${orderMetaHtml(order)}
  `);

  await sendTransactionalEmail({
    to: order.email,
    subject: `Order cancelled — ${ref}`,
    html,
    text,
  });
}

/** Internal alert sent to the site admin email whenever a new order is placed. */
export async function sendAdminNewOrderEmail(order: OrderEmailRow): Promise<void> {
  const ref = orderRef(order);
  const total = orderTotal(order).toFixed(2);
  const items = Array.isArray(order.order_items) ? order.order_items : [];
  const itemLines = items
    .map((it) => `  • ${it.title} × ${it.quantity}  $${(Number(it.unit_price) * it.quantity).toFixed(2)}`)
    .join("\n");

  const adminUrl = `${SITE_PUBLIC_URL}/admin/orders/${order.id}`;

  const text = [
    `New order received — ${ref}`,
    "",
    `Customer: ${order.full_name} <${order.email}>`,
    `Reference: ${ref}`,
    `Total: $${total}`,
    "",
    "Items:",
    itemLines,
    "",
    `Review: ${adminUrl}`,
  ].join("\n");

  const itemRowsHtml = items
    .map(
      (it) =>
        `<tr>
          <td style="padding:5px 0;border-bottom:1px solid #f4f4f5;">${escapeHtml(it.title)} × ${it.quantity}</td>
          <td style="padding:5px 0;border-bottom:1px solid #f4f4f5;text-align:right;">$${(Number(it.unit_price) * it.quantity).toFixed(2)}</td>
        </tr>`
    )
    .join("");

  const html = emailLayout(`
    <p style="margin:0 0 16px;font-size:17px;font-weight:600;">New order received</p>
    <p style="margin:0 0 8px;"><strong>Customer:</strong> ${escapeHtml(order.full_name)} &lt;${escapeHtml(order.email)}&gt;</p>
    <p style="margin:0 0 8px;"><strong>Reference:</strong> ${escapeHtml(ref)}</p>
    <p style="margin:0 0 16px;"><strong>Total:</strong> $${total}</p>
    ${itemRowsHtml ? `<table width="100%" cellpadding="0" cellspacing="0" style="font-size:14px;margin-bottom:16px;">${itemRowsHtml}</table>` : ""}
    <a href="${adminUrl}" style="display:inline-block;background:#0f766e;color:#fff;padding:10px 20px;border-radius:8px;text-decoration:none;font-weight:600;font-size:14px;">
      Review order in admin
    </a>
  `);

  // ADMIN_NOTIFY_EMAILS: comma-separated extra inboxes, e.g. "joe@example.com,jane@example.com"
  const extraEmails = (process.env.ADMIN_NOTIFY_EMAILS ?? "")
    .split(",")
    .map((e) => e.trim())
    .filter(Boolean);
  const recipients = [SITE_EMAIL, ...extraEmails];

  await sendTransactionalEmail({
    to: recipients,
    subject: `New order — ${ref} · ${order.full_name}`,
    html,
    text,
  });
}

export async function sendOrderStatusEmail(
  order: OrderEmailRow,
  previousStatus: OrderStatus,
  newStatus: OrderStatus
): Promise<void> {
  if (previousStatus === newStatus) return;

  switch (newStatus) {
    case "confirmed":
      await sendOrderConfirmedEmail(order);
      break;
    case "shipped":
      await sendOrderShippedEmail(order);
      break;
    case "cancelled":
      await sendOrderCancelledEmail(order);
      break;
    case "pending_csr":
      break;
  }
}
