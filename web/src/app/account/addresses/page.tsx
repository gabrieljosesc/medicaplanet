import type { Metadata } from "next";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { deleteAddress, setDefaultAddress } from "@/app/actions/account";
import { AddressEditor } from "./address-editor";

export const metadata: Metadata = {
  title: "Addresses",
};

type SearchParams = { edit?: string };

export default async function AddressesPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const sp = await searchParams;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: rows } = await supabase
    .from("user_addresses")
    .select("*")
    .eq("user_id", user.id)
    .order("is_default", { ascending: false })
    .order("created_at", { ascending: false });

  const addresses = rows ?? [];
  const editing = sp.edit ? addresses.find((a) => a.id === sp.edit) : undefined;

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-zinc-900">Addresses</h1>
          <p className="mt-1 text-sm text-zinc-600">
            Saved shipping or practice locations. Default is used as a starting point at checkout when
            you choose “same as profile”.
          </p>
        </div>
        {editing ? (
          <Link
            href="/account/addresses"
            className="text-sm font-medium text-teal-800 hover:underline"
          >
            Cancel edit
          </Link>
        ) : null}
      </div>

      <ul className="space-y-4">
        {addresses.length === 0 ? (
          <li className="rounded-xl border border-dashed border-zinc-200 bg-white px-6 py-12 text-center text-sm text-zinc-600">
            No saved addresses yet.
          </li>
        ) : (
          addresses.map((a) => (
            <li
              key={a.id}
              className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="font-semibold text-zinc-900">{a.recipient_name}</p>
                  <p className="text-sm text-zinc-600">{a.phone}</p>
                  <p className="mt-2 text-sm text-zinc-700">
                    {a.line1}
                    {a.line2 ? <>, {a.line2}</> : null}
                    <br />
                    {[a.city, a.state, a.postal_code].filter(Boolean).join(", ")}
                    {a.country ? <>, {a.country}</> : null}
                  </p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {a.is_default ? (
                      <span className="rounded bg-teal-100 px-2 py-0.5 text-xs font-medium text-teal-900">
                        Default
                      </span>
                    ) : null}
                    {a.label ? (
                      <span className="rounded bg-zinc-100 px-2 py-0.5 text-xs text-zinc-700">
                        {a.label}
                      </span>
                    ) : null}
                  </div>
                </div>
                <div className="flex flex-wrap gap-3 text-sm">
                  <Link
                    href={`/account/addresses?edit=${a.id}`}
                    className="font-medium text-teal-800 hover:underline"
                  >
                    Edit
                  </Link>
                  {!a.is_default ? (
                    <form action={setDefaultAddress}>
                      <input type="hidden" name="id" value={a.id} />
                      <button type="submit" className="font-medium text-zinc-700 hover:underline">
                        Set as default
                      </button>
                    </form>
                  ) : null}
                  {!a.is_default ? (
                    <form action={deleteAddress}>
                      <input type="hidden" name="id" value={a.id} />
                      <button type="submit" className="font-medium text-red-700 hover:underline">
                        Delete
                      </button>
                    </form>
                  ) : null}
                </div>
              </div>
            </li>
          ))
        )}
      </ul>

      <AddressEditor
        key={editing?.id ?? "new"}
        mode={editing ? "edit" : "create"}
        initial={
          editing
            ? {
                id: editing.id,
                label: editing.label ?? "",
                recipient_name: editing.recipient_name,
                phone: editing.phone ?? "",
                line1: editing.line1,
                line2: editing.line2 ?? "",
                city: editing.city ?? "",
                state: editing.state ?? "",
                postal_code: editing.postal_code ?? "",
                country: editing.country ?? "",
                is_default: editing.is_default,
              }
            : undefined
        }
      />
    </div>
  );
}
