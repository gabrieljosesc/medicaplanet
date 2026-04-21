import Link from "next/link";

const tabs: { value: string; label: string }[] = [
  { value: "all", label: "All" },
  { value: "pending_csr", label: "Pending review" },
  { value: "confirmed", label: "Confirmed" },
  { value: "shipped", label: "Shipped" },
  { value: "cancelled", label: "Cancelled" },
];

export function PurchaseFilters({
  currentStatus,
  q,
}: {
  currentStatus?: string;
  q?: string;
}) {
  const active = currentStatus && currentStatus !== "all" ? currentStatus : "all";
  const qPart = q?.trim() ? `&q=${encodeURIComponent(q.trim())}` : "";

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div className="flex flex-wrap gap-2">
        {tabs.map((t) => {
          const isOn = t.value === active;
          const href =
            t.value === "all"
              ? q?.trim()
                ? `/account/purchases?q=${encodeURIComponent(q.trim())}`
                : "/account/purchases"
              : `/account/purchases?status=${encodeURIComponent(t.value)}${qPart}`;
          return (
            <Link
              key={t.value}
              href={href}
              className={
                isOn
                  ? "rounded-full bg-emerald-800 px-3 py-1.5 text-xs font-medium text-white"
                  : "rounded-full border border-zinc-200 bg-white px-3 py-1.5 text-xs font-medium text-zinc-700 hover:border-emerald-300"
              }
            >
              {t.label}
            </Link>
          );
        })}
      </div>
      <form method="get" className="flex w-full max-w-sm gap-2">
        {active !== "all" ? <input type="hidden" name="status" value={active} /> : null}
        <input
          name="q"
          defaultValue={q ?? ""}
          placeholder="Search order ID or product…"
          className="min-w-0 flex-1 rounded-lg border border-zinc-300 px-3 py-2 text-sm"
        />
        <button
          type="submit"
          className="rounded-lg border border-emerald-800 px-3 py-2 text-sm font-medium text-emerald-900 hover:bg-emerald-50"
        >
          Search
        </button>
      </form>
    </div>
  );
}
