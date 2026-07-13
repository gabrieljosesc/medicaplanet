"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { updateOrderPaymentAction } from "@/app/actions/order-payment";
import { formatExpiryMmYyInput } from "@/lib/card-validation";

export function UpdatePaymentForm({ orderId }: { orderId: string }) {
  const router = useRouter();
  const [expiry, setExpiry] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");
  const [message, setMessage] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("loading");
    setMessage("");
    const formData = new FormData(e.currentTarget);
    const res = await updateOrderPaymentAction(formData);
    if (res.ok) {
      router.push(`/account/orders/${orderId}?payment_updated=1`);
    } else {
      setStatus("error");
      setMessage(res.message);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <input type="hidden" name="order_id" value={orderId} />

      <div>
        <label htmlFor="card_number" className="text-xs font-medium text-zinc-600">
          Card number
        </label>
        <input
          id="card_number"
          name="card_number"
          inputMode="numeric"
          autoComplete="cc-number"
          required
          placeholder="1234 5678 9012 3456"
          className="mt-1 w-full rounded-md border border-zinc-300 px-3 py-2 text-sm"
        />
      </div>

      <div>
        <label htmlFor="name_on_card" className="text-xs font-medium text-zinc-600">
          Name on card
        </label>
        <input
          id="name_on_card"
          name="name_on_card"
          autoComplete="cc-name"
          required
          className="mt-1 w-full rounded-md border border-zinc-300 px-3 py-2 text-sm"
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label htmlFor="expiry" className="text-xs font-medium text-zinc-600">
            Expiry (MM/YY)
          </label>
          <input
            id="expiry"
            name="expiry"
            inputMode="numeric"
            autoComplete="cc-exp"
            required
            placeholder="08/27"
            value={expiry}
            onChange={(e) => setExpiry(formatExpiryMmYyInput(e.target.value))}
            className="mt-1 w-full rounded-md border border-zinc-300 px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label htmlFor="cvv" className="text-xs font-medium text-zinc-600">
            CVV
          </label>
          <input
            id="cvv"
            name="cvv"
            inputMode="numeric"
            autoComplete="cc-csc"
            required
            maxLength={4}
            placeholder="123"
            className="mt-1 w-full rounded-md border border-zinc-300 px-3 py-2 text-sm"
          />
        </div>
      </div>

      {status === "error" && message ? (
        <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{message}</p>
      ) : null}

      <button
        type="submit"
        disabled={status === "loading"}
        className="w-full rounded-full bg-teal-800 px-6 py-2.5 text-sm font-semibold text-white hover:bg-teal-900 disabled:opacity-50"
      >
        {status === "loading" ? "Saving…" : "Update payment details"}
      </button>
    </form>
  );
}
