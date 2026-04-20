import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

type Props = { searchParams: Promise<{ q?: string }> };

function escapeIlike(term: string): string {
  return term.replace(/\\/g, "\\\\").replace(/%/g, "\\%").replace(/_/g, "\\_");
}

function isUuid(v: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(v);
}

export default async function AdminOrdersPage({ searchParams }: Props) {
  const sp = await searchParams;
  const q = (sp.q ?? "").trim();
  const supabase = await createClient();
  let query = supabase
    .from("orders")
    .select("id,email,full_name,status,subtotal,created_at,policy_acknowledged_at")
    .order("created_at", { ascending: false })
    .limit(100);
  if (q) {
    if (isUuid(q)) {
      query = query.or(`id.eq.${q},full_name.ilike.%${escapeIlike(q)}%,email.ilike.%${escapeIlike(q)}%`);
    } else {
      query = query.or(`full_name.ilike.%${escapeIlike(q)}%,email.ilike.%${escapeIlike(q)}%`);
    }
  }
  const { data: orders } = await query;

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <h1 className="text-2xl font-semibold text-zinc-900">Orders</h1>
        <form method="get" className="w-full sm:w-auto">
          <div className="flex gap-2">
            <input
              type="search"
              name="q"
              defaultValue={q}
              placeholder="Search order ID, name, email"
              className="w-full rounded-md border border-zinc-300 px-3 py-2 text-sm sm:w-72"
            />
            <button
              type="submit"
              className="rounded-md bg-emerald-800 px-3 py-2 text-sm font-medium text-white hover:bg-emerald-900"
            >
              Search
            </button>
            {q ? (
              <Link
                href="/admin/orders"
                className="rounded-md border border-zinc-300 px-3 py-2 text-sm text-zinc-700 hover:bg-zinc-50"
              >
                Clear
              </Link>
            ) : null}
          </div>
        </form>
      </div>
      <table className="mt-6 w-full border-collapse text-left text-sm">
        <thead>
          <tr className="border-b border-zinc-200 text-xs uppercase text-zinc-500">
            <th className="py-2 pr-2">When</th>
            <th className="py-2 pr-2">Order ID</th>
            <th className="py-2 pr-2">Customer</th>
            <th className="py-2 pr-2">Status</th>
            <th className="py-2 pr-2">Policy ack</th>
            <th className="py-2 pr-2">Total</th>
          </tr>
        </thead>
        <tbody>
          {(orders ?? []).map((o) => (
            <tr key={o.id} className="border-b border-zinc-100">
              <td className="py-2 pr-2 text-xs text-zinc-500">
                {new Date(o.created_at).toLocaleString()}
              </td>
              <td className="py-2 pr-2 font-mono text-xs text-zinc-600">
                <Link href={`/admin/orders/${o.id}`} className="hover:underline">
                  {o.id}
                </Link>
              </td>
              <td className="py-2 pr-2">
                <Link href={`/admin/orders/${o.id}`} className="font-medium text-emerald-900 hover:underline">
                  {o.full_name}
                </Link>
                <div className="text-xs text-zinc-500">{o.email}</div>
              </td>
              <td className="py-2 pr-2">{o.status}</td>
              <td className="py-2 pr-2 text-xs">
                {o.policy_acknowledged_at ? (
                  <span className="text-emerald-700">
                    Yes · {new Date(o.policy_acknowledged_at).toLocaleDateString()}
                  </span>
                ) : (
                  <span className="text-amber-700">No</span>
                )}
              </td>
              <td className="py-2 pr-2">${Number(o.subtotal).toFixed(2)}</td>
            </tr>
          ))}
          {(orders ?? []).length === 0 ? (
            <tr>
              <td colSpan={6} className="py-4 text-sm text-zinc-600">
                No orders found{q ? ` for "${q}"` : ""}.
              </td>
            </tr>
          ) : null}
        </tbody>
      </table>
    </div>
  );
}
