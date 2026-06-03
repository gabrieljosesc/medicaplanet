import Link from "next/link";
import { notFound } from "next/navigation";
import { createServiceClient } from "@/lib/supabase/admin";
import { displayOrderReference } from "@/lib/order-reference";
import { ResetPasswordButton } from "../reset-password-button";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ id: string }> };

function formatStatus(s: string) {
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
    case "pending_csr": return "text-amber-700";
    case "confirmed": return "text-teal-700";
    case "shipped": return "text-blue-700";
    case "cancelled": return "text-red-600";
    default: return "text-zinc-600";
  }
}

type AddrRow = {
  id: string;
  label: string | null;
  recipient_name: string;
  line1: string;
  line2: string | null;
  city: string | null;
  state: string | null;
  postal_code: string | null;
  country: string | null;
  is_default: boolean;
};

export default async function AdminUserDetailPage({ params }: Props) {
  const { id } = await params;
  const svc = createServiceClient();

  const [profileRes, ordersRes, addrRes] = await Promise.all([
    svc.from("profiles").select("*").eq("id", id).single(),
    svc
      .from("orders")
      .select("id,reference_number,status,subtotal,shipping_amount,discount_amount,created_at,order_items(title,quantity,unit_price)")
      .eq("user_id", id)
      .order("created_at", { ascending: false })
      .limit(50),
    svc
      .from("user_addresses")
      .select("id,label,recipient_name,line1,line2,city,state,postal_code,country,is_default")
      .eq("user_id", id)
      .order("is_default", { ascending: false }),
  ]);

  const profile = profileRes.data;
  if (!profile) notFound();

  const orders = ordersRes.data ?? [];
  const addresses = (addrRes.data ?? []) as AddrRow[];

  const fullName = profile.full_name || [profile.first_name, profile.last_name].filter(Boolean).join(" ") || "—";

  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <Link href="/admin/users" className="text-sm text-teal-800 hover:underline">← Users</Link>
        <h1 className="mt-3 text-2xl font-semibold text-zinc-900">{fullName}</h1>
        <p className="text-sm text-zinc-500">{profile.email ?? "No email"}</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {/* Profile info */}
        <section className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm">
          <h2 className="text-xs font-semibold uppercase tracking-wide text-zinc-500">Profile</h2>
          <dl className="mt-3 space-y-1 text-sm">
            <div className="flex gap-2"><dt className="w-28 shrink-0 text-zinc-500">Full name</dt><dd className="text-zinc-900">{fullName}</dd></div>
            <div className="flex gap-2"><dt className="w-28 shrink-0 text-zinc-500">Email</dt><dd className="text-zinc-900 break-all">{profile.email ?? "—"}</dd></div>
            <div className="flex gap-2"><dt className="w-28 shrink-0 text-zinc-500">Phone</dt><dd className="text-zinc-900">{profile.phone ?? "—"}</dd></div>
            <div className="flex gap-2"><dt className="w-28 shrink-0 text-zinc-500">Company</dt><dd className="text-zinc-900">{profile.company ?? "—"}</dd></div>
            <div className="flex gap-2"><dt className="w-28 shrink-0 text-zinc-500">Role</dt><dd className="text-zinc-900 capitalize">{profile.role ?? "customer"}</dd></div>
            <div className="flex gap-2"><dt className="w-28 shrink-0 text-zinc-500">Joined</dt><dd className="text-zinc-900">{profile.created_at ? new Date(profile.created_at).toLocaleDateString() : "—"}</dd></div>
          </dl>
        </section>

        {/* Medical license */}
        <section className="rounded-xl border border-teal-200 bg-teal-50 p-4 shadow-sm">
          <h2 className="text-xs font-semibold uppercase tracking-wide text-teal-700">Medical License</h2>
          <dl className="mt-3 space-y-1 text-sm">
            <div className="flex gap-2"><dt className="w-28 shrink-0 text-teal-600">License #</dt>
              <dd className="font-mono text-zinc-900">{profile.license_number ?? "—"}</dd>
            </div>
            <div className="flex gap-2"><dt className="w-28 shrink-0 text-teal-600">Expiry</dt>
              <dd className="text-zinc-900">{profile.license_expiry ? String(profile.license_expiry).slice(0, 10) : "—"}</dd>
            </div>
          </dl>
        </section>
      </div>

      {/* Saved addresses */}
      <section className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm">
        <h2 className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
          Saved Addresses ({addresses.length})
        </h2>
        {addresses.length === 0 ? (
          <p className="mt-2 text-sm text-zinc-400">No saved addresses.</p>
        ) : (
          <ul className="mt-3 space-y-3">
            {addresses.map((addr) => (
              <li key={addr.id} className="rounded-lg border border-zinc-100 bg-zinc-50 px-3 py-2 text-sm text-zinc-700">
                {addr.label ? <p className="font-medium text-zinc-800">{addr.label}{addr.is_default ? " (Default)" : ""}</p> : null}
                <p>{addr.recipient_name}</p>
                <p>{addr.line1}{addr.line2 ? `, ${addr.line2}` : ""}</p>
                <p>{[addr.city, addr.state, addr.postal_code].filter(Boolean).join(", ")}</p>
                <p>{addr.country}</p>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Order history */}
      <section className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm">
        <h2 className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
          Order History ({orders.length})
        </h2>
        {orders.length === 0 ? (
          <p className="mt-2 text-sm text-zinc-400">No orders placed.</p>
        ) : (
          <table className="mt-3 w-full border-collapse text-sm">
            <thead>
              <tr className="border-b border-zinc-100 text-xs uppercase text-zinc-400">
                <th className="py-1 pr-3 text-left">Reference</th>
                <th className="py-1 pr-3 text-left">Date</th>
                <th className="py-1 pr-3 text-left">Status</th>
                <th className="py-1 text-right">Total</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((o) => {
                const discount = Number((o as { discount_amount?: number | null }).discount_amount ?? 0);
                const total = Math.max(0, Number(o.subtotal) + Number((o as { shipping_amount?: number | null }).shipping_amount ?? 0) - discount);
                return (
                  <tr key={o.id} className="border-b border-zinc-50">
                    <td className="py-1.5 pr-3">
                      <Link href={`/admin/orders/${o.id}`} className="font-mono text-xs text-teal-800 hover:underline">
                        {displayOrderReference(o)}
                      </Link>
                    </td>
                    <td className="py-1.5 pr-3 text-xs text-zinc-500">
                      {new Date(o.created_at).toLocaleDateString()}
                    </td>
                    <td className={`py-1.5 pr-3 text-xs font-medium ${statusColor(o.status)}`}>
                      {formatStatus(o.status)}
                    </td>
                    <td className="py-1.5 text-right font-medium text-zinc-900">
                      ${total.toFixed(2)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </section>

      {/* Actions */}
      <div className="flex gap-3">
        <ResetPasswordButton userId={profile.id} />
      </div>
    </div>
  );
}
