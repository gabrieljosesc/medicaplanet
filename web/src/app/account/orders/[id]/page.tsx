import Image from "next/image";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { nextImageUnoptimized } from "@/lib/product-image";
import { resolveOrderItemImage } from "@/lib/order-display";
import { orderGrandTotal } from "@/lib/checkout-shipping";
import { displayOrderReference } from "@/lib/order-reference";

type ImgRow = { url: string; sort_order: number };
type ProductEmbed = { slug: string; product_images?: ImgRow[] | null } | null;
type OrderItemRow = {
  id: string;
  title: string;
  quantity: number;
  unit_price: number;
  products?: ProductEmbed | ProductEmbed[];
};

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

function normalizeProduct(p: ProductEmbed | ProductEmbed[] | undefined): { slug: string; product_images?: ImgRow[] | null } | null {
  if (!p) return null;
  return Array.isArray(p) ? p[0] ?? null : p;
}

function firstRemoteImage(images: ImgRow[] | null | undefined): string | null {
  if (!images?.length) return null;
  return [...images].sort((a, b) => a.sort_order - b.sort_order)[0]?.url ?? null;
}

function formatAddress(addr: ShippingAddr | null | undefined): string {
  if (!addr) return "—";
  return [
    addr.company,
    addr.recipientName,
    addr.line1,
    addr.line2,
    [addr.city, addr.state, addr.postalCode].filter(Boolean).join(", "),
    addr.country,
  ].filter(Boolean).join("\n");
}

function formatStatus(s: string): string {
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

type Props = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ payment_updated?: string }>;
};

export default async function OrderDetailPage({ params, searchParams }: Props) {
  const { id } = await params;
  const sp = await searchParams;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  const { data: order } = await supabase
    .from("orders")
    .select(`*, order_items ( id, title, quantity, unit_price, product_id, products ( slug, product_images ( url, sort_order ) ) )`)
    .eq("id", id)
    .eq("user_id", user.id)
    .single();

  if (!order) notFound();

  const items = (Array.isArray(order.order_items) ? order.order_items : []) as OrderItemRow[];
  const shipping = order.shipping_address as ShippingAddr | null;
  const ref = displayOrderReference(order);
  const customerNote = (order as { customer_visible_note?: string | null }).customer_visible_note;

  return (
    <div className="space-y-5">
      <div>
        <Link href="/account/purchases" className="text-sm font-medium text-teal-800 hover:underline">
          ← My purchases
        </Link>
        <div className="mt-4 flex flex-wrap items-start justify-between gap-2">
          <div>
            <h1 className="text-2xl font-semibold text-zinc-900">Order {ref}</h1>
            <p className="mt-1 text-xs text-zinc-400">Placed {new Date(order.created_at).toLocaleDateString()}</p>
          </div>
          <span className={`rounded-full px-3 py-1 text-xs font-semibold ${statusColor(order.status)}`}>
            {formatStatus(order.status)}
          </span>
        </div>
      </div>

      {/* Payment update confirmation / request */}
      {sp.payment_updated ? (
        <div className="rounded-xl border border-teal-200 bg-teal-50 p-4">
          <p className="text-sm font-medium text-teal-900">
            ✓ Your payment details have been updated. Our team will re-process your order shortly.
          </p>
        </div>
      ) : null}
      {!sp.payment_updated &&
      (order as { payment_update_requested_at?: string | null }).payment_update_requested_at &&
      order.status !== "cancelled" ? (
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-amber-700">Action needed</p>
          <p className="mt-2 text-sm text-amber-900">
            There was a problem processing the payment card on this order. Please update your payment
            details so we can continue processing it.
          </p>
          <Link
            href={`/account/orders/${order.id}/update-payment`}
            className="mt-3 inline-block rounded-full bg-teal-800 px-5 py-2 text-sm font-semibold text-white hover:bg-teal-900"
          >
            Update payment details
          </Link>
        </div>
      ) : null}

      {/* Admin message to customer */}
      {customerNote ? (
        <div className="rounded-xl border border-teal-200 bg-teal-50 p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-teal-700">Message from MedicaPlanet</p>
          <p className="mt-2 text-sm text-teal-900 whitespace-pre-wrap">{customerNote}</p>
        </div>
      ) : null}

      {/* Items */}
      <ul className="space-y-4">
        {items.map((row) => {
          const p = normalizeProduct(row.products);
          const slug = p?.slug ?? null;
          const remote = firstRemoteImage(p?.product_images ?? null);
          const src = resolveOrderItemImage(slug, remote, row.title);
          return (
            <li key={row.id} className="flex gap-4 rounded-lg border border-zinc-200 bg-white p-3 shadow-sm">
              <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-md bg-zinc-100">
                <Image src={src} alt="" fill className="object-cover" sizes="64px" unoptimized={nextImageUnoptimized(src)} />
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-medium text-zinc-900">{row.title}</p>
                <p className="text-sm text-zinc-600">×{row.quantity} at ${Number(row.unit_price).toFixed(2)} each</p>
              </div>
              <div className="shrink-0 text-sm font-semibold text-zinc-900">
                ${(Number(row.unit_price) * row.quantity).toFixed(2)}
              </div>
            </li>
          );
        })}
      </ul>

      {/* Totals */}
      <div className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm space-y-1 text-sm">
        <div className="flex justify-between font-medium text-zinc-900">
          <span>Subtotal</span>
          <span>${Number(order.subtotal).toFixed(2)}</span>
        </div>
        {(() => {
          const couponCode = (order as { coupon_code?: string | null }).coupon_code;
          const discount = Number((order as { discount_amount?: number | null }).discount_amount ?? 0);
          return couponCode || discount > 0 ? (
            <div className="flex justify-between text-teal-700">
              <span>{couponCode ? `Coupon: ${couponCode}` : "Discount"}</span>
              <span>−${discount.toFixed(2)}</span>
            </div>
          ) : null;
        })()}
        <div className="flex justify-between text-zinc-600">
          <span>{(order as { shipping_label?: string | null }).shipping_label ?? "Shipping"}</span>
          <span>${Number((order as { shipping_amount?: number | null }).shipping_amount ?? 0).toFixed(2)}</span>
        </div>
        <div className="flex justify-between border-t border-zinc-200 pt-2 font-semibold text-teal-900">
          <span>Total</span>
          <span>
            ${Math.max(0,
              orderGrandTotal(
                Number(order.subtotal),
                Number((order as { shipping_amount?: number | null }).shipping_amount ?? 0)
              ) - Number((order as { discount_amount?: number | null }).discount_amount ?? 0)
            ).toFixed(2)}
          </span>
        </div>
      </div>

      {/* Shipping address */}
      <div className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">Shipping to</p>
        <address className="mt-2 not-italic text-sm text-zinc-700 whitespace-pre-line leading-relaxed">
          {formatAddress(shipping)}
        </address>
      </div>
    </div>
  );
}
