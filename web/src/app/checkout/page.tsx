"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { submitOrder, validateCouponAction } from "@/app/actions/orders";
import { AddressAutocompleteInput } from "@/components/address-autocomplete-input";
import { CartMinimumBar } from "@/components/cart-minimum-bar";
import { useCart } from "@/context/cart-context";
import { MIN_CHECKOUT_SUBTOTAL_USD, meetsCheckoutMinimumUsd } from "@/lib/cart-minimum";
import { orderGrandTotal } from "@/lib/checkout-shipping";
import type { ParsedAddress } from "@/lib/parse-google-place";
import { createClient } from "@/lib/supabase/client";

type ContactFields = {
  firstName: string;
  lastName: string;
  doctorName: string;
  email: string;
  company: string;
  doctorLicenseNumber: string;
  doctorLicenseExpiry: string;
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
  company: string;
  phone: string;
  line1: string;
  line2: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
};

const emptyContact: ContactFields = {
  firstName: "",
  lastName: "",
  doctorName: "",
  email: "",
  company: "",
  doctorLicenseNumber: "",
  doctorLicenseExpiry: "",
};

const emptyShipping: ShippingFields = {
  recipientName: "",
  company: "",
  phone: "",
  line1: "",
  line2: "",
  city: "",
  state: "",
  postalCode: "",
  country: "",
};

function isCardExpired(card: Pick<SavedCardRow, "exp_month" | "exp_year">) {
  const expiryEnd = new Date(card.exp_year, card.exp_month, 0, 23, 59, 59, 999);
  return expiryEnd < new Date();
}

function cardLabel(card: SavedCardRow) {
  return `${card.brand ? card.brand.toUpperCase() : "Card"} ···· ${card.last4} · exp ${String(
    card.exp_month
  ).padStart(2, "0")}/${String(card.exp_year).slice(-2)}`;
}

function shippingLine(shipping: ShippingFields) {
  return [
    `${shipping.recipientName}${shipping.phone ? ` · ${shipping.phone}` : ""}`.trim(),
    shipping.line1,
    shipping.line2.trim() ? shipping.line2 : null,
    `${shipping.city}, ${shipping.state} ${shipping.postalCode}`.trim(),
    shipping.country,
  ]
    .filter(Boolean)
    .join(" · ");
}

export default function CheckoutPage() {
  const { lines, selectedLines, removeLine } = useCart();
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [prefillLoading, setPrefillLoading] = useState(true);
  const [contact, setContact] = useState<ContactFields>(emptyContact);
  const [savedAddresses, setSavedAddresses] = useState<SavedAddressRow[]>([]);
  const [selectedSavedId, setSelectedSavedId] = useState<string | null>(null);
  const [shipping, setShipping] = useState<ShippingFields>(emptyShipping);
  const [useDifferentShipping, setUseDifferentShipping] = useState(false);
  const [savedCards, setSavedCards] = useState<SavedCardRow[]>([]);
  const [selectedCardId, setSelectedCardId] = useState<string | null>(null);
  const [customerNotes, setCustomerNotes] = useState("");
  const [paymentNotes, setPaymentNotes] = useState("");
  const [shippingPreview, setShippingPreview] = useState<{ amount: number; label: string } | null>(null);
  const [couponInput, setCouponInput] = useState("");
  const [couponPending, setCouponPending] = useState(false);
  const [couponError, setCouponError] = useState<string | null>(null);
  const [appliedCoupon, setAppliedCoupon] = useState<{
    code: string;
    discountAmount: number;
    label: string;
  } | null>(null);

  const subtotal = selectedLines.reduce((sum, l) => sum + l.unitPrice * l.quantity, 0);
  const usableCards = useMemo(() => savedCards.filter((card) => !isCardExpired(card)), [savedCards]);
  const expiredCardCount = savedCards.length - usableCards.length;
  const selectedCard = usableCards.find((card) => card.id === selectedCardId) ?? usableCards[0] ?? null;
  const hasUsableCard = usableCards.length > 0;

  const missingProfileFields = [
    ["first name", contact.firstName],
    ["last name", contact.lastName],
    ["email", contact.email],
    ["doctor name", contact.doctorName],
    ["license number", contact.doctorLicenseNumber],
    ["license expiry", contact.doctorLicenseExpiry],
  ]
    .filter(([, value]) => !String(value).trim())
    .map(([label]) => label);

  const missingShippingFields = [
    ["recipient name", shipping.recipientName],
    ["phone", shipping.phone],
    ["address line 1", shipping.line1],
    ["city", shipping.city],
    ["state / province", shipping.state],
    ["postal code", shipping.postalCode],
    ["country", shipping.country],
  ]
    .filter(([, value]) => !String(value).trim())
    .map(([label]) => label);

  const minOrderMet = meetsCheckoutMinimumUsd(subtotal);
  const canSubmit =
    minOrderMet &&
    hasUsableCard &&
    missingProfileFields.length === 0 &&
    missingShippingFields.length === 0 &&
    !pending;

  function handleShippingAddressSelect(parsed: ParsedAddress) {
    setShipping((s) => ({
      ...s,
      line1: parsed.line1,
      city: parsed.city,
      state: parsed.state,
      postalCode: parsed.postalCode,
      ...(parsed.countryCode ? { country: parsed.countryCode } : {}),
    }));
  }

  async function handleApplyCoupon() {
    const code = couponInput.trim();
    if (!code) return;
    setCouponPending(true);
    setCouponError(null);
    const result = await validateCouponAction(code, subtotal);
    setCouponPending(false);
    if (result.ok) {
      setAppliedCoupon(result.coupon);
      setCouponInput("");
    } else {
      setCouponError(result.message);
    }
  }

  function applySavedRow(row: SavedAddressRow) {
    setShipping({
      recipientName: row.recipient_name,
      company: "",
      phone: row.phone ?? "",
      line1: row.line1,
      line2: row.line2 ?? "",
      city: row.city ?? "",
      state: row.state ?? "",
      postalCode: row.postal_code ?? "",
      country: row.country ?? "",
    });
  }

  function onPickSaved(id: string) {
    const row = savedAddresses.find((address) => address.id === id);
    if (!row) return;
    setSelectedSavedId(id);
    applySavedRow(row);
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

        const fn = profile?.first_name ?? "";
        const ln = profile?.last_name ?? "";
        const fullName = profile?.full_name ?? `${fn} ${ln}`.trim();
        setContact({
          firstName: fn,
          lastName: ln,
          doctorName: fullName,
          email: profile?.email ?? user.email ?? "",
          company: profile?.company ?? "",
          doctorLicenseNumber: profile?.license_number ?? "",
          doctorLicenseExpiry: profile?.license_expiry ? String(profile.license_expiry).slice(0, 10) : "",
        });

        const list = (addrRows ?? []) as SavedAddressRow[];
        setSavedAddresses(list);

        if (list.length > 0) {
          const def = list.find((address) => address.is_default) ?? list[0];
          setSelectedSavedId(def.id);
          applySavedRow(def);
        } else if (profile) {
          setSelectedSavedId(null);
          setShipping({
            recipientName: fullName,
            company: profile.company ?? "",
            phone: profile.phone ?? "",
            line1: profile.delivery_address ?? "",
            line2: "",
            city: profile.city ?? "",
            state: profile.state ?? "",
            postalCode: profile.postal_code ?? "",
            country: profile.country ?? "",
          });
        }

        const cards = (cardRows ?? []) as SavedCardRow[];
        const activeCards = cards.filter((card) => !isCardExpired(card));
        setSavedCards(cards);
        setSelectedCardId((activeCards.find((card) => card.is_default) ?? activeCards[0] ?? null)?.id ?? null);
      } finally {
        if (mounted) setPrefillLoading(false);
      }
    }
    void loadPrefill();
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    const ac = new AbortController();
    (async () => {
      try {
        const r = await fetch("/api/checkout/shipping", { signal: ac.signal });
        if (!r.ok) return;
        const j = (await r.json()) as { shippingAmount?: number; shippingLabel?: string };
        if (
          typeof j.shippingAmount === "number" &&
          Number.isFinite(j.shippingAmount) &&
          typeof j.shippingLabel === "string"
        ) {
          setShippingPreview({ amount: j.shippingAmount, label: j.shippingLabel });
        }
      } catch {
        /* aborted */
      }
    })();
    return () => ac.abort();
  }, []);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);

    if (!selectedCard) {
      setError("Add a non-expired card on file before placing this order.");
      return;
    }
    if (missingProfileFields.length > 0) {
      setError("Complete your profile details before placing this order.");
      return;
    }
    if (missingShippingFields.length > 0) {
      setError("Complete the shipping address before placing this order.");
      return;
    }
    if (!meetsCheckoutMinimumUsd(subtotal)) {
      setError(
        `Minimum order is $${MIN_CHECKOUT_SUBTOTAL_USD.toFixed(2)} (selected items). Add more to your cart before checking out.`
      );
      return;
    }

    const form = e.currentTarget;
    if (!form.reportValidity()) return;

    setPending(true);
    const res = await submitOrder({
      firstName: contact.firstName.trim(),
      lastName: contact.lastName.trim(),
      company: contact.company.trim(),
      email: contact.email.trim(),
      phone: shipping.phone.trim(),
      recipientName: shipping.recipientName.trim(),
      line1: shipping.line1.trim(),
      line2: shipping.line2.trim(),
      city: shipping.city.trim(),
      state: shipping.state.trim(),
      postalCode: shipping.postalCode.trim(),
      country: shipping.country.trim(),
      customerNotes,
      paymentNotes: paymentNotes.trim() || undefined,
      doctorName: contact.doctorName.trim(),
      doctorLicenseNumber: contact.doctorLicenseNumber.trim(),
      doctorLicenseExpiry: contact.doctorLicenseExpiry.trim(),
      policyAccepted: new FormData(form).get("policyAck") === "1",
      items: selectedLines.map((line) => ({ slug: line.slug, quantity: line.quantity })),
      checkoutType: "saved_manual_card",
      userSavedCardId: selectedCard.id,
      couponCode: appliedCoupon?.code,
      shippingCompany: shipping.company.trim() || undefined,
    });
    setPending(false);

    if (!res.ok) {
      setError(res.message);
      return;
    }

    selectedLines.forEach((line) => removeLine(line.slug));
    router.push(`/checkout/success?ref=${encodeURIComponent(res.orderReference)}`);
  }

  if (lines.length === 0) {
    return <p className="text-sm text-zinc-600">Your cart is empty. Add products before checkout.</p>;
  }

  if (selectedLines.length === 0) {
    return (
      <p className="text-sm text-zinc-600">
        No selected items for checkout. Go back to{" "}
        <Link href="/cart" className="font-medium text-teal-800 hover:underline">
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
      {!hasUsableCard ? (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/35 px-4">
          <div className="w-full max-w-md rounded-2xl border border-zinc-200 bg-white p-5 shadow-2xl">
            <h2 className="text-lg font-semibold text-zinc-900">Update card information</h2>
            <p className="mt-2 text-sm text-zinc-600">
              You need a non-expired credit card on file before placing an order.
              {expiredCardCount > 0
                ? " The card currently saved on your account appears to be expired."
                : " No saved card was found on your account."}
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              <Link
                href="/account/payment-methods"
                className="rounded-full bg-teal-800 px-4 py-2 text-sm font-semibold text-white hover:bg-teal-900"
              >
                Manage cards
              </Link>
              <Link
                href="/cart"
                className="rounded-full border border-zinc-300 px-4 py-2 text-sm font-semibold text-zinc-700 hover:bg-zinc-50"
              >
                Back to cart
              </Link>
            </div>
          </div>
        </div>
      ) : null}

      <h1 className="text-2xl font-semibold text-zinc-900">Checkout</h1>
      <p className="mt-2 text-sm text-zinc-600">
        Review your order details below. We use the information from your account profile and saved address, so you only
        need to change the shipping address if this order should go somewhere else.
      </p>
      <p className="mt-2 text-xs text-zinc-600">
        By submitting, you agree to our{" "}
        <Link href="/legal/terms" className="underline hover:no-underline">
          Terms of Supply
        </Link>
        ,{" "}
        <Link href="/legal/shipping-cold-chain" className="underline hover:no-underline">
          Shipping &amp; Cold-Chain Policy
        </Link>
        , and{" "}
        <Link href="/legal/return-policy" className="underline hover:no-underline">
          Return policy
        </Link>
        .
      </p>

      <div className="mt-6">
        <CartMinimumBar amountUsd={subtotal} currency={selectedLines[0]?.currency ?? "USD"} />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_22rem]">
        <form onSubmit={onSubmit} className="space-y-5">
          <section className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h2 className="text-sm font-semibold text-zinc-900">Review &amp; submit</h2>
                <p className="mt-1 text-xs text-zinc-500">
                  Confirm your account details, shipping address, and payment card.
                </p>
              </div>
              <Link href="/account/profile" className="text-xs font-medium text-teal-800 hover:underline">
                Edit profile
              </Link>
            </div>

            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-3">
                <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">Client</p>
                <p className="mt-1 text-sm font-medium text-zinc-900">
                  {`${contact.firstName} ${contact.lastName}`.trim() || "Missing name"}
                </p>
                <p className="text-sm text-zinc-700">{contact.email || "Missing email"}</p>
                <p className="text-xs text-zinc-500">Company: {contact.company || "Not provided"}</p>
              </div>
              <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-3">
                <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">License</p>
                <p className="mt-1 text-sm font-medium text-zinc-900">{contact.doctorName || "Missing doctor name"}</p>
                <p className="text-sm text-zinc-700">
                  License #: {contact.doctorLicenseNumber || "Missing license number"}
                </p>
                <p className="text-sm text-zinc-700">Expiry: {contact.doctorLicenseExpiry || "Missing expiry"}</p>
              </div>
              <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-3 sm:col-span-2">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">Shipping address</p>
                    <p className="mt-1 text-sm text-zinc-700">{shippingLine(shipping) || "Missing shipping address"}</p>
                  </div>
                  <Link href="/account/addresses" className="text-xs font-medium text-teal-800 hover:underline">
                    Manage addresses
                  </Link>
                </div>
                <label className="mt-3 flex items-center gap-2 text-sm text-zinc-700">
                  <input
                    type="checkbox"
                    checked={useDifferentShipping}
                    onChange={(e) => setUseDifferentShipping(e.target.checked)}
                    className="size-4 rounded border-zinc-400"
                  />
                  <span>Different shipping address</span>
                </label>
              </div>
              <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-3 sm:col-span-2">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">Payment card</p>
                    <p className="mt-1 text-sm font-medium text-zinc-900">
                      {selectedCard ? cardLabel(selectedCard) : "No valid card on file"}
                    </p>
                    {selectedCard ? (
                      <p className="text-xs text-zinc-500">Name on card: {selectedCard.name_on_card}</p>
                    ) : null}
                  </div>
                  <Link href="/account/payment-methods" className="text-xs font-medium text-teal-800 hover:underline">
                    Manage cards
                  </Link>
                </div>
                {usableCards.length > 1 ? (
                  <div className="mt-3">
                    <label className="text-xs font-medium text-zinc-600">Card to use after approval</label>
                    <select
                      className="mt-1 w-full max-w-md rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm"
                      value={selectedCard?.id ?? ""}
                      onChange={(e) => setSelectedCardId(e.target.value || null)}
                    >
                      {usableCards.map((card) => (
                        <option key={card.id} value={card.id}>
                          {cardLabel(card)}
                          {card.is_default ? " (Default)" : ""}
                        </option>
                      ))}
                    </select>
                  </div>
                ) : null}
              </div>
            </div>

            {missingProfileFields.length > 0 ? (
              <p className="mt-3 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-950">
                Complete these profile fields before checkout: {missingProfileFields.join(", ")}.{" "}
                <Link href="/account/profile" className="font-semibold underline">
                  Update profile
                </Link>
                .
              </p>
            ) : null}
            {missingShippingFields.length > 0 ? (
              <p className="mt-3 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-950">
                Complete these shipping fields before checkout: {missingShippingFields.join(", ")}.
              </p>
            ) : null}
          </section>

          {useDifferentShipping ? (
            <section className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h2 className="text-sm font-semibold text-zinc-900">Different shipping address</h2>
                  <p className="mt-1 text-xs text-zinc-500">Use this when the order should ship somewhere else.</p>
                </div>
                <Link href="/account/addresses" className="text-xs font-medium text-teal-800 hover:underline">
                  Manage saved addresses
                </Link>
              </div>

              {savedAddresses.length > 0 ? (
                <div className="mt-4 rounded-lg border border-zinc-100 bg-zinc-50 p-3">
                  <label className="text-xs font-medium text-zinc-600">Start from a saved address</label>
                  <select
                    className="mt-1 w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm"
                    value={selectedSavedId ?? ""}
                    onChange={(e) => onPickSaved(e.target.value)}
                  >
                    {savedAddresses.map((address) => (
                      <option key={address.id} value={address.id}>
                        {(address.label ? `${address.label} — ` : "") + address.recipient_name}
                        {address.is_default ? " (Default)" : ""}
                      </option>
                    ))}
                  </select>
                </div>
              ) : null}

              <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div>
                  <label className="text-xs font-medium text-zinc-600">Recipient name</label>
                  <input
                    required={useDifferentShipping}
                    value={shipping.recipientName}
                    onChange={(e) => setShipping((s) => ({ ...s, recipientName: e.target.value }))}
                    className="mt-1 w-full rounded-md border border-zinc-300 px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-zinc-600">Company (optional)</label>
                  <input
                    value={shipping.company}
                    onChange={(e) => setShipping((s) => ({ ...s, company: e.target.value }))}
                    className="mt-1 w-full rounded-md border border-zinc-300 px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-zinc-600">Phone</label>
                  <input
                    required={useDifferentShipping}
                    value={shipping.phone}
                    onChange={(e) => setShipping((s) => ({ ...s, phone: e.target.value }))}
                    className="mt-1 w-full rounded-md border border-zinc-300 px-3 py-2 text-sm"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="text-xs font-medium text-zinc-600">Address line 1</label>
                  <AddressAutocompleteInput
                    name="shipping_line1"
                    value={shipping.line1}
                    onChange={(v) => setShipping((s) => ({ ...s, line1: v }))}
                    onAddressSelect={handleShippingAddressSelect}
                    placeholder="123 Main St"
                    className="mt-1 w-full rounded-md border border-zinc-300 px-3 py-2 text-sm focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
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
                    required={useDifferentShipping}
                    value={shipping.country}
                    onChange={(e) => setShipping((s) => ({ ...s, country: e.target.value }))}
                    className="mt-1 w-full rounded-md border border-zinc-300 px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-zinc-600">City</label>
                  <input
                    required={useDifferentShipping}
                    value={shipping.city}
                    onChange={(e) => setShipping((s) => ({ ...s, city: e.target.value }))}
                    className="mt-1 w-full rounded-md border border-zinc-300 px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-zinc-600">State / province</label>
                  <input
                    required={useDifferentShipping}
                    value={shipping.state}
                    onChange={(e) => setShipping((s) => ({ ...s, state: e.target.value }))}
                    className="mt-1 w-full rounded-md border border-zinc-300 px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-zinc-600">Postal code</label>
                  <input
                    required={useDifferentShipping}
                    value={shipping.postalCode}
                    onChange={(e) => setShipping((s) => ({ ...s, postalCode: e.target.value }))}
                    className="mt-1 w-full rounded-md border border-zinc-300 px-3 py-2 text-sm"
                  />
                </div>
              </div>
            </section>
          ) : null}

          <section className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm">
            <p className="text-sm font-semibold text-zinc-900">Order notes</p>
            <p className="mt-1 text-xs text-zinc-500">
              No card is charged at submit. Once your order is approved, payment is processed using your valid card on
              file.
            </p>
            <div className="mt-3">
              <label className="text-xs font-medium text-zinc-600">Order notes</label>
              <textarea
                value={customerNotes}
                onChange={(e) => setCustomerNotes(e.target.value)}
                rows={3}
                className="mt-1 w-full rounded-md border border-zinc-300 px-3 py-2 text-sm"
              />
            </div>
            <div className="mt-3">
              <label className="text-xs font-medium text-zinc-600">Payment / callback notes (optional)</label>
              <textarea
                value={paymentNotes}
                onChange={(e) => setPaymentNotes(e.target.value)}
                rows={2}
                className="mt-1 w-full rounded-md border border-zinc-300 px-3 py-2 text-sm"
              />
            </div>
          </section>

          <section className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm">
            <p className="text-sm font-semibold text-zinc-900">Coupon code</p>
            {appliedCoupon ? (
              <div className="mt-3 flex items-center justify-between rounded-lg border border-teal-200 bg-teal-50 px-3 py-2">
                <div>
                  <p className="text-sm font-medium text-teal-800">{appliedCoupon.label}</p>
                  <p className="text-xs text-teal-700">−${appliedCoupon.discountAmount.toFixed(2)} applied</p>
                </div>
                <button
                  type="button"
                  onClick={() => setAppliedCoupon(null)}
                  className="text-xs text-zinc-500 hover:text-red-600"
                >
                  Remove
                </button>
              </div>
            ) : (
              <div className="mt-3">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={couponInput}
                    onChange={(e) => { setCouponInput(e.target.value.toUpperCase()); setCouponError(null); }}
                    onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); void handleApplyCoupon(); } }}
                    placeholder="Enter coupon code"
                    className="flex-1 rounded-md border border-zinc-300 px-3 py-2 text-sm uppercase tracking-wide"
                  />
                  <button
                    type="button"
                    disabled={!couponInput.trim() || couponPending}
                    onClick={() => void handleApplyCoupon()}
                    className="rounded-md bg-teal-800 px-4 py-2 text-sm font-medium text-white hover:bg-teal-900 disabled:opacity-50"
                  >
                    {couponPending ? "Checking…" : "Apply"}
                  </button>
                </div>
                {couponError ? (
                  <p className="mt-1 text-xs text-red-600">{couponError}</p>
                ) : null}
              </div>
            )}
          </section>

          <label className="flex items-start gap-2 text-xs text-zinc-700">
            <input type="checkbox" name="policyAck" value="1" required className="mt-0.5 size-4 rounded border-zinc-400" />
            <span>
              I confirm this purchase is for authorized professional use and that product handling at delivery will follow
              required storage and local regulatory standards.
            </span>
          </label>

          {error ? <p className="text-sm text-red-700">{error}</p> : null}
          <button
            type="submit"
            disabled={!canSubmit}
            className="rounded-full bg-teal-800 px-5 py-2.5 text-sm font-semibold text-white hover:bg-teal-900 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {pending ? "Submitting..." : "Place order"}
          </button>
        </form>

        <aside className="lg:sticky lg:top-24 lg:self-start">
          <div className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm">
            <h2 className="text-sm font-semibold text-zinc-900">Your order</h2>
            <ul className="mt-3 space-y-2 border-b border-zinc-200 pb-3 text-sm">
              {selectedLines.map((line) => (
                <li key={line.slug} className="flex items-start justify-between gap-3">
                  <span className="text-zinc-700">
                    {line.title} <span className="text-zinc-500">× {line.quantity}</span>
                  </span>
                  <span className="font-medium text-zinc-900">
                    ${Number(line.unitPrice * line.quantity).toFixed(2)}
                  </span>
                </li>
              ))}
            </ul>
            <div className="mt-3 space-y-1 text-sm">
              <p className="flex items-center justify-between text-zinc-600">
                <span>Subtotal</span>
                <span>${subtotal.toFixed(2)}</span>
              </p>
              {appliedCoupon ? (
                <p className="flex items-center justify-between text-teal-700">
                  <span className="pr-2 leading-snug">{appliedCoupon.label}</span>
                  <span className="shrink-0">−${appliedCoupon.discountAmount.toFixed(2)}</span>
                </p>
              ) : null}
              <p className="flex items-center justify-between text-zinc-600">
                <span className="pr-2 text-left leading-snug">
                  {shippingPreview ? shippingPreview.label : "Shipping"}
                </span>
                <span className="shrink-0">
                  {shippingPreview ? `$${shippingPreview.amount.toFixed(2)}` : "…"}
                </span>
              </p>
              <p className="flex items-center justify-between border-t border-zinc-200 pt-2 font-semibold text-zinc-900">
                <span>Total</span>
                <span>
                  {shippingPreview
                    ? `$${Math.max(0, orderGrandTotal(subtotal, shippingPreview.amount) - (appliedCoupon?.discountAmount ?? 0)).toFixed(2)}`
                    : "…"}
                </span>
              </p>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
