"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/context/cart-context";
import { submitOrder } from "@/app/actions/orders";
import { createClient } from "@/lib/supabase/client";

type ReviewSummary = {
  fullName: string;
  email: string;
  phone: string;
  company: string;
  doctorName: string;
  doctorLicenseNumber: string;
  doctorLicenseExpiry: string;
  billingAddress: string;
  shippingAddress: string;
  paymentMethod: string;
};

export default function CheckoutPage() {
  const { lines, selectedLines, removeLine } = useCart();
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [stepError, setStepError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [shipDifferent, setShipDifferent] = useState(false);
  const [shippingExpanded, setShippingExpanded] = useState(true);
  const [review, setReview] = useState<ReviewSummary | null>(null);
  const [prefillLoading, setPrefillLoading] = useState(true);
  const [prefill, setPrefill] = useState({
    firstName: "",
    lastName: "",
    doctorName: "",
    email: "",
    phone: "",
    company: "",
    billingLine1: "",
    billingCountry: "United States (US)",
    billingCity: "",
    billingState: "",
    billingPostalCode: "",
    doctorLicenseNumber: "",
    doctorLicenseExpiry: "",
  });
  const subtotal = selectedLines.reduce((sum, l) => sum + l.unitPrice * l.quantity, 0);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    let mounted = true;
    async function loadPrefill() {
      try {
        const supabase = createClient();
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!user || !mounted) return;
        const { data: profile } = await supabase
          .from("profiles")
          .select(
            "first_name,last_name,full_name,email,phone,company,delivery_address,country,city,state,postal_code,license_number,license_expiry"
          )
          .eq("id", user.id)
          .single();
        if (!profile || !mounted) return;
        setPrefill((v) => ({
          ...v,
          firstName: profile.first_name ?? v.firstName,
          lastName: profile.last_name ?? v.lastName,
          doctorName: profile.full_name ?? `${profile.first_name ?? ""} ${profile.last_name ?? ""}`.trim(),
          email: profile.email ?? user.email ?? v.email,
          phone: profile.phone ?? v.phone,
          company: profile.company ?? v.company,
          billingLine1: profile.delivery_address ?? v.billingLine1,
          billingCountry: profile.country ?? v.billingCountry,
          billingCity: profile.city ?? v.billingCity,
          billingState: profile.state ?? v.billingState,
          billingPostalCode: profile.postal_code ?? v.billingPostalCode,
          doctorLicenseNumber: profile.license_number ?? v.doctorLicenseNumber,
          doctorLicenseExpiry: profile.license_expiry
            ? String(profile.license_expiry).slice(0, 10)
            : v.doctorLicenseExpiry,
        }));
      } finally {
        if (mounted) setPrefillLoading(false);
      }
    }
    void loadPrefill();
    return () => {
      mounted = false;
    };
  }, []);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (step !== 3) return;
    setError(null);
    setStepError(null);
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
      doctorName: String(fd.get("doctorName") || ""),
      doctorLicenseNumber: String(fd.get("doctorLicenseNumber") || ""),
      doctorLicenseExpiry: String(fd.get("doctorLicenseExpiry") || ""),
      policyAccepted: Boolean(fd.get("policyAck")),
      items: selectedLines.map((l) => ({ slug: l.slug, quantity: l.quantity })),
    });
    setPending(false);
    if (!res.ok) {
      setError(res.message);
      return;
    }
    selectedLines.forEach((l) => removeLine(l.slug));
    router.push(`/checkout/success?id=${res.orderId}`);
  }

  function validateStep(targetStep: 1 | 2 | 3): boolean {
    const form = formRef.current;
    if (!form) return false;
    const container = form.querySelector<HTMLElement>(`[data-step="${targetStep}"]`);
    if (!container) return false;
    const controls = container.querySelectorAll<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>(
      "input, select, textarea"
    );
    for (const el of controls) {
      if (!el.willValidate) continue;
      if (!el.checkValidity()) {
        el.reportValidity();
        return false;
      }
    }
    return true;
  }

  function buildReviewSummary(): ReviewSummary | null {
    const form = formRef.current;
    if (!form) return null;
    const fd = new FormData(form);
    const firstName = String(fd.get("firstName") || "").trim();
    const lastName = String(fd.get("lastName") || "").trim();
    const billingLine1 = String(fd.get("billingLine1") || "").trim();
    const billingCity = String(fd.get("billingCity") || "").trim();
    const billingState = String(fd.get("billingState") || "").trim();
    const billingPostalCode = String(fd.get("billingPostalCode") || "").trim();
    const billingCountry = String(fd.get("billingCountry") || "").trim();
    const shipToDifferentAddress = Boolean(fd.get("shipToDifferentAddress"));
    const paymentMethodRaw = String(fd.get("paymentMethod") || "credit_card");
    const paymentMethod =
      paymentMethodRaw === "bank_transfer" ? "Direct bank transfer" : "Credit card";

    const billingAddress = [billingLine1, `${billingCity}, ${billingState} ${billingPostalCode}`.trim(), billingCountry]
      .filter(Boolean)
      .join(" · ");
    const shippingAddress = shipToDifferentAddress
      ? [
          String(fd.get("line1") || "").trim(),
          String(fd.get("line2") || "").trim(),
          `${String(fd.get("city") || "").trim()}, ${String(fd.get("state") || "").trim()} ${String(fd.get("postalCode") || "").trim()}`.trim(),
          String(fd.get("country") || "").trim(),
        ]
          .filter(Boolean)
          .join(" · ")
      : billingAddress;

    return {
      fullName: `${firstName} ${lastName}`.trim(),
      email: String(fd.get("email") || "").trim(),
      phone: String(fd.get("phone") || "").trim() || "Not provided",
      company: String(fd.get("company") || "").trim() || "Not provided",
      doctorName: String(fd.get("doctorName") || "").trim(),
      doctorLicenseNumber: String(fd.get("doctorLicenseNumber") || "").trim(),
      doctorLicenseExpiry: String(fd.get("doctorLicenseExpiry") || "").trim(),
      billingAddress,
      shippingAddress,
      paymentMethod,
    };
  }

  function goNext() {
    setError(null);
    if (!validateStep(step)) {
      setStepError("Please complete required fields in this step.");
      return;
    }
    setStepError(null);
    if (step === 2) {
      setReview(buildReviewSummary());
    }
    setStep((s) => (s < 3 ? ((s + 1) as 1 | 2 | 3) : s));
  }

  function goBack() {
    setError(null);
    setStepError(null);
    setStep((s) => (s > 1 ? ((s - 1) as 1 | 2 | 3) : s));
  }

  if (lines.length === 0) {
    return (
      <p className="text-sm text-zinc-600">
        Your cart is empty. Add products before checkout.
      </p>
    );
  }

  if (selectedLines.length === 0) {
    return (
      <p className="text-sm text-zinc-600">
        No selected items for checkout. Go back to <Link href="/cart" className="font-medium text-emerald-800 hover:underline">cart</Link> and select product(s).
      </p>
    );
  }

  if (prefillLoading) {
    return <p className="text-sm text-zinc-600">Loading checkout details...</p>;
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
        <li className={`rounded-full px-3 py-1 ${step >= 1 ? "bg-emerald-100 text-emerald-900" : "bg-zinc-100 text-zinc-700"}`}>1. Billing</li>
        <li className={`rounded-full px-3 py-1 ${step >= 2 ? "bg-emerald-100 text-emerald-900" : "bg-zinc-100 text-zinc-700"}`}>2. Shipping</li>
        <li className={`rounded-full px-3 py-1 ${step >= 3 ? "bg-emerald-100 text-emerald-900" : "bg-zinc-100 text-zinc-700"}`}>3. Review & submit</li>
      </ol>

      <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_22rem]">
        <form ref={formRef} onSubmit={onSubmit} className="space-y-5">
          <div data-step="1" className={step === 1 ? "space-y-5" : "hidden"}>
          <section className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm">
            <h2 className="text-sm font-semibold text-zinc-900">Billing details</h2>
            <p className="mt-1 text-xs text-zinc-500">
              Required fields are used for invoice and verification records.
            </p>
            <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div>
                <label className="text-xs font-medium text-zinc-600">First name</label>
                <input name="firstName" defaultValue={prefill.firstName} required className="mt-1 w-full rounded-md border border-zinc-300 px-3 py-2 text-sm" />
              </div>
              <div>
                <label className="text-xs font-medium text-zinc-600">Last name</label>
                <input name="lastName" defaultValue={prefill.lastName} required className="mt-1 w-full rounded-md border border-zinc-300 px-3 py-2 text-sm" />
              </div>
              <div>
                <label className="text-xs font-medium text-zinc-600">Company (optional)</label>
                <input name="company" defaultValue={prefill.company} className="mt-1 w-full rounded-md border border-zinc-300 px-3 py-2 text-sm" />
              </div>
              <div>
                <label className="text-xs font-medium text-zinc-600">Email</label>
                <input name="email" type="email" defaultValue={prefill.email} required className="mt-1 w-full rounded-md border border-zinc-300 px-3 py-2 text-sm" />
              </div>
              <div>
                <label className="text-xs font-medium text-zinc-600">Doctor's name</label>
                <input name="doctorName" defaultValue={prefill.doctorName} required className="mt-1 w-full rounded-md border border-zinc-300 px-3 py-2 text-sm" />
              </div>
              <div>
                <label className="text-xs font-medium text-zinc-600">Doctor's license number</label>
                <input name="doctorLicenseNumber" defaultValue={prefill.doctorLicenseNumber} required className="mt-1 w-full rounded-md border border-zinc-300 px-3 py-2 text-sm" />
              </div>
              <div>
                <label className="text-xs font-medium text-zinc-600">Expiration date of license</label>
                <input name="doctorLicenseExpiry" type="date" defaultValue={prefill.doctorLicenseExpiry} required className="mt-1 w-full rounded-md border border-zinc-300 px-3 py-2 text-sm" />
              </div>
              <div className="sm:col-span-2">
                <label className="text-xs font-medium text-zinc-600">Billing address line 1</label>
                <input name="billingLine1" defaultValue={prefill.billingLine1} required className="mt-1 w-full rounded-md border border-zinc-300 px-3 py-2 text-sm" />
              </div>
              <div>
                <label className="text-xs font-medium text-zinc-600">Country</label>
                <input name="billingCountry" required defaultValue={prefill.billingCountry} className="mt-1 w-full rounded-md border border-zinc-300 px-3 py-2 text-sm" />
              </div>
              <div>
                <label className="text-xs font-medium text-zinc-600">City</label>
                <input name="billingCity" defaultValue={prefill.billingCity} required className="mt-1 w-full rounded-md border border-zinc-300 px-3 py-2 text-sm" />
              </div>
              <div>
                <label className="text-xs font-medium text-zinc-600">State / province</label>
                <input name="billingState" defaultValue={prefill.billingState} required className="mt-1 w-full rounded-md border border-zinc-300 px-3 py-2 text-sm" />
              </div>
              <div>
                <label className="text-xs font-medium text-zinc-600">ZIP code</label>
                <input name="billingPostalCode" defaultValue={prefill.billingPostalCode} required className="mt-1 w-full rounded-md border border-zinc-300 px-3 py-2 text-sm" />
              </div>
              <div className="sm:col-span-2">
                <label className="text-xs font-medium text-zinc-600">Phone</label>
                <input name="phone" defaultValue={prefill.phone} className="mt-1 w-full rounded-md border border-zinc-300 px-3 py-2 text-sm" />
              </div>
            </div>
          </section>
          </div>

          <div data-step="2" className={step === 2 ? "space-y-5" : "hidden"}>
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
          </div>

          <div data-step="3" className={step === 3 ? "space-y-5" : "hidden"}>
          <section className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm">
            <h2 className="text-sm font-semibold text-zinc-900">Review details before submit</h2>
            <p className="mt-1 text-xs text-zinc-500">
              Confirm your billing details, shipping preference, and order notes are correct, then submit.
            </p>
            {review ? (
              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-3">
                  <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">Contact</p>
                  <p className="mt-1 text-sm font-medium text-zinc-900">{review.fullName}</p>
                  <p className="text-sm text-zinc-700">{review.email}</p>
                  <p className="text-sm text-zinc-700">{review.phone}</p>
                  <p className="text-xs text-zinc-500">Company: {review.company}</p>
                </div>
                <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-3">
                  <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">License</p>
                  <p className="mt-1 text-sm font-medium text-zinc-900">{review.doctorName}</p>
                  <p className="text-sm text-zinc-700">License #: {review.doctorLicenseNumber}</p>
                  <p className="text-sm text-zinc-700">Expiry: {review.doctorLicenseExpiry}</p>
                </div>
                <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-3 sm:col-span-2">
                  <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">Addresses</p>
                  <p className="mt-1 text-sm text-zinc-700">
                    <span className="font-medium text-zinc-900">Billing:</span> {review.billingAddress}
                  </p>
                  <p className="mt-1 text-sm text-zinc-700">
                    <span className="font-medium text-zinc-900">Shipping:</span> {review.shippingAddress}
                  </p>
                  <p className="mt-1 text-sm text-zinc-700">
                    <span className="font-medium text-zinc-900">Payment method:</span> {review.paymentMethod}
                  </p>
                </div>
              </div>
            ) : null}
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
          </div>

          {stepError && <p className="text-sm text-red-700">{stepError}</p>}
          {error && <p className="text-sm text-red-700">{error}</p>}
          <div className="flex flex-wrap items-center gap-3">
            {step > 1 ? (
              <button
                type="button"
                onClick={goBack}
                className="rounded-full border border-zinc-300 px-5 py-2.5 text-sm font-semibold text-zinc-700 hover:bg-zinc-50"
              >
                Back
              </button>
            ) : null}
            {step < 3 ? (
              <button
                type="button"
                onClick={goNext}
                className="rounded-full bg-emerald-800 px-5 py-2.5 text-sm font-semibold text-white hover:bg-emerald-900"
              >
                Continue to {step === 1 ? "Shipping" : "Review"}
              </button>
            ) : (
              <button
                type="submit"
                disabled={pending}
                className="rounded-full bg-emerald-800 px-5 py-2.5 text-sm font-semibold text-white hover:bg-emerald-900 disabled:opacity-60"
              >
                {pending ? "Submitting..." : "Place order"}
              </button>
            )}
          </div>
        </form>

        <aside className="lg:sticky lg:top-24 lg:self-start">
          <div className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm">
            <h2 className="text-sm font-semibold text-zinc-900">Your order</h2>
            <ul className="mt-3 space-y-2 border-b border-zinc-200 pb-3 text-sm">
              {selectedLines.map((l) => (
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