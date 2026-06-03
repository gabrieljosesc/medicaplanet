import Link from "next/link";
import { createServiceClient } from "@/lib/supabase/admin";
import { ResetPasswordButton } from "./reset-password-button";

export const dynamic = "force-dynamic";

type Props = { searchParams: Promise<{ q?: string }> };

export default async function AdminUsersPage({ searchParams }: Props) {
  const sp = await searchParams;
  const q = (sp.q ?? "").trim().toLowerCase();

  const svc = createServiceClient();

  const { data: profiles } = await svc
    .from("profiles")
    .select("id,email,first_name,last_name,full_name,phone,company,role,license_number,license_expiry,created_at")
    .order("created_at", { ascending: false })
    .limit(500);

  const rows = (profiles ?? []).filter((p) => {
    if (!q) return true;
    const haystack = [p.email, p.full_name, p.first_name, p.last_name, p.phone, p.company, p.license_number]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();
    return haystack.includes(q);
  });

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <h1 className="text-2xl font-semibold text-zinc-900">Users</h1>
        <form method="get" className="w-full sm:w-auto">
          <div className="flex gap-2">
            <input
              type="search"
              name="q"
              defaultValue={q}
              placeholder="Search name, email, license #"
              className="w-full rounded-md border border-zinc-300 px-3 py-2 text-sm sm:w-72"
            />
            <button type="submit" className="rounded-md bg-teal-800 px-3 py-2 text-sm font-medium text-white hover:bg-teal-900">
              Search
            </button>
            {q ? (
              <Link href="/admin/users" className="rounded-md border border-zinc-300 px-3 py-2 text-sm text-zinc-700 hover:bg-zinc-50">
                Clear
              </Link>
            ) : null}
          </div>
        </form>
      </div>

      <p className="mt-2 text-sm text-zinc-500">
        {rows.length} account{rows.length !== 1 ? "s" : ""}{q ? ` matching "${q}"` : " total"}
      </p>

      <div className="mt-4 overflow-x-auto">
        <table className="w-full border-collapse text-left text-sm">
          <thead>
            <tr className="border-b border-zinc-200 text-xs uppercase text-zinc-500">
              <th className="py-2 pr-3">Name</th>
              <th className="py-2 pr-3">Email</th>
              <th className="py-2 pr-3">License #</th>
              <th className="py-2 pr-3">License exp.</th>
              <th className="py-2 pr-3">Company</th>
              <th className="py-2 pr-3">Role</th>
              <th className="py-2 pr-3">Joined</th>
              <th className="py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((u) => (
              <tr key={u.id} className="border-b border-zinc-100 hover:bg-zinc-50">
                <td className="py-2 pr-3 font-medium text-zinc-900">
                  <Link href={`/admin/users/${u.id}`} className="hover:underline text-teal-800">
                    {u.full_name || [u.first_name, u.last_name].filter(Boolean).join(" ") || "—"}
                  </Link>
                </td>
                <td className="py-2 pr-3 text-zinc-600">{u.email ?? "—"}</td>
                <td className="py-2 pr-3 font-mono text-xs text-zinc-700">{u.license_number ?? "—"}</td>
                <td className="py-2 pr-3 text-xs text-zinc-500">
                  {u.license_expiry ? String(u.license_expiry).slice(0, 10) : "—"}
                </td>
                <td className="py-2 pr-3 text-zinc-500">{u.company ?? "—"}</td>
                <td className="py-2 pr-3">
                  {u.role === "admin" ? (
                    <span className="rounded-full bg-teal-100 px-2 py-0.5 text-xs font-medium text-teal-800">Admin</span>
                  ) : (
                    <span className="text-xs text-zinc-400">Customer</span>
                  )}
                </td>
                <td className="py-2 pr-3 text-xs text-zinc-500">
                  {u.created_at ? new Date(u.created_at).toLocaleDateString() : "—"}
                </td>
                <td className="py-2 whitespace-nowrap">
                  <div className="flex gap-2">
                    <Link href={`/admin/users/${u.id}`} className="rounded-md border border-zinc-300 px-2 py-1 text-xs text-zinc-700 hover:bg-zinc-100">
                      View
                    </Link>
                    <ResetPasswordButton userId={u.id} />
                  </div>
                </td>
              </tr>
            ))}
            {rows.length === 0 ? (
              <tr>
                <td colSpan={8} className="py-6 text-sm text-zinc-500">
                  No accounts found{q ? ` for "${q}"` : ""}.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </div>
  );
}
