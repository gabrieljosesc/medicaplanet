import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

export default async function AdminOrdersPage() {
  const supabase = await createClient();
  const { data: orders } = await supabase
    .from("orders")
    .select("id,email,full_name,status,subtotal,created_at")
    .order("created_at", { ascending: false })
    .limit(100);

  return (
    <div>
      <h1 className="text-2xl font-semibold text-zinc-900">Orders</h1>
      <table className="mt-6 w-full border-collapse text-left text-sm">
        <thead>
          <tr className="border-b border-zinc-200 text-xs uppercase text-zinc-500">
            <th className="py-2 pr-2">When</th>
            <th className="py-2 pr-2">Customer</th>
            <th className="py-2 pr-2">Status</th>
            <th className="py-2 pr-2">Total</th>
          </tr>
        </thead>
        <tbody>
          {(orders ?? []).map((o) => (
            <tr key={o.id} className="border-b border-zinc-100">
              <td className="py-2 pr-2 text-xs text-zinc-500">
                {new Date(o.created_at).toLocaleString()}
              </td>
              <td className="py-2 pr-2">
                <Link href={`/admin/orders/${o.id}`} className="font-medium text-emerald-900 hover:underline">
                  {o.full_name}
                </Link>
                <div className="text-xs text-zinc-500">{o.email}</div>
              </td>
              <td className="py-2 pr-2">{o.status}</td>
              <td className="py-2 pr-2">${Number(o.subtotal).toFixed(2)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
