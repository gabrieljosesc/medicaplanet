"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/context/cart-context";
import { submitOrder } from "@/app/actions/orders";

export default function CheckoutPage() {
  const { lines, clear } = useCart();
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setPending(true);
    const fd = new FormData(e.currentTarget);
    const res = await submitOrder({
      email: String(fd.get("email")),
      fullName: String(fd.get("fullName")),
      phone: String(fd.get("phone") || ""),
      line1: String(fd.get("line1")),
      line2: String(fd.get("line2") || ""),
      city: String(fd.get("city")),
      state: String(fd.get("state")),
      postalCode: String(fd.get("postalCode")),
      country: String(fd.get("country")),
      customerNotes: String(fd.get("customerNotes") || ""),
      paymentNotes: String(fd.get("paymentNotes") || ""),
      policyAccepted: Boolean(fd.get("policyAck")),
      items: lines.map((l) => ({ slug: l.slug, quantity: l.quantity })),
    });
    setPending(false);
    if (!res.ok) {
      setError(res.message);
      return;
    }
    clear();
    router.push(`/checkout/success?id=${res.orderId}`);
  }

  if (lines.length === 0) {
    return (
      <p className="text-sm text-zinc-600">
        Your cart is empty. Add products before checkout.
      </p>
    );
  }

  return (
    <div className="mx-auto max-w-xl">
      <h1 className="text-2xl font-semibold text-zinc-900">Checkout</h1>
      <p className="mt-2 text-sm text-zinc-600">
        No card is charged at checkout. CSR reviews each order for professional verification,
        compliance, and shipping constraints, then confirms payment and dispatch with you.
      </p>
      <p className="mt-2 text-xs text-zinc-600">
        By submitting, you agree to our <Link href="/legal/terms" className="underline hover:no-underline">Terms of Supply</Link>,{" "}
        <Link href="/legal/shipping-cold-chain" className="underline hover:no-underline">Shipping & Cold-Chain Policy</Link>, and{" "}
        <Link href="/legal/returns-cancellations" className="underline hover:no-underline">Returns & Cancellations Policy</Link>.
      </p>

      <form onSubmit={onSubmit} className="mt-6 space-y-4">
        <div>
          <label className="text-xs font-medium text-zinc-600">Email</label>
          <input name="email" type="email" required className="mt-1 w-full rounded-md border border-zinc-300 px-3 py-2 text-sm" />
        </div>
        <div>
          <label className="text-xs font-medium text-zinc-600">Full name</label>
          <input name="fullName" required className="mt-1 w-full rounded-md border border-zinc-300 px-3 py-2 text-sm" />
        </div>
        <div>
          <label className="text-xs font-medium text-zinc-600">Phone</label>
          <input name="phone" className="mt-1 w-full rounded-md border border-zinc-300 px-3 py-2 text-sm" />
        </div>
        <div>
          <label className="text-xs font-medium text-zinc-600">Address line 1</label>
          <input name="line1" required className="mt-1 w-full rounded-md border border-zinc-300 px-3 py-2 text-sm" />
        </div>
        <div>
          <label className="text-xs font-medium text-zinc-600">Address line 2</label>
          <input name="line2" className="mt-1 w-full rounded-md border border-zinc-300 px-3 py-2 text-sm" />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-medium text-zinc-600">City</label>
            <input name="city" required className="mt-1 w-full rounded-md border border-zinc-300 px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="text-xs font-medium text-zinc-600">State / province</label>
            <input name="state" required className="mt-1 w-full rounded-md border border-zinc-300 px-3 py-2 text-sm" />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-medium text-zinc-600">Postal code</label>
            <input name="postalCode" required className="mt-1 w-full rounded-md border border-zinc-300 px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="text-xs font-medium text-zinc-600">Country</label>
            <input name="country" required defaultValue="USA" className="mt-1 w-full rounded-md border border-zinc-300 px-3 py-2 text-sm" />
          </div>
        </div>
        <div>
          <label className="text-xs font-medium text-zinc-600">Order notes</label>
          <textarea name="customerNotes" rows={3} className="mt-1 w-full rounded-md border border-zinc-300 px-3 py-2 text-sm" />
        </div>
        <div>
          <label className="text-xs font-medium text-zinc-600">Payment / callback notes (optional)</label>
          <textarea name="paymentNotes" rows={2} className="mt-1 w-full rounded-md border border-zinc-300 px-3 py-2 text-sm" />
        </div>
        <label className="flex items-start gap-2 text-xs text-zinc-700">
          <input
            type="checkbox"
            name="policyAck"
            value="1"
            required
            className="mt-0.5 size-4 rounded border-zinc-400"
          />
          <span>
            I confirm this purchase is for authorized professional use and that product handling at
            delivery will follow required storage and local regulatory standards.
          </span>
        </label>
        {error && <p className="text-sm text-red-700">{error}</p>}
        <button
          type="submit"
          disabled={pending}
          className="w-full rounded-full bg-emerald-800 py-3 text-sm font-semibold text-white hover:bg-emerald-900 disabled:opacity-60"
        >
          {pending ? "Submitting…" : "Place order (CSR verification & follow-up)"}
        </button>
      </form>
    </div>
  );
}