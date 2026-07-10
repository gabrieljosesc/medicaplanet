"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { saveOrderItemsAction } from "@/app/actions/admin";

type EditorItem = { key: string; product_id: string | null; title: string; quantity: number; unit_price: number };
type Suggestion = { id: string; slug: string; title: string; base_price: number };
type InitialItem = { product_id: string | null; title: string; quantity: number; unit_price: number };

let _k = 0;
const newKey = () => `r${_k++}`;
const money = (n: number) => `$${n.toFixed(2)}`;

const inputClass = "rounded-md border border-zinc-300 px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-teal-700";

export function OrderItemsEditor({
  orderId,
  initialItems,
  initialShipping,
  discount,
}: {
  orderId: string;
  initialItems: InitialItem[];
  initialShipping: number;
  discount: number;
}) {
  const [items, setItems] = useState<EditorItem[]>(() => initialItems.map((i) => ({ ...i, key: newKey() })));
  const [shipping, setShipping] = useState(initialShipping);
  const [discountType, setDiscountType] = useState<"amount" | "percent">("amount");
  const [discountValue, setDiscountValue] = useState(discount);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Suggestion[]>([]);
  const [searching, setSearching] = useState(false);
  const [pending, startTransition] = useTransition();
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const subtotal = items.reduce((s, i) => s + i.quantity * i.unit_price, 0);
  const discountAmount = Math.min(
    subtotal,
    Math.max(0, discountType === "percent" ? (subtotal * (Number(discountValue) || 0)) / 100 : Number(discountValue) || 0)
  );
  const total = Math.max(0, subtotal - discountAmount) + (Number(shipping) || 0);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (query.trim().length < 2) {
      setResults([]);
      return;
    }
    debounceRef.current = setTimeout(async () => {
      setSearching(true);
      try {
        const res = await fetch(`/api/admin/product-search?q=${encodeURIComponent(query.trim())}`);
        const data = await res.json();
        setResults(data.suggestions ?? []);
      } catch {
        /* ignore */
      } finally {
        setSearching(false);
      }
    }, 250);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query]);

  function addProduct(s: Suggestion) {
    setItems((prev) => [
      ...prev,
      { key: newKey(), product_id: s.id, title: s.title, quantity: 1, unit_price: s.base_price },
    ]);
    setQuery("");
    setResults([]);
    setMsg(null);
  }
  const updateItem = (key: string, patch: Partial<EditorItem>) =>
    setItems((prev) => prev.map((i) => (i.key === key ? { ...i, ...patch } : i)));
  const removeItem = (key: string) => {
    setItems((prev) => prev.filter((i) => i.key !== key));
    setMsg(null);
  };

  function save() {
    setMsg(null);
    startTransition(async () => {
      const res = await saveOrderItemsAction({
        orderId,
        items: items.map(({ product_id, title, quantity, unit_price }) => ({ product_id, title, quantity, unit_price })),
        shippingAmount: Number(shipping) || 0,
        discountAmount: Math.round(discountAmount * 100) / 100,
      });
      setMsg(res.ok ? { ok: true, text: "Order saved." } : { ok: false, text: res.message ?? "Save failed." });
    });
  }

  return (
    <section className="mt-4 rounded-xl border border-zinc-200 bg-white p-4 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-xs font-semibold uppercase tracking-wide text-zinc-500">Items (editable)</h2>
        <span className="text-xs text-zinc-400">Adjust quantity or price, add or remove products.</span>
      </div>

      <div className="mt-3 divide-y divide-zinc-100">
        {items.length === 0 && <p className="py-3 text-sm text-zinc-400">No items — add a product below.</p>}
        {items.map((it) => (
          <div key={it.key} className="flex flex-wrap items-center gap-3 py-2">
            <span className="min-w-0 flex-1 text-sm text-zinc-800">{it.title}</span>
            <label className="flex items-center gap-1 text-xs text-zinc-500">
              Qty
              <input
                type="number"
                min={1}
                value={it.quantity}
                onChange={(e) => updateItem(it.key, { quantity: Math.max(1, Math.floor(Number(e.target.value) || 1)) })}
                className={`${inputClass} w-16`}
              />
            </label>
            <label className="flex items-center gap-1 text-xs text-zinc-500">
              $
              <input
                type="number"
                min={0}
                step="0.01"
                value={it.unit_price}
                onChange={(e) => updateItem(it.key, { unit_price: Math.max(0, Number(e.target.value) || 0) })}
                className={`${inputClass} w-24`}
              />
            </label>
            <span className="w-20 text-right text-sm font-medium text-zinc-900">{money(it.quantity * it.unit_price)}</span>
            <button
              type="button"
              onClick={() => removeItem(it.key)}
              aria-label="Remove item"
              className="text-zinc-400 hover:text-red-600"
            >
              ✕
            </button>
          </div>
        ))}
      </div>

      <div className="relative mt-3">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Add a product — search by name…"
          className={`${inputClass} w-full px-3 py-2`}
        />
        {searching && <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-zinc-400">…</span>}
        {results.length > 0 && (
          <div className="absolute z-10 left-0 right-0 mt-1 max-h-60 overflow-auto rounded-lg border bg-white shadow-lg">
            {results.map((r) => (
              <button
                key={r.id}
                type="button"
                onClick={() => addProduct(r)}
                className="flex w-full items-center justify-between gap-2 px-3 py-2 text-left text-sm hover:bg-zinc-50"
              >
                <span className="min-w-0 truncate text-zinc-800">{r.title}</span>
                <span className="flex flex-shrink-0 items-center gap-2 text-zinc-500">{money(r.base_price)} +</span>
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="mt-4 space-y-1 border-t border-zinc-100 pt-3 text-sm">
        <div className="flex justify-between text-zinc-600">
          <span>Subtotal</span>
          <span>{money(subtotal)}</span>
        </div>
        <div className="flex items-center justify-between gap-2 text-zinc-600">
          <span>Discount</span>
          <span className="flex items-center gap-1">
            <select
              value={discountType}
              onChange={(e) => setDiscountType(e.target.value as "amount" | "percent")}
              className={`${inputClass} h-8 px-1`}
            >
              <option value="amount">$</option>
              <option value="percent">%</option>
            </select>
            <input
              type="number"
              min={0}
              step="0.01"
              value={discountValue}
              onChange={(e) => setDiscountValue(Math.max(0, Number(e.target.value) || 0))}
              className={`${inputClass} w-24 text-right`}
            />
            <span className="w-20 text-right text-teal-700">−{money(discountAmount)}</span>
          </span>
        </div>
        <div className="flex items-center justify-between text-zinc-600">
          <span>Shipping</span>
          <label className="flex items-center gap-1">
            $
            <input
              type="number"
              min={0}
              step="0.01"
              value={shipping}
              onChange={(e) => setShipping(Math.max(0, Number(e.target.value) || 0))}
              className={`${inputClass} w-24 text-right`}
            />
          </label>
        </div>
        <div className="flex justify-between border-t border-zinc-100 pt-1.5 font-semibold text-teal-900">
          <span>Total</span>
          <span>{money(total)}</span>
        </div>
      </div>

      {msg && <p className={`mt-3 text-sm ${msg.ok ? "text-teal-700" : "text-red-600"}`}>{msg.text}</p>}
      <button
        type="button"
        onClick={save}
        disabled={pending}
        className="mt-3 rounded-full bg-teal-800 px-6 py-2.5 text-sm font-semibold text-white hover:bg-teal-900 disabled:opacity-60"
      >
        {pending ? "Saving…" : "Save order changes"}
      </button>
    </section>
  );
}
