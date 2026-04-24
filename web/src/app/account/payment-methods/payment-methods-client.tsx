"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { addSavedCard, deleteSavedCard, setDefaultSavedCard, type SavedCardRow } from "@/app/actions/saved-cards";

function formatCard(c: SavedCardRow) {
  const brand = c.brand ? c.brand.charAt(0).toUpperCase() + c.brand.slice(1) : "Card";
  return `${brand} ···· ${c.last4} · ${String(c.exp_month).padStart(2, "0")}/${String(c.exp_year).slice(-2)}`;
}

function AddCardModal({ onClose }: { onClose: () => void }) {
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    setError(null);
    start(async () => {
      const res = await addSavedCard(formData);
      if (!res.ok) {
        setError(res.message);
        return;
      }
      onClose();
    });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" role="dialog" aria-modal="true">
      <div className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-2xl border border-zinc-200 bg-white p-6 shadow-xl">
        <div className="flex items-start justify-between gap-3">
          <h2 className="text-lg font-semibold text-zinc-900">Add credit / debit card</h2>
          <button type="button" onClick={onClose} className="rounded-full px-2 py-1 text-sm text-zinc-500 hover:bg-zinc-100">
            ✕
          </button>
        </div>
        <div className="mt-3 rounded-lg border border-teal-200 bg-teal-50 px-3 py-2 text-xs text-teal-900">
          For your protection, the full card number is encrypted on our servers.{" "}
          <strong>We never store your CVV</strong> (security standard). Our team may contact you if a one-time security
          code is needed for processing.
        </div>
        <form onSubmit={handleSubmit} className="mt-4 space-y-3">
          <div>
            <label className="text-xs font-medium text-zinc-600">Card number</label>
            <input
              name="card_number"
              required
              autoComplete="cc-number"
              placeholder="4242 4242 4242 4242"
              className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-zinc-600">Expiry (MM/YY)</label>
              <input
                name="expiry"
                required
                autoComplete="cc-exp"
                placeholder="08/27"
                className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-zinc-600">CVV (not stored)</label>
              <input
                name="cvv"
                autoComplete="cc-csc"
                placeholder="123"
                className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm"
              />
            </div>
          </div>
          <div>
            <label className="text-xs font-medium text-zinc-600">Name on card</label>
            <input
              name="name_on_card"
              required
              autoComplete="cc-name"
              className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm"
            />
          </div>
          <label className="flex items-center gap-2 text-sm text-zinc-700">
            <input type="checkbox" name="set_default" className="size-4 rounded border-zinc-400" />
            Set as default for checkout
          </label>
          {error ? <p className="text-sm text-red-600">{error}</p> : null}
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={onClose} className="rounded-full border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50">
              Cancel
            </button>
            <button
              type="submit"
              disabled={pending}
              className="rounded-full bg-rose-400 px-4 py-2 text-sm font-semibold text-white hover:bg-rose-500 disabled:opacity-60"
            >
              {pending ? "Saving…" : "Save card"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export function PaymentMethodsClient({ initialMethods }: { initialMethods: SavedCardRow[] }) {
  const router = useRouter();
  const [showAdd, setShowAdd] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();

  return (
    <div className="space-y-6">
      <p className="text-sm text-zinc-600">
        Add cards here to reuse them at checkout. Full numbers are encrypted and viewable only by authorized admin users
        when processing an approved order.
      </p>
      {error ? <p className="text-sm text-red-600">{error}</p> : null}

      {initialMethods.length === 0 ? (
        <div className="rounded-xl border border-dashed border-zinc-200 bg-white px-6 py-14 text-center shadow-sm">
          <p className="text-sm text-zinc-600">You don&apos;t have cards yet.</p>
          <button
            type="button"
            onClick={() => setShowAdd(true)}
            className="mt-4 rounded-full bg-rose-500 px-5 py-2.5 text-sm font-semibold text-white hover:bg-rose-600"
          >
            + Add new card
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-zinc-900">Credit / debit card</h2>
            <button
              type="button"
              onClick={() => setShowAdd(true)}
              className="rounded-full bg-rose-500 px-4 py-2 text-sm font-semibold text-white hover:bg-rose-600"
            >
              + Add new card
            </button>
          </div>
          <ul className="space-y-3">
            {initialMethods.map((c) => (
              <li
                key={c.id}
                className="flex flex-col gap-2 rounded-xl border border-zinc-200 bg-white px-4 py-3 shadow-sm sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <p className="text-sm font-medium text-zinc-900">{formatCard(c)}</p>
                  <p className="text-xs text-zinc-500">{c.name_on_card}</p>
                  {c.is_default ? (
                    <span className="mt-1 inline-block rounded-md border border-amber-200 bg-amber-50 px-2 py-0.5 text-xs text-amber-900">
                      Default
                    </span>
                  ) : null}
                </div>
                <div className="flex flex-wrap gap-2">
                  {!c.is_default ? (
                    <button
                      type="button"
                      disabled={pending}
                      onClick={() => {
                        setError(null);
                        start(async () => {
                          const r = await setDefaultSavedCard(c.id);
                          if (!r.ok) setError(r.message);
                          else router.refresh();
                        });
                      }}
                      className="text-xs font-medium text-teal-800 hover:underline disabled:opacity-50"
                    >
                      Set default
                    </button>
                  ) : null}
                  <button
                    type="button"
                    disabled={pending}
                    onClick={() => {
                      setError(null);
                      if (!window.confirm("Remove this card?")) return;
                      start(async () => {
                        const r = await deleteSavedCard(c.id);
                        if (!r.ok) setError(r.message);
                        else router.refresh();
                      });
                    }}
                    className="text-xs font-medium text-red-700 hover:underline disabled:opacity-50"
                  >
                    Remove
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      {showAdd ? (
        <AddCardModal
          onClose={() => {
            setShowAdd(false);
            router.refresh();
          }}
        />
      ) : null}
    </div>
  );
}
