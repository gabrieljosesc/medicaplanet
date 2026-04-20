import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { signOut } from "@/app/actions/auth";

export default async function AccountPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  const { data: orders } = await supabase
    .from("orders")
    .select("id,status,subtotal,created_at")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(20);

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-zinc-900">Account</h1>
          <p className="text-sm text-zinc-600">{profile?.email ?? user.email}</p>
        </div>
        <form action={signOut}>
          <button type="submit" className="rounded-full border border-zinc-300 px-4 py-2 text-sm font-medium hover:bg-zinc-100">
            Sign out
          </button>
        </form>
      </div>
      <section>
        <h2 className="text-lg font-semibold text-zinc-900">Your orders</h2>
        <ul className="mt-4 space-y-2">
          {(orders ?? []).length === 0 ? (
            <li className="text-sm text-zinc-600">No orders yet.</li>
          ) : (
            (orders ?? []).map((o) => (
              <li key={o.id}>
                <Link href={`/account/orders/${o.id}`} className="flex justify-between rounded-lg border border-zinc-200 bg-white px-4 py-3 text-sm hover:border-emerald-300">
                  <span className="font-mono text-xs text-zinc-500">{o.id}</span>
                  <span className="text-zinc-700">{o.status}</span>
                  <span className="font-medium text-emerald-900">${Number(o.subtotal).toFixed(2)}</span>
                </Link>
              </li>
            ))
          )}
        </ul>
      </section>
    </div>
  );
}
