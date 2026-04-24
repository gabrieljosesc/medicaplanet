"use client";

import { useActionState } from "react";
import Link from "next/link";
import { createAddress, updateAddress, type ActionState } from "@/app/actions/account";

type Addr = {
  id: string;
  label: string;
  recipient_name: string;
  phone: string;
  line1: string;
  line2: string;
  city: string;
  state: string;
  postal_code: string;
  country: string;
  is_default: boolean;
};

export function AddressEditor({
  mode,
  initial,
}: {
  mode: "create" | "edit";
  initial?: Addr;
}) {
  const [state, action] = useActionState(
    mode === "create" ? createAddress : updateAddress,
    {} as ActionState
  );

  const i = initial;

  return (
    <section className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm">
      <h2 className="text-lg font-semibold text-zinc-900">
        {mode === "create" ? "Add address" : "Edit address"}
      </h2>
      <form action={action} className="mt-4 grid gap-4 sm:grid-cols-2">
        {mode === "edit" && i ? <input type="hidden" name="id" value={i.id} /> : null}
        <label className="block text-sm sm:col-span-2">
          <span className="font-medium text-zinc-700">Label (optional)</span>
          <input
            name="label"
            defaultValue={i?.label ?? ""}
            placeholder="Office, Warehouse…"
            className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm"
          />
        </label>
        <label className="block text-sm">
          <span className="font-medium text-zinc-700">Recipient name</span>
          <input
            name="recipient_name"
            required
            defaultValue={i?.recipient_name ?? ""}
            className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm"
          />
        </label>
        <label className="block text-sm">
          <span className="font-medium text-zinc-700">Phone</span>
          <input
            name="phone"
            defaultValue={i?.phone ?? ""}
            className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm"
          />
        </label>
        <label className="block text-sm sm:col-span-2">
          <span className="font-medium text-zinc-700">Address line 1</span>
          <input
            name="line1"
            required
            defaultValue={i?.line1 ?? ""}
            className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm"
          />
        </label>
        <label className="block text-sm sm:col-span-2">
          <span className="font-medium text-zinc-700">Address line 2</span>
          <input
            name="line2"
            defaultValue={i?.line2 ?? ""}
            className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm"
          />
        </label>
        <label className="block text-sm">
          <span className="font-medium text-zinc-700">City</span>
          <input name="city" defaultValue={i?.city ?? ""} className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm" />
        </label>
        <label className="block text-sm">
          <span className="font-medium text-zinc-700">State / region</span>
          <input name="state" defaultValue={i?.state ?? ""} className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm" />
        </label>
        <label className="block text-sm">
          <span className="font-medium text-zinc-700">Postal code</span>
          <input
            name="postal_code"
            defaultValue={i?.postal_code ?? ""}
            className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm"
          />
        </label>
        <label className="block text-sm">
          <span className="font-medium text-zinc-700">Country</span>
          <input
            name="country"
            defaultValue={i?.country ?? ""}
            className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm"
          />
        </label>
        <label className="flex items-center gap-2 text-sm sm:col-span-2">
          <input
            type="checkbox"
            name="is_default"
            defaultChecked={i?.is_default ?? false}
            className="h-4 w-4 rounded border-zinc-300"
          />
          <span>Set as default address</span>
        </label>
        {state.error ? <p className="text-sm text-red-600 sm:col-span-2">{state.error}</p> : null}
        <div className="flex flex-wrap gap-3 sm:col-span-2">
          <button
            type="submit"
            className="rounded-full bg-teal-800 px-6 py-2 text-sm font-medium text-white hover:bg-teal-900"
          >
            {mode === "create" ? "Save address" : "Update address"}
          </button>
          {mode === "edit" ? (
            <Link
              href="/account/addresses"
              className="rounded-full border border-zinc-300 px-6 py-2 text-sm font-medium text-zinc-800 hover:bg-zinc-50"
            >
              Cancel
            </Link>
          ) : null}
        </div>
      </form>
    </section>
  );
}
