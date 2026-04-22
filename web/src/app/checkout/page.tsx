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
  company: string;
  doctorName: string;
  doctorLicenseNumber: string;
  doctorLicenseExpiry: string;
  shippingAddress: string;
  paymentMethod: string;
  cardSummary?: string;
};

type SavedCardRow = {
  id: string;
  brand: string | null;
  last4: string;
  exp_month: number;
  exp_year: number;
  name_on_card: string;
  is_default: boolean;
};

type SavedAddressRow = {
  id: string;
  label: string | null;
  recipient_name: string;
  phone: string | null;
  line1: string;
  line2: string | null;
  city: string | null;
  state: string | null;
  postal_code: string | null;
  country: string | null;
  is_default: boolean;
};

type ShippingFields = {
  recipientName: string;
  phone: string;
  line1: string;
  line2: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
};

const emptyShipping: ShippingFields = {
  recipientName: "",
  phone: "",
  line1: "",
  line2: "",
  city: "",
  state: "",
  postalCode: "",
  country: "",
};

export default function CheckoutPage() {
  const { lines, selectedLines, removeLine } = useCart();
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [stepError, setStepError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [review, setReview] = useState<ReviewSummary | null>(null);
  const [prefillLoading, setPrefillLoading] = useState(true);
  const [prefill, setPrefill] = useState({
    firstName: "",
    lastName: "",
    doctorName: "",
    email: "",
    company: "",
    doctorLicenseNumber: "",
    doctorLicenseExpiry: "",
  });
  const [savedAddresses, setSavedAddresses] = useState<SavedAddressRow[]>([]);
  const [addressMode, setAddressMode] = useState<"saved" | "manual">("manual");
  const [selectedSavedId, setSelectedSavedId] = useState<string | null>(null);
  const [shipping, setShipping] = useState<ShippingFields>(emptyShipping);
  const [savedCards, setSavedCards] = useState<SavedCardRow[]>([]);
  const [checkoutPayment, setCheckoutPayment] = useState<"saved_card" | "bank_transfer">("bank_transfer");
  const [selectedCardId, setSelectedCardId] = useState<string | null>(null);

  const subtotal = selectedLines.reduce((sum, l) => sum + l.unitPrice * l.quantity, 0);
  const formRef = useRef<HTMLFormElement>(null);

  function applySavedRow(row: SavedAddressRow) {
    setShipping({
      recipientName: row.recipient_name,
      phone: row.phone ?? "",
      line1: row.line1,
      line2: row.line2 ?? "",
      city: row.city ?? "",
      state: row.state ?? "",
      postalCode: row.postal_code ?? "",
      country: row.country ?? "",
    });
  }

  useEffect(() => {
    let mounted = true;
    async function loadPrefill() {
      try {
        const supabase = createClient();
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!user || !mounted) return;

        const [{ data: profile }, { data: addrRows }, cardRes] = await Promise.all([
          supabase
            .from("profiles")
            .select(
              "first_name,last_name,full_name,email,phone,company,delivery_address,country,city,state,postal_code,license_number,license_expiry"
            )
            .eq("id", user.id)
            .single(),
          supabase
            .from("user_addresses")
            .select("id,label,recipient_name,phone,line1,line2,city,state,postal_code,country,is_default")
            .eq("user_id", user.id)
            .order("is_default", { ascending: false }),
          supabase
            .from("user_saved_cards")
            .select("id,brand,last4,exp_month,exp_year,name_on_card,is_default")
            .eq("user_id", user.id)
            .order("is_default", { ascending: false }),
        ]);
        const cardRows = cardRes.error ? null : cardRes.data;

        if (!mounted) return;

        if (profile) {
          const fn = profile.first_name ?? "";
          const ln = profile.last_name ?? "";
          setPrefill({
            firstName: fn,
            lastName: ln,
            doctorName: profile.full_name ?? `${fn} ${ln}`.trim(),
            email: profile.email ?? user.email ?? "",
            company: profile.company ?? "",
            doctorLicenseNumber: profile.license_number ?? "",
            doctorLicenseExpiry: profile.license_expiry ? String(profile.license_expiry).slice(0, 10) : "",
          });
        }

        const list = (addrRows ?? []) as SavedAddressRow[];
        setSavedAddresses(list);

        const cards = (cardRows ?? []) as SavedCardRow[];
        setSavedCards(cards);
        if (cards.length > 0) {
          const cdef = cards.find((c) => c.is_default) ?? cards[0];
          setSelectedCardId(cdef.id);
          setCheckoutPayment("saved_card");
        } else {
          setSelectedCardId(null);
          setCheckoutPayment("bank_transfer");
        }

        if (list.length > 0) {
          const def = list.find((a) => a.is_default) ?? list[0];
          setAddressMode("saved");
          setSelectedSavedId(def.id);
          applySavedRow(def);
        } else if (profile) {
          setAddressMode("manual");
          setSelectedSavedId(null);
          setShipping({
            recipientName: profile.full_name ?? `${profile.first_name ?? ""} ${profile.last_name ?? ""}`.trim(),
            phone: profile.phone ?? "",
            line1: profile.delivery_address ?? "",
            line2: "",
            city: profile.city ?? "",
            state: profile.state ?? "",
            postalCode: profile.postal_code ?? "",
            country: profile.country ?? "",
          });
        }
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
    const res = await submitOrder({
      firstName: String(fd.get("firstName")),
      lastName: String(fd.get("lastName")),
      company: String(fd.get("company") || ""),
      email: String(fd.get("email")),
      phone: shipping.phone.trim(),
      recipientName: shipping.recipientName.trim(),
      line1: shipping.line1.trim(),
      line2: shipping.line2.trim(),
      city: shipping.city.trim(),
      state: shipping.state.trim(),
      postalCode: shipping.postalCode.trim(),
      country: shipping.country.trim(),
      customerNotes: String(fd.get("customerNotes") || ""),
      paymentNotes: String(fd.get("paymentNotes") || "").trim() || undefined,
      doctorName: String(fd.get("doctorName") || ""),
      doctorLicenseNumber: String(fd.get("doctorLicenseNumber") || ""),
      doctorLicenseExpiry: String(fd.get("doctorLicenseExpiry") || ""),
      policyAccepted: Boolean(fd.get("policyAck")),
      items: selectedLines.map((l) => ({ slug: l.slug, quantity: l.quantity })),
      checkoutType: checkoutPayment === "saved_card" && selectedCardId ? "saved_manual_card" : "bank_transfer",
      userSavedCardId: checkoutPayment === "saved_card" && selectedCardId ? selectedCardId : undefined,
    });
    setPending(false);
    if (!res.ok) {
      setError(res.message);
      return;
    }
    selectedLines.forEach((l) => removeLine(l.slug));
    router.push(`/checkout/success?id=${res.orderId}`);
  }

  function validateStep(targetStep: 1 | 2 | 3): { ok: true } | { ok: false; message: string } {
    const form = formRef.current;
    if (!form) return { ok: false, message: "Form is not ready yet." };
    if (targetStep === 2) {
      if (addressMode === "saved" && savedAddresses.length > 0) {
        if (!selectedSavedId) {
          return { ok: false, message: "Please choose a saved shipping address." };
        }
      }
      const s = shipping;
      const required = [s.recipientName, s.phone, s.line1, s.city, s.state, s.postalCode, s.country];
      if (required.some((v) => !String(v).trim())) {
        return { ok: false, message: "Please complete all required shipping address fields." };
      }
      if (String(s.phone).trim().length < 3) {
        return { ok: false, message: "Please enter a valid phone number for shipping." };
      }
      if (checkoutPayment === "saved_card") {
        if (savedCards.length === 0) {
          return { ok: false, message: "Add a card under Banks & cards, or choose bank transfer." };
        }
        if (!selectedCardId) {
          return { ok: false, message: "Please select a saved card, or choose direct bank transfer." };
        }
      }
    }
    const container = form.querySelector<HTMLElement>(`[data-step="${targetStep}"]`);
    if (!container) return { ok: false, message: "Missing step content." };
    const controls = container.querySelectorAll<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>(
      "input, select, textarea"
    );
    for (const el of controls) {
      if (!el.willValidate) continue;
      if (!el.checkValidity()) {
        el.reportValidity();
        return { ok: false, message: "Please complete required fields in this step." };
      }
    }
    return { ok: true };
  }

  function buildReviewSummary(): ReviewSummary | null {
    const form = formRef.current;
    if (!form) return null;
    const fd = new FormData(form);
    const firstName = String(fd.get("firstName") || "").trim();
    const lastName = String(fd.get("lastName") || "").trim();
    const card = savedCards.find((c) => c.id === selectedCardId);
    const paymentMethod =
      checkoutPayment === "saved_card" && card
        ? `Saved card · ${card.brand ?? "card"} ····${card.last4}`
        : "Direct bank transfer";
    const cardSummary =
      checkoutPayment === "saved_card" && card
        ? `${card.brand ?? "Card"} ····${card.last4} · exp ${String(card.exp_month).padStart(2, "0")}/${String(card.exp_year).slice(-2)} · ${card.name_on_card}`
        : undefined;

    const shippingAddress = [
      `${shipping.recipientName} · ${shipping.phone}`.trim(),
      shipping.line1,
      shipping.line2.trim() ? shipping.line2 : null,
      `${shipping.city}, ${shipping.state} ${shipping.postalCode}`.trim(),
      shipping.country,
    ]
      .filter(Boolean)
      .join(" · ");

    return {
      fullName: `${firstName} ${lastName}`.trim(),
      email: String(fd.get("email") || "").trim(),
      company: String(fd.get("company") || "").trim() || "Not provided",
      doctorName: String(fd.get("doctorName") || "").trim(),
      doctorLicenseNumber: String(fd.get("doctorLicenseNumber") || "").trim(),
      doctorLicenseExpiry: String(fd.get("doctorLicenseExpiry") || "").trim(),
      shippingAddress,
      paymentMethod,
      cardSummary,
    };
  }

  function goNext() {
    setError(null);
    const v = validateStep(step);
    if (!v.ok) {
      setStepError(v.message);
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

  function onPickSaved(id: string) {
    const row = savedAddresses.find((a) => a.id === id);
    if (!row) return;
    setSelectedSavedId(id);
    applySavedRow(row);
  }

  if (lines.length === 0) {
    return <p className="text-sm text-zinc-600">Your cart is empty. Add products before checkout.</p>;
  }

  if (selectedLines.length === 0) {
    return (
      <p className="text-sm text-zinc-600">
        No selected items for checkout. Go back to{" "}
        <Link href="/cart" className="font-medium text-emerald-800 hover:underline">
          cart
        </Link>{" "}
        and select product(s).
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
        No card is charged at checkout. CSR reviews each order for professional verification, compliance, and shipping
        constraints, then confirms payment and dispatch with you.
      </p>
      <p className="mt-2 text-xs text-zinc-600">
        By submitting, you agree to our{" "}
        <Link href="/legal/terms" className="underline hover:no-underline">
          Terms of Supply
        </Link>
        ,{" "}
        <Link href="/legal/shipping-cold-chain" className="underline hover:no-underline">
          Shipping & Cold-Chain Policy
        </Link>
        , and{" "}
        <Link href="/legal/returns-cancellations" className="underline hover:no-underline">
          Returns & Cancellations Policy
        </Link>
        .
      </p>
      <ol className="mt-4 flex flex-wrap items-center gap-2 text-xs font-medium">
        <li className={`rounded-full px-3 py-1 ${step >= 1 ? "bg-emerald-100 text-emerald-900" : "bg-zinc-100 text-zinc-700"}`}>
          1. Contact
        </li>
        <li className={`rounded-full px-3 py-1 ${step >= 2 ? "bg-emerald-100 text-emerald-900" : "bg-zinc-100 text-zinc-700"}`}>
          2. Shipping & payment
        </li>
        <li className={`rounded-full px-3 py-1 ${step >= 3 ? "bg-emerald-100 text-emerald-900" : "bg-zinc-100 text-zinc-700"}`}>
          3. Review & submit
        </li>
      </ol>

      <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_22rem]">
        <form ref={formRef} onSubmit={onSubmit} className="space-y-5">
          <div data-step="1" className={step === 1 ? "space-y-5" : "hidden"}>
            <section className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm">
              <h2 className="text-sm font-semibold text-zinc-900">Contact & license</h2>
              <p className="mt-1 text-xs text-zinc-500">Used for verification and order correspondence.</p>
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
                  <label className="text-xs font-medium text-zinc-600">Doctor&apos;s name</label>
                  <input name="doctorName" defaultValue={prefill.doctorName} required className="mt-1 w-full rounded-md border border-zinc-300 px-3 py-2 text-sm" />
                </div>
                <div>
                  <label className="text-xs font-medium text-zinc-600">Doctor&apos;s license number</label>
                  <input name="doctorLicenseNumber" defaultValue={prefill.doctorLicenseNumber} required className="mt-1 w-full rounded-md border border-zinc-300 px-3 py-2 text-sm" />
                </div>
                <div className="sm:col-span-2">
                  <label className="text-xs font-medium text-zinc-600">Expiration date of license</label>
                  <input name="doctorLicenseExpiry" type="date" defaultValue={prefill.doctorLicenseExpiry} required className="mt-1 w-full rounded-md border border-zinc-300 px-3 py-2 text-sm" />
                </div>
              </div>
            </section>
          </div>

          <div data-step="2" className={step === 2 ? "space-y-5" : "hidden"}>
            <section className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h2 className="text-sm font-semibold text-zinc-900">Shipping address</h2>
                  <p className="mt-1 text-xs text-zinc-500">Where we should ship this order. Phone is used for delivery coordination.</p>
                </div>
                <Link href="/account/addresses" className="text-xs font-medium text-emerald-800 hover:underline">
                  Manage saved addresses
                </Link>
              </div>

              {savedAddresses.length > 0 ? (
                <div className="mt-4 space-y-3 rounded-lg border border-zinc-100 bg-zinc-50 p-3">
                  <p className="text-xs font-medium text-zinc-600">Start from a saved address, then edit if needed</p>
                  <div className="flex flex-wrap gap-4 text-sm">
                    <label className="flex items-center gap-2">
                      <input
                        type="radio"
                        name="addressModeUi"
                        checked={addressMode === "saved"}
                        onChange={() => {
                          setAddressMode("saved");
                          const def = savedAddresses.find((a) => a.id === selectedSavedId) ?? savedAddresses[0];
                          if (def) onPickSaved(def.id);
                        }}
                        className="size-4"
                      />
                      <span>Saved address</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input
                        type="radio"
                        name="addressModeUi"
                        checked={addressMode === "manual"}
                        onChange={() => {
                          setAddressMode("manual");
                          setSelectedSavedId(null);
                        }}
                        className="size-4"
                      />
                      <span>New address</span>
                    </label>
                  </div>
                  {addressMode === "saved" ? (
                    <div className="mt-2">
                      <label className="text-xs font-medium text-zinc-600">Choose address</label>
                      <select
                        className="mt-1 w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm"
                        value={selectedSavedId ?? ""}
                        onChange={(e) => onPickSaved(e.target.value)}
                      >
                        {savedAddresses.map((a) => (
                          <option key={a.id} value={a.id}>
                            {(a.label ? `${a.label} — ` : "") + a.recipient_name}
                            {a.is_default ? " (Default)" : ""}
                          </option>
                        ))}
                      </select>
                    </div>
                  ) : null}
                </div>
              ) : (
                <p className="mt-3 text-xs text-zinc-600">
                  No saved addresses yet. Enter shipping details below, or{" "}
                  <Link href="/account/addresses" className="font-medium text-emerald-800 hover:underline">
                    add addresses to your profile
                  </Link>{" "}
                  for faster checkout next time.
                </p>
              )}

              <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div>
                  <label className="text-xs font-medium text-zinc-600">Recipient name</label>
                  <input
                    required
                    value={shipping.recipientName}
                    onChange={(e) => setShipping((s) => ({ ...s, recipientName: e.target.value }))}
                    className="mt-1 w-full rounded-md border border-zinc-300 px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-zinc-600">Phone</label>
                  <input
                    required
                    value={shipping.phone}
                    onChange={(e) => setShipping((s) => ({ ...s, phone: e.target.value }))}
                    className="mt-1 w-full rounded-md border border-zinc-300 px-3 py-2 text-sm"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="text-xs font-medium text-zinc-600">Address line 1</label>
                  <input
                    required
                    value={shipping.line1}
                    onChange={(e) => setShipping((s) => ({ ...s, line1: e.target.value }))}
                    className="mt-1 w-full rounded-md border border-zinc-300 px-3 py-2 text-sm"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="text-xs font-medium text-zinc-600">Address line 2 (optional)</label>
                  <input
                    value={shipping.line2}
                    onChange={(e) => setShipping((s) => ({ ...s, line2: e.target.value }))}
                    className="mt-1 w-full rounded-md border border-zinc-300 px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-zinc-600">Country</label>
                  <input
                    required
                    value={shipping.country}
                    onChange={(e) => setShipping((s) => ({ ...s, country: e.target.value }))}
                    className="mt-1 w-full rounded-md border border-zinc-300 px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-zinc-600">City</label>
                  <input
                    required
                    value={shipping.city}
                    onChange={(e) => setShipping((s) => ({ ...s, city: e.target.value }))}
                    className="mt-1 w-full rounded-md border border-zinc-300 px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-zinc-600">State / province</label>
                  <input
                    required
                    value={shipping.state}
                    onChange={(e) => setShipping((s) => ({ ...s, state: e.target.value }))}
                    className="mt-1 w-full rounded-md border border-zinc-300 px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-zinc-600">Postal code</label>
                  <input
                    required
                    value={shipping.postalCode}
                    onChange={(e) => setShipping((s) => ({ ...s, postalCode: e.target.value }))}
                    className="mt-1 w-full rounded-md border border-zinc-300 px-3 py-2 text-sm"
                  />
                </div>
              </div>
            </section>

            <section className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm">
              <p className="text-sm font-semibold text-zinc-900">Payment & order notes</p>
              <p className="mt-1 text-xs text-zinc-500">
                No card is charged at submit. CSR reviews the order, then processes payment using the card on file or your
                bank transfer choice.
              </p>
              {savedCards.length > 0 ? (
                <div className="mt-3 space-y-3 text-sm text-zinc-800">
                  <p className="text-xs font-medium text-zinc-600">How should we take payment after approval?</p>
                  <label className="flex items-start gap-2">
                    <input
                      type="radio"
                      name="checkoutPaymentUi"
                      checked={checkoutPayment === "saved_card"}
                      onChange={() => setCheckoutPayment("saved_card")}
                      className="mt-0.5 size-4"
                    />
                    <span>
                      <span className="font-medium">Use a saved card</span> (CSR uses encrypted details from this order)
                    </span>
                  </label>
                  {checkoutPayment === "saved_card" ? (
                    <div className="ml-6">
                      <label className="text-xs font-medium text-zinc-600">Card on file</label>
                      <select
                        className="mt-1 w-full max-w-md rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm"
                        value={selectedCardId ?? ""}
                        onChange={(e) => setSelectedCardId(e.target.value || null)}
                      >
                        {savedCards.map((c) => (
                          <option key={c.id} value={c.id}>
                            {(c.brand ? c.brand.toUpperCase() : "Card")} ···· {c.last4}
                            {c.is_default ? " (Default)" : ""}
                          </option>
                        ))}
                      </select>
                    </div>
                  ) : null}
                  <label className="flex items-start gap-2">
                    <input
                      type="radio"
                      name="checkoutPaymentUi"
                      checked={checkoutPayment === "bank_transfer"}
                      onChange={() => setCheckoutPayment("bank_transfer")}
                      className="mt-0.5 size-4"
                    />
                    <span>
                      <span className="font-medium">Direct bank transfer</span> (CSR will send transfer details)
                    </span>
                  </label>
                </div>
              ) : (
                <p className="mt-3 text-sm text-zinc-700">
                  <span className="font-medium">Direct bank transfer</span> for this order.{" "}
                  <Link href="/account/payment-methods" className="font-medium text-emerald-800 hover:underline">
                    Add a card under Banks &amp; cards
                  </Link>{" "}
                  to use a saved card at checkout.
                </p>
              )}
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
              <p className="mt-1 text-xs text-zinc-500">Confirm contact, shipping address, and payment preference, then submit.</p>
              {review ? (
                <div className="mt-3 grid gap-3 sm:grid-cols-2">
                  <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-3">
                    <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">Contact</p>
                    <p className="mt-1 text-sm font-medium text-zinc-900">{review.fullName}</p>
                    <p className="text-sm text-zinc-700">{review.email}</p>
                    <p className="text-xs text-zinc-500">Company: {review.company}</p>
                  </div>
                  <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-3">
                    <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">License</p>
                    <p className="mt-1 text-sm font-medium text-zinc-900">{review.doctorName}</p>
                    <p className="text-sm text-zinc-700">License #: {review.doctorLicenseNumber}</p>
                    <p className="text-sm text-zinc-700">Expiry: {review.doctorLicenseExpiry}</p>
                  </div>
                  <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-3 sm:col-span-2">
                    <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">Shipping address</p>
                    <p className="mt-1 text-sm text-zinc-700">{review.shippingAddress}</p>
                    <p className="mt-2 text-sm text-zinc-700">
                      <span className="font-medium text-zinc-900">Payment method:</span> {review.paymentMethod}
                    </p>
                    {review.cardSummary ? (
                      <p className="mt-1 break-all font-mono text-xs text-zinc-600">CSR: {review.cardSummary}</p>
                    ) : null}
                  </div>
                </div>
              ) : null}
            </section>

            <label className="flex items-start gap-2 text-xs text-zinc-700">
              <input type="checkbox" name="policyAck" value="1" required className="mt-0.5 size-4 rounded border-zinc-400" />
              <span>
                I confirm this purchase is for authorized professional use and that product handling at delivery will follow
                required storage and local regulatory standards.
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
                Continue to {step === 1 ? "Shipping & payment" : "Review"}
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
                  <span className="font-medium text-zinc-900">${Number(l.unitPrice * l.quantity).toFixed(2)}</span>
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
