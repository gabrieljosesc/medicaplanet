import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { updateOrderAction } from "@/app/actions/admin";

type Props = { params: Promise<{ id: string }> };

export default async function AdminOrderDetailPage({ params }: Props) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: order } = await supabase
    .from("orders")
    .select("*, order_items(*)")
    .eq("id", id)
    .single();
  if (!order) notFound();
  const items = Array.isArray(order.order_items) ? order.order_items : [];

  return (
    <div>
      <Link href="/admin/orders" className="text-sm text-emerald-800 hover:underline">
        ← Orders
      </Link>
      <h1 className="mt-4 text-2xl font-semibold text-zinc-900">Order detail</h1>
      <p className="font-mono text-xs text-zinc-500">{order.id}</p>
      <div className="mt-4 grid gap-2 text-sm text-zinc-700">
        <p>
          <strong>{order.full_name}</strong> · {order.email}
        </p>
        {order.phone && <p>Phone: {order.phone}</p>}
        <p>Shipping: {JSON.stringify(order.shipping_address)}</p>
        {order.customer_notes && <p>Customer notes: {order.customer_notes}</p>}
        {order.payment_notes && <p>Payment notes: {order.payment_notes}</p>}
      </div>
      <ul className="mt-6 space-y-2">
        {items.map((it: { id: string; title: string; quantity: number; unit_price: number }) => (
          <li key={it.id} className="flex justify-between text-sm">
            <span>
              {it.title} × {it.quantity}
            </span>
            <span>${(Number(it.unit_price) * it.quantity).toFixed(2)}</span>
          </li>
        ))}
      </ul>
      <p className="mt-4 font-semibold text-emerald-900">Subtotal ${Number(order.subtotal).toFixed(2)}</p>

      <form action={updateOrderAction} className="mt-8 max-w-md space-y-4 border-t border-zinc-200 pt-6">
        <input type="hidden" name="id" value={order.id} />
        <div>
          <label className="text-xs font-medium text-zinc-600">Status</label>
          <select name="status" defaultValue={order.status} className="mt-1 w-full rounded-md border border-zinc-300 px-3 py-2 text-sm">
            <option value="pending_csr">pending_csr</option>
            <option value="confirmed">confirmed</option>
            <option value="shipped">shipped</option>
            <option value="cancelled">cancelled</option>
          </select>
        </div>
        <div>
          <label className="text-xs font-medium text-zinc-600">Admin notes</label>
          <textarea name="admin_notes" rows={3} defaultValue={order.admin_notes ?? ""} className="mt-1 w-full rounded-md border border-zinc-300 px-3 py-2 text-sm" />
        </div>
        <button type="submit" className="rounded-full bg-emerald-800 px-6 py-2.5 text-sm font-semibold text-white">
          Update order
        </button>
      </form>
    </div>
  );
}
