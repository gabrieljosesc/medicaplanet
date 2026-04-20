import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

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
    .select("*, order_items(*)")
    .eq("id", id)
    .eq("user_id", user.id)
    .single();

  if (!order) notFound();

  const items = Array.isArray(order.order_items) ? order.order_items : [];

  return (
    <div>
      <Link href="/account" className="text-sm font-medium text-emerald-800 hover:underline">
        ← Account
      </Link>
      <h1 className="mt-4 text-2xl font-semibold text-zinc-900">Order</h1>
      <p className="font-mono text-xs text-zinc-500">{order.id}</p>
      <p className="mt-2 text-sm text-zinc-600">Status: {order.status}</p>
      <ul className="mt-6 space-y-2">
        {items.map((it: { id: string; title: string; quantity: number; unit_price: number }) => (
          <li key={it.id} className="flex justify-between text-sm">
            <span>{it.title} × {it.quantity}</span>
            <span>${(Number(it.unit_price) * it.quantity).toFixed(2)}</span>
          </li>
        ))}
      </ul>
      <p className="mt-4 text-sm font-semibold text-emerald-900">
        Total ${Number(order.subtotal).toFixed(2)}
      </p>
    </div>
  );
}
