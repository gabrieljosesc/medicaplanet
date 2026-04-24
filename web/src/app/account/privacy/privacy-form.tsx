"use client";

import { useActionState } from "react";
import { savePrivacySettings, type ActionState } from "@/app/actions/account";

export function PrivacyForm({ analyticsOptIn }: { analyticsOptIn: boolean }) {
  const [state, action] = useActionState(savePrivacySettings, {} as ActionState);
  return (
    <form action={action} className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm">
      <h2 className="font-semibold text-zinc-900">Preferences</h2>
      <label className="mt-4 flex cursor-pointer items-start gap-3 text-sm">
        <input
          type="checkbox"
          name="analytics_opt_in"
          defaultChecked={analyticsOptIn}
          className="mt-0.5 h-4 w-4 rounded border-zinc-300"
        />
        <span>
          <span className="font-medium text-zinc-800">Product improvement</span>
          <span className="block text-zinc-600">
            Allow anonymized usage data to help us improve the storefront (no ads).
          </span>
        </span>
      </label>
      {state.error ? <p className="mt-3 text-sm text-red-600">{state.error}</p> : null}
      {state.ok ? <p className="mt-3 text-sm text-teal-800">{state.ok}</p> : null}
      <button
        type="submit"
        className="mt-4 rounded-full bg-teal-800 px-6 py-2 text-sm font-medium text-white hover:bg-teal-900"
      >
        Save
      </button>
    </form>
  );
}
