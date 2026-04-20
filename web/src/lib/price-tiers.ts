export type PriceTierRow = {
  minQ: number;
  maxQ: number;
  price: number;
};

function isTierRow(x: unknown): x is PriceTierRow {
  if (!x || typeof x !== "object") return false;
  const o = x as Record<string, unknown>;
  return (
    typeof o.minQ === "number" &&
    typeof o.maxQ === "number" &&
    typeof o.price === "number" &&
    Number.isFinite(o.minQ) &&
    Number.isFinite(o.maxQ) &&
    Number.isFinite(o.price)
  );
}

export function parsePriceTiersJson(raw: unknown): PriceTierRow[] {
  if (!Array.isArray(raw)) return [];
  const rows = raw.filter(isTierRow);
  return [...rows].sort((a, b) => a.minQ - b.minQ || a.maxQ - b.maxQ);
}

/** Unit price for quantity `qty` using tier brackets; falls back to `fallback` when no tiers. */
export function unitPriceForQuantity(
  tiers: PriceTierRow[] | null | undefined,
  qty: number,
  fallback: number
): number {
  const t = tiers?.length ? tiers : [];
  if (!t.length) return fallback;
  const q = Math.max(1, Math.floor(qty));
  const sorted = [...t].sort((a, b) => a.minQ - b.minQ);
  for (let i = sorted.length - 1; i >= 0; i--) {
    const row = sorted[i];
    if (q >= row.minQ && q <= row.maxQ) return row.price;
  }
  if (q < sorted[0].minQ) return sorted[0].price;
  return sorted[sorted.length - 1].price;
}

export function tierQuantityLabel(t: PriceTierRow): string {
  if (t.maxQ >= 10_000) return `Buy ${t.minQ}+`;
  return `Buy ${t.minQ}–${t.maxQ}`;
}

export function formatMoney(currency: string, amount: number): string {
  if (!Number.isFinite(amount)) return "—";
  if (currency === "USD") return `$${amount.toFixed(2)}`;
  return `${currency} ${amount.toFixed(2)}`;
}
