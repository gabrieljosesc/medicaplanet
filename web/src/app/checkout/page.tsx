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
  const [shipDifferent, setShipDifferent] = useState(false);
  const [shippingExpanded, setShippingExpanded] = useState(true);
  const subtotal = lines.reduce((sum, l) => sum + l.unitPrice * l.quantity, 0);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setPending(true);
    const fd = new FormData(e.currentTarget);
    const billingLine1 = String(fd.get("billingLine1"));
    const billingCity = String(fd.get("billingCity"));
    const billingState = String(fd.get("billingState"));
    const billingPostalCode = String(fd.get("billingPostalCode"));
    const billingCountry = String(fd.get("billingCountry"));
    const shipToDifferentAddress = Boolean(fd.get("shipToDifferentAddress"));
    const res = await submitOrder({
      firstName: String(fd.get("firstName")),
      lastName: String(fd.get("lastName")),
      company: String(fd.get("company") || ""),
      email: String(fd.get("email")),
      phone: String(fd.get("phone") || ""),
      billingLine1,
      billingCity,
      billingState,
      billingPostalCode,
      billingCountry,
      shipToDifferentAddress,
      line1: shipToDifferentAddress ? String(fd.get("line1")) : billingLine1,
      line2: String(fd.get("line2") || ""),
      city: shipToDifferentAddress ? String(fd.get("city")) : billingCity,
      state: shipToDifferentAddress ? String(fd.get("state")) : billingState,
      postalCode: shipToDifferentAddress ? String(fd.get("postalCode")) : billingPostalCode,
      country: shipToDifferentAddress ? String(fd.get("country")) : billingCountry,
      customerNotes: String(fd.get("customerNotes") || ""),
      paymentNotes:
        `Payment method: ${String(fd.get("paymentMethod") || "credit_card")}` +
        (String(fd.get("paymentNotes") || "").trim()
          ? `\n${String(fd.get("paymentNotes"))}`
          : ""),
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
    <div className="mx-auto max-w-6xl">
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
      <ol className="mt-4 flex flex-wrap items-center gap-2 text-xs font-medium">
        <li className="rounded-full bg-emerald-100 px-3 py-1 text-emerald-900">1. Billing</li>
        <li className="rounded-full bg-zinc-100 px-3 py-1 text-zinc-700">2. Shipping</li>
        <li className="rounded-full bg-zinc-100 px-3 py-1 text-zinc-700">3. Review & submit</li>
      </ol>

      <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_22rem]">
        <form onSubmit={onSubmit} className="space-y-5">
          <section className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm">
            <h2 className="text-sm font-semibold text-zinc-900">Billing details</h2>
            <p className="mt-1 text-xs text-zinc-500">
              Required fields are used for invoice and verification records.
            </p>
            <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div>
                <label className="text-xs font-medium text-zinc-600">First name</label>
                <input name="firstName" required className="mt-1 w-full rounded-md border border-zinc-300 px-3 py-2 text-sm" />
              </div>
              <div>
                <label className="text-xs font-medium text-zinc-600">Last name</label>
                <input name="lastName" required className="mt-1 w-full rounded-md border border-zinc-300 px-3 py-2 text-sm" />
              </div>
              <div>
                <label className="text-xs font-medium text-zinc-600">Company (optional)</label>
                <input name="company" className="mt-1 w-full rounded-md border border-zinc-300 px-3 py-2 text-sm" />
              </div>
              <div>
                <label className="text-xs font-medium text-zinc-600">Email</label>
                <input name="email" type="email" required className="mt-1 w-full rounded-md border border-zinc-300 px-3 py-2 text-sm" />
              </div>
              <div className="sm:col-span-2">
                <label className="text-xs font-medium text-zinc-600">Billing address line 1</label>
                <input name="billingLine1" required className="mt-1 w-full rounded-md border border-zinc-300 px-3 py-2 text-sm" />
              </div>
              <div>
                <label className="text-xs font-medium text-zinc-600">Country</label>
                <input name="billingCountry" required defaultValue="United States (US)" className="mt-1 w-full rounded-md border border-zinc-300 px-3 py-2 text-sm" />
              </div>
              <div>
                <label className="text-xs font-medium text-zinc-600">City</label>
                <input name="billingCity" required className="mt-1 w-full rounded-md border border-zinc-300 px-3 py-2 text-sm" />
              </div>
              <div>
                <label className="text-xs font-medium text-zinc-600">State / province</label>
                <input name="billingState" required className="mt-1 w-full rounded-md border border-zinc-300 px-3 py-2 text-sm" />
              </div>
              <div>
                <label className="text-xs font-medium text-zinc-600">ZIP code</label>
                <input name="billingPostalCode" required className="mt-1 w-full rounded-md border border-zinc-300 px-3 py-2 text-sm" />
              </div>
              <div className="sm:col-span-2">
                <label className="text-xs font-medium text-zinc-600">Phone</label>
                <input name="phone" className="mt-1 w-full rounded-md border border-zinc-300 px-3 py-2 text-sm" />
              </div>
            </div>
          </section>

          <section className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm">
            <label className="flex items-start gap-2 text-sm text-zinc-700">
              <input
                type="checkbox"
                name="shipToDifferentAddress"
                value="1"
                checked={shipDifferent}
                onChange={(e) => {
                  const checked = e.target.checked;
                  setShipDifferent(checked);
                  if (checked) setShippingExpanded(true);
                }}
                className="mt-0.5 size-4 rounded border-zinc-400"
              />
              <span>Ship to a different address</span>
            </label>
            {shipDifferent ? (
              <>
                <div className="mt-3 flex items-center justify-between rounded-md bg-zinc-50 px-3 py-2">
                  <p className="text-xs text-zinc-600">Shipping fields are required when enabled.</p>
                  <button
                    type="button"
                    onClick={() => setShippingExpanded((v) => !v)}
                    className="text-xs font-medium text-emerald-800 hover:underline"
                  >
                    {shippingExpanded ? "Collapse" : "Expand"}
                  </button>
                </div>
                {shippingExpanded ? (
                  <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <div className="sm:col-span-2">
                      <label className="text-xs font-medium text-zinc-600">Shipping address line 1</label>
                      <input name="line1" required={shipDifferent} className="mt-1 w-full rounded-md border border-zinc-300 px-3 py-2 text-sm" />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="text-xs font-medium text-zinc-600">Shipping address line 2 (optional)</label>
                      <input name="line2" className="mt-1 w-full rounded-md border border-zinc-300 px-3 py-2 text-sm" />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-zinc-600">Shipping country</label>
                      <input name="country" required={shipDifferent} className="mt-1 w-full rounded-md border border-zinc-300 px-3 py-2 text-sm" />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-zinc-600">Shipping city</label>
                      <input name="city" required={shipDifferent} className="mt-1 w-full rounded-md border border-zinc-300 px-3 py-2 text-sm" />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-zinc-600">Shipping state / province</label>
                      <input name="state" required={shipDifferent} className="mt-1 w-full rounded-md border border-zinc-300 px-3 py-2 text-sm" />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-zinc-600">Shipping ZIP code</label>
                      <input name="postalCode" required={shipDifferent} className="mt-1 w-full rounded-md border border-zinc-300 px-3 py-2 text-sm" />
                    </div>
                  </div>
                ) : null}
              </>
            ) : null}
          </section>

          <section className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm">
            <p className="text-sm font-semibold text-zinc-900">Payment & order notes</p>
            <p className="mt-1 text-xs text-zinc-500">
              Select preferred payment route; CSR confirms final payment instructions after review.
            </p>
            <div className="mt-3 space-y-2 text-sm text-zinc-700">
              <label className="flex items-center gap-2">
                <input type="radio" name="paymentMethod" value="credit_card" defaultChecked className="size-4" />
                Credit card
              </label>
              <label className="flex items-center gap-2">
                <input type="radio" name="paymentMethod" value="bank_transfer" className="size-4" />
                Direct bank transfer
              </label>
            </div>
            <div className="mt-3">
              <label className="text-xs font-medium text-zinc-600">Order notes</label>
              <textarea name="customerNotes" rows={3} className="mt-1 w-full rounded-md border border-zinc-300 px-3 py-2 text-sm" />
            </div>
            <div className="mt-3">
              <label className="text-xs font-medium text-zinc-600">Payment / callback notes (optional)</label>
              <textarea name="paymentNotes" rows={2} className="mt-1 w-full rounded-md border border-zinc-300 px-3 py-2 text-sm" />
            </div>
          </section>

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
            {pending ? "Submitting..." : "Place order (CSR verification & follow-up)"}
          </button>
        </form>

        <aside className="lg:sticky lg:top-24 lg:self-start">
          <div className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm">
            <h2 className="text-sm font-semibold text-zinc-900">Your order</h2>
            <ul className="mt-3 space-y-2 border-b border-zinc-200 pb-3 text-sm">
              {lines.map((l) => (
                <li key={l.slug} className="flex items-start justify-between gap-3">
                  <span className="text-zinc-700">
                    {l.title} <span className="text-zinc-500">× {l.quantity}</span>
                  </span>
                  <span className="font-medium text-zinc-900">
                    ${Number(l.unitPrice * l.quantity).toFixed(2)}
                  </span>
                </li>
              ))}
            </ul>
            <div className="mt-3 space-y-1 text-sm">
              <p className="flex items-center justify-between text-zinc-600">
                <span>Subtotal</span>
                <span>${subtotal.toFixed(2)}</span>
              </p>
              <p className="flex items-center justify-between text-zinc-600">
                <span>Shipping</span>
                <span>CSR quote</span>
              </p>
              <p className="flex items-center justify-between border-t border-zinc-200 pt-2 font-semibold text-zinc-900">
                <span>Total</span>
                <span>${subtotal.toFixed(2)}</span>
              </p>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}