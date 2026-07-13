import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { updateOrderAction } from "@/app/actions/admin";
import { decryptCardPan, decryptCardCvv } from "@/lib/payment-card-crypto";
import { displayOrderReference } from "@/lib/order-reference";
import { OrderItemsEditor } from "./order-items-editor";
import { RequestPaymentUpdateButton } from "./request-payment-update-button";

type Props = { params: Promise<{ id: string }>; searchParams: Promise<{ saved?: string; error?: string }> };

type ShippingAddr = {
  recipientName?: string;
  company?: string;
  phone?: string;
  line1?: string;
  line2?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  country?: string;
};

type BillingAddr = ShippingAddr & {
  doctorName?: string;
  doctorLicenseNumber?: string;
  doctorLicenseExpiry?: string;
};

function formatAddress(addr: ShippingAddr | null | undefined): string {
  if (!addr) return "—";
  return [
    addr.company,
    addr.recipientName,
    addr.line1,
    addr.line2,
    [addr.city, addr.state, addr.postalCode].filter(Boolean).join(", "),
    addr.country,
  ]
    .filter(Boolean)
    .join("\n");
}

function statusLabel(s: string) {
  switch (s) {
    case "pending_csr": return "Pending review";
    case "confirmed": return "Confirmed";
    case "shipped": return "Shipped";
    case "cancelled": return "Cancelled";
    default: return s;
  }
}

function statusColor(s: string) {
  switch (s) {
    case "pending_csr": return "bg-amber-100 text-amber-800";
    case "confirmed": return "bg-teal-100 text-teal-800";
    case "shipped": return "bg-blue-100 text-blue-800";
    case "cancelled": return "bg-red-100 text-red-700";
    default: return "bg-zinc-100 text-zinc-700";
  }
}

export default async function AdminOrderDetailPage({ params, searchParams }: Props) {
  const { id } = await params;
  const sp = await searchParams;
  const supabase = await createClient();
  const { data: order } = await supabase
    .from("orders")
    .select("*, order_items(*)")
    .eq("id", id)
    .single();
  if (!order) notFound();

  const items = Array.isArray(order.order_items) ? order.order_items : [];
  const paySnap = order.payment_card_snapshot as Record<string, unknown> | null;
  const shipping = order.shipping_address as ShippingAddr | null;
  const billing = order.billing_address as BillingAddr | null;
  const ref = displayOrderReference(order);

  return (
    <div className="max-w-3xl">
      <Link href="/admin/orders" className="text-sm text-teal-800 hover:underline">← Orders</Link>

      <div className="mt-4 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-zinc-900">Order {ref}</h1>
          <p className="mt-0.5 text-xs text-zinc-400 font-mono">{order.id}</p>
        </div>
        <span className={`rounded-full px-3 py-1 text-xs font-semibold ${statusColor(order.status)}`}>
          {statusLabel(order.status)}
        </span>
      </div>

      {sp.saved ? (
        <p className="mt-3 rounded-lg border border-teal-200 bg-teal-50 px-3 py-2 text-sm text-teal-800">Order updated.</p>
      ) : null}
      {sp.error ? (
        <p className="mt-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{decodeURIComponent(sp.error)}</p>
      ) : null}

      <div className="mt-6 grid gap-4 sm:grid-cols-2">

        {/* Customer info */}
        <section className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm">
          <h2 className="text-xs font-semibold uppercase tracking-wide text-zinc-500">Customer</h2>
          <p className="mt-2 font-semibold text-zinc-900">{order.full_name || "—"}</p>
          <p className="text-sm text-zinc-600">{order.email}</p>
          {order.phone && <p className="text-sm text-zinc-600">{order.phone}</p>}
          {billing?.company && <p className="text-sm text-zinc-500">Company: {billing.company}</p>}
          <p className="mt-1 text-xs text-zinc-400">
            Placed: {new Date(order.created_at).toLocaleString()}
          </p>
        </section>

        {/* Medical license — PROMINENT */}
        <section className="rounded-xl border border-teal-200 bg-teal-50 p-4 shadow-sm">
          <h2 className="text-xs font-semibold uppercase tracking-wide text-teal-700">Medical License</h2>
          <div className="mt-2 space-y-1 text-sm">
            <p><span className="font-medium text-zinc-700">Doctor / Prescriber:</span>{" "}
              <span className="text-zinc-900">{billing?.doctorName || "—"}</span>
            </p>
            <p><span className="font-medium text-zinc-700">License #:</span>{" "}
              <span className="font-mono text-zinc-900">{billing?.doctorLicenseNumber || "—"}</span>
            </p>
            <p><span className="font-medium text-zinc-700">Expiry:</span>{" "}
              <span className="text-zinc-900">{billing?.doctorLicenseExpiry || "—"}</span>
            </p>
          </div>
        </section>

        {/* Shipping address */}
        <section className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm">
          <h2 className="text-xs font-semibold uppercase tracking-wide text-zinc-500">Shipping Address</h2>
          <address className="mt-2 not-italic text-sm text-zinc-700 whitespace-pre-line leading-relaxed">
            {formatAddress(shipping)}
          </address>
        </section>

        {/* Payment card */}
        <section className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm">
          <h2 className="text-xs font-semibold uppercase tracking-wide text-zinc-500">Payment Card</h2>
          {paySnap && Object.keys(paySnap).length > 0 ? (
            <div className="mt-2 space-y-1 text-sm">
              <p className="font-semibold text-zinc-900">
                {String(paySnap.brand ?? "Card").toUpperCase()} ···· {String(paySnap.last4 ?? "????")}
                {paySnap.exp_month && paySnap.exp_year
                  ? `  exp ${String(paySnap.exp_month).padStart(2, "0")}/${String(paySnap.exp_year).slice(-2)}`
                  : ""}
              </p>
              {typeof paySnap.name_on_card === "string" && paySnap.name_on_card ? (
                <p className="text-zinc-600">Name: {paySnap.name_on_card}</p>
              ) : null}
              {paySnap.source === "manual_encrypted" && typeof paySnap.pan_encrypted === "string" ? (
                <p className="mt-1 font-mono text-xs text-zinc-800 break-all">
                  Full card #:{" "}
                  {(() => {
                    try { return decryptCardPan(paySnap.pan_encrypted as string); }
                    catch { return "Could not decrypt — check PAYMENT_CARD_SECRET env var."; }
                  })()}
                </p>
              ) : null}
              {typeof paySnap.cvv_encrypted === "string" && paySnap.cvv_encrypted ? (
                <p className="mt-1 font-mono text-sm font-semibold text-zinc-900">
                  CVV:{" "}
                  {(() => {
                    try { return decryptCardCvv(paySnap.cvv_encrypted as string); }
                    catch { return "Could not decrypt CVV."; }
                  })()}
                </p>
              ) : (
                <p className="mt-2 text-xs text-amber-700">
                  CVV not captured for this order — customer did not provide it at checkout.
                </p>
              )}
            </div>
          ) : (
            <p className="mt-2 text-sm text-zinc-500">No card snapshot recorded.</p>
          )}
          {typeof paySnap?.updated_by_customer_at === "string" ? (
            <p className="mt-2 text-xs font-medium text-teal-700">
              Card updated by customer on{" "}
              {new Date(paySnap.updated_by_customer_at as string).toLocaleString()}
            </p>
          ) : null}
          {(() => {
            const requestedAt = (order as { payment_update_requested_at?: string | null })
              .payment_update_requested_at;
            return requestedAt ? (
              <p className="mt-2 text-xs text-amber-700">
                Updated payment requested {new Date(requestedAt).toLocaleString()} — waiting on customer.
              </p>
            ) : null;
          })()}
          {order.status !== "cancelled" ? <RequestPaymentUpdateButton orderId={order.id} /> : null}
        </section>

      </div>

      {/* Notes */}
      {(order.customer_notes || order.payment_notes) ? (
        <section className="mt-4 rounded-xl border border-zinc-200 bg-white p-4 shadow-sm">
          <h2 className="text-xs font-semibold uppercase tracking-wide text-zinc-500">Customer Notes</h2>
          {order.customer_notes && <p className="mt-2 text-sm text-zinc-700">{order.customer_notes}</p>}
          {order.payment_notes && (
            <p className="mt-1 text-xs text-zinc-500 whitespace-pre-wrap">{order.payment_notes}</p>
          )}
        </section>
      ) : null}

      {/* Order items (editable) */}
      {(order as { coupon_code?: string | null }).coupon_code ? (
        <p className="mt-4 text-xs text-teal-700">
          Coupon applied: {(order as { coupon_code?: string | null }).coupon_code} (−$
          {Number((order as { discount_amount?: number | null }).discount_amount ?? 0).toFixed(2)})
        </p>
      ) : null}
      <OrderItemsEditor
        orderId={order.id}
        initialItems={items.map((it: { product_id: string | null; title: string; quantity: number; unit_price: number }) => ({
          product_id: it.product_id ?? null,
          title: it.title,
          quantity: Number(it.quantity),
          unit_price: Number(it.unit_price),
        }))}
        initialShipping={Number((order as { shipping_amount?: number | null }).shipping_amount ?? 0)}
        discount={Number((order as { discount_amount?: number | null }).discount_amount ?? 0)}
      />

      {/* Policy ack */}
      <section className="mt-4 rounded-xl border border-zinc-100 bg-zinc-50 p-4 text-xs text-zinc-500">
        <span className="font-medium text-zinc-600">Policy acknowledged: </span>
        {order.policy_acknowledged_at
          ? new Date(order.policy_acknowledged_at).toLocaleString()
          : "not recorded"}
      </section>

      {/* Admin update form */}
      <form action={updateOrderAction} className="mt-6 rounded-xl border border-zinc-200 bg-white p-5 shadow-sm space-y-4">
        <h2 className="text-sm font-semibold text-zinc-900">Update order</h2>
        <input type="hidden" name="id" value={order.id} />
        <div>
          <label className="text-xs font-medium text-zinc-600">Status</label>
          <select name="status" defaultValue={order.status} className="mt-1 w-full rounded-md border border-zinc-300 px-3 py-2 text-sm">
            <option value="pending_csr">Pending review</option>
            <option value="confirmed">Confirmed</option>
            <option value="shipped">Shipped</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
        <div>
          <label className="text-xs font-medium text-zinc-600">Admin notes (internal — not visible to customer)</label>
          <textarea name="admin_notes" rows={3} defaultValue={order.admin_notes ?? ""} className="mt-1 w-full rounded-md border border-zinc-300 px-3 py-2 text-sm" />
        </div>
        <div>
          <label className="text-xs font-medium text-zinc-600">Note to customer (visible on their order page)</label>
          <textarea
            name="customer_visible_note"
            rows={3}
            defaultValue={(order as { customer_visible_note?: string | null }).customer_visible_note ?? ""}
            placeholder="e.g. Your order is being processed, expected dispatch in 2 business days."
            className="mt-1 w-full rounded-md border border-zinc-300 px-3 py-2 text-sm"
          />
        </div>
        <button type="submit" className="rounded-full bg-teal-800 px-6 py-2.5 text-sm font-semibold text-white hover:bg-teal-900">
          Update order
        </button>
      </form>
    </div>
  );
}
