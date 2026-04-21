import Image from "next/image";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { nextImageUnoptimized } from "@/lib/product-image";
import { resolveOrderItemImage } from "@/lib/order-display";

type ImgRow = { url: string; sort_order: number };

type ProductEmbed = { slug: string; product_images?: ImgRow[] | null } | null;

type OrderItemRow = {
  id: string;
  title: string;
  quantity: number;
  unit_price: number;
  products?: ProductEmbed | ProductEmbed[];
};

function normalizeProduct(
  p: ProductEmbed | ProductEmbed[] | undefined
): { slug: string; product_images?: ImgRow[] | null } | null {
  if (!p) return null;
  return Array.isArray(p) ? p[0] ?? null : p;
}

function firstRemoteImage(images: ImgRow[] | null | undefined): string | null {
  if (!images?.length) return null;
  return [...images].sort((a, b) => a.sort_order - b.sort_order)[0]?.url ?? null;
}

type Props = { params: Promise<{ id: string }> };

export default async function OrderDetailPage({ params }: Props) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  const { data: order } = await supabase
    .from("orders")
    .select(
      `
      *,
      order_items (
        id,
        title,
        quantity,
        unit_price,
        product_id,
        products (
          slug,
          product_images ( url, sort_order )
        )
      )
    `
    )
    .eq("id", id)
    .eq("user_id", user.id)
    .single();

  if (!order) notFound();

  const items = (Array.isArray(order.order_items) ? order.order_items : []) as OrderItemRow[];

  return (
    <div>
      <Link href="/account/purchases" className="text-sm font-medium text-emerald-800 hover:underline">
        ← My purchases
      </Link>
      <h1 className="mt-4 text-2xl font-semibold text-zinc-900">Order</h1>
      <p className="font-mono text-xs text-zinc-500">{order.id}</p>
      <p className="mt-2 text-sm text-zinc-600">Status: {formatStatus(order.status)}</p>
      <ul className="mt-6 space-y-4">
        {items.map((row) => {
          const p = normalizeProduct(row.products);
          const slug = p?.slug ?? null;
          const remote = firstRemoteImage(p?.product_images ?? null);
          const src = resolveOrderItemImage(slug, remote, row.title);
          return (
            <li
              key={row.id}
              className="flex gap-4 rounded-lg border border-zinc-200 bg-white p-3 shadow-sm"
            >
              <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-md bg-zinc-100">
                <Image
                  src={src}
                  alt=""
                  fill
                  className="object-cover"
                  sizes="64px"
                  unoptimized={nextImageUnoptimized(src)}
                />
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-medium text-zinc-900">{row.title}</p>
                <p className="text-sm text-zinc-600">
                  ×{row.quantity} at ${Number(row.unit_price).toFixed(2)} each
                </p>
              </div>
              <div className="shrink-0 text-sm font-semibold text-zinc-900">
                ${(Number(row.unit_price) * row.quantity).toFixed(2)}
              </div>
            </li>
          );
        })}
      </ul>
      <p className="mt-6 text-sm font-semibold text-emerald-900">
        Total ${Number(order.subtotal).toFixed(2)}
      </p>
    </div>
  );
}

function formatStatus(s: string): string {
  switch (s) {
    case "pending_csr":
      return "Pending review";
    case "confirmed":
      return "Confirmed";
    case "shipped":
      return "Shipped";
    case "cancelled":
      return "Cancelled";
    default:
      return s;
  }
}
