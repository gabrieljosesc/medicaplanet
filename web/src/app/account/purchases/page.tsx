import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { nextImageUnoptimized } from "@/lib/product-image";
import { resolveOrderItemImage } from "@/lib/order-display";
import { PurchaseFilters } from "./purchase-filters";

export const metadata: Metadata = {
  title: "My purchases",
};

type OrderStatus = "pending_csr" | "confirmed" | "shipped" | "cancelled";

type ImgRow = { url: string; sort_order: number };

function firstRemoteImage(images: ImgRow[] | null | undefined): string | null {
  if (!images?.length) return null;
  return [...images].sort((a, b) => a.sort_order - b.sort_order)[0]?.url ?? null;
}

type ProductEmbed = { slug: string; product_images?: ImgRow[] | null } | null;

function normalizeProduct(
  p: ProductEmbed | ProductEmbed[] | undefined
): { slug: string; product_images?: ImgRow[] | null } | null {
  if (!p) return null;
  return Array.isArray(p) ? p[0] ?? null : p;
}

export default async function PurchasesPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; q?: string }>;
}) {
  const sp = await searchParams;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  const { data: rawOrders } = await supabase
    .from("orders")
    .select(
      `
      id,
      status,
      subtotal,
      created_at,
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
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(80);

  const statusFilter = sp.status as OrderStatus | "all" | undefined;
  const q = (sp.q ?? "").trim().toLowerCase();

  let orders = rawOrders ?? [];

  if (statusFilter && statusFilter !== "all") {
    orders = orders.filter((o) => o.status === statusFilter);
  }

  if (q) {
    orders = orders.filter((o) => {
      if (String(o.id).toLowerCase().includes(q)) return true;
      const items = Array.isArray(o.order_items) ? o.order_items : [];
      return items.some((it: { title?: string }) => (it.title ?? "").toLowerCase().includes(q));
    });
  }

  const tabStatus = statusFilter && statusFilter !== "all" ? statusFilter : "all";

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-zinc-900">My purchases</h1>
        <p className="mt-1 text-sm text-zinc-600">
          Orders placed with MedicaPlanet. Our team may contact you while status is pending review.
        </p>
      </div>

      <PurchaseFilters currentStatus={tabStatus} q={sp.q} />

      <ul className="space-y-6">
        {orders.length === 0 ? (
          <li className="rounded-xl border border-dashed border-zinc-200 bg-white px-6 py-14 text-center text-sm text-zinc-600">
            No orders match your filters.
          </li>
        ) : (
          orders.map((order) => {
            const items = Array.isArray(order.order_items) ? order.order_items : [];

            return (
              <li
                key={order.id}
                className="overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-sm"
              >
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-zinc-100 bg-zinc-50/80 px-4 py-3 text-sm">
                  <span className="font-mono text-xs text-zinc-500">{order.id}</span>
                  <span className="rounded-full bg-white px-2.5 py-0.5 text-xs font-medium capitalize text-teal-900 ring-1 ring-teal-200">
                    {formatStatus(order.status)}
                  </span>
                  <time className="text-xs text-zinc-500" dateTime={order.created_at}>
                    {new Date(order.created_at).toLocaleString()}
                  </time>
                </div>
                <div className="p-4">
                  <ul className="space-y-3">
                    {items.map((it: Record<string, unknown>) => {
                      const row = it as {
                        id: string;
                        title: string;
                        quantity: number;
                        unit_price: number;
                        products?: ProductEmbed | ProductEmbed[];
                      };
                      const p = normalizeProduct(row.products);
                      const s = p?.slug ?? null;
                      const r = firstRemoteImage(p?.product_images ?? null);
                      const src = resolveOrderItemImage(s, r, row.title);
                      return (
                        <li key={row.id} className="flex gap-3 text-sm">
                          <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-lg bg-zinc-100">
                            <Image
                              src={src}
                              alt=""
                              fill
                              className="object-cover"
                              sizes="56px"
                              unoptimized={nextImageUnoptimized(src)}
                            />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="font-medium text-zinc-900 line-clamp-2">{row.title}</p>
                            <p className="text-xs text-zinc-500">
                              ×{row.quantity} · ${Number(row.unit_price).toFixed(2)} each
                            </p>
                          </div>
                          <div className="shrink-0 text-right text-sm font-medium text-zinc-900">
                            ${(Number(row.unit_price) * row.quantity).toFixed(2)}
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                  <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-zinc-100 pt-3">
                    <p className="text-sm font-semibold text-teal-900">
                      Order total: ${Number(order.subtotal).toFixed(2)}
                    </p>
                    <Link
                      href={`/account/orders/${order.id}`}
                      className="text-sm font-medium text-teal-800 hover:underline"
                    >
                      View details
                    </Link>
                  </div>
                </div>
              </li>
            );
          })
        )}
      </ul>
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
