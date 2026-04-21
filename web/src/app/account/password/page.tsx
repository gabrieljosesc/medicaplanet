"use client";

import { useActionState } from "react";
import { changePassword, type ActionState } from "@/app/actions/account";

export default function PasswordPage() {
  const [state, action] = useActionState(changePassword, {} as ActionState);
  return (
    <div className="max-w-md space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-zinc-900">Change password</h1>
        <p className="mt-1 text-sm text-zinc-600">Use a strong password you do not reuse elsewhere.</p>
      </div>
      <form action={action} className="space-y-4 rounded-xl border border-zinc-200 bg-white p-6 shadow-sm">
        <label className="block text-sm">
          <span className="font-medium text-zinc-700">New password</span>
          <input
            name="new_password"
            type="password"
            required
            autoComplete="new-password"
            minLength={8}
            className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm"
          />
        </label>
        <label className="block text-sm">
          <span className="font-medium text-zinc-700">Confirm new password</span>
          <input
            name="confirm_password"
            type="password"
            required
            autoComplete="new-password"
            minLength={8}
            className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm"
          />
        </label>
        {state.error ? <p className="text-sm text-red-600">{state.error}</p> : null}
        {state.ok ? <p className="text-sm text-emerald-800">{state.ok}</p> : null}
        <button
          type="submit"
          className="rounded-full bg-emerald-800 px-6 py-2 text-sm font-medium text-white hover:bg-emerald-900"
        >
          Update password
        </button>
      </form>
    </div>
  );
}
