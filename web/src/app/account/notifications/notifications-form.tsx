"use client";

import { useActionState } from "react";
import { saveNotificationSettings, type ActionState } from "@/app/actions/account";

export function NotificationsForm({
  emailOrderUpdates,
  emailProductNews,
}: {
  emailOrderUpdates: boolean;
  emailProductNews: boolean;
}) {
  const [state, action] = useActionState(saveNotificationSettings, {} as ActionState);
  return (
    <form action={action} className="space-y-4 rounded-xl border border-zinc-200 bg-white p-6 shadow-sm">
      <label className="flex cursor-pointer items-start gap-3 text-sm">
        <input
          type="checkbox"
          name="email_order_updates"
          defaultChecked={emailOrderUpdates}
          className="mt-0.5 h-4 w-4 rounded border-zinc-300"
        />
        <span>
          <span className="font-medium text-zinc-800">Order updates</span>
          <span className="block text-zinc-600">Status changes, shipping notes, and support messages.</span>
        </span>
      </label>
      <label className="flex cursor-pointer items-start gap-3 text-sm">
        <input
          type="checkbox"
          name="email_product_news"
          defaultChecked={emailProductNews}
          className="mt-0.5 h-4 w-4 rounded border-zinc-300"
        />
        <span>
          <span className="font-medium text-zinc-800">Product news</span>
          <span className="block text-zinc-600">Occasional updates on new SKUs and restocks.</span>
        </span>
      </label>
      {state.error ? <p className="text-sm text-red-600">{state.error}</p> : null}
      {state.ok ? <p className="text-sm text-emerald-800">{state.ok}</p> : null}
      <button
        type="submit"
        className="rounded-full bg-emerald-800 px-6 py-2 text-sm font-medium text-white hover:bg-emerald-900"
      >
        Save preferences
      </button>
    </form>
  );
}
