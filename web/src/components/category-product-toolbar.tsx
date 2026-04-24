"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";

type Props = { basePath: string };

const SORT_OPTIONS: { value: string; label: string }[] = [
  { value: "title_asc", label: "Name A–Z" },
  { value: "title_desc", label: "Name Z–A" },
  { value: "price_asc", label: "Price: low to high" },
  { value: "price_desc", label: "Price: high to low" },
  { value: "rating_desc", label: "Rating: high to low" },
  { value: "newest", label: "Newest first" },
];

function mergeParams(
  current: URLSearchParams,
  patch: Record<string, string | null | undefined>
): string {
  const next = new URLSearchParams(current.toString());
  for (const [k, v] of Object.entries(patch)) {
    if (v === null || v === undefined || v === "") next.delete(k);
    else next.set(k, v);
  }
  const s = next.toString();
  return s ? `${s}` : "";
}

export function CategoryProductToolbar({ basePath }: Props) {
  const router = useRouter();
  const sp = useSearchParams();

  const [qDraft, setQDraft] = useState("");
  const [minDraft, setMinDraft] = useState("");
  const [maxDraft, setMaxDraft] = useState("");

  const syncFromUrl = useCallback(() => {
    setQDraft(sp.get("q") ?? "");
    setMinDraft(sp.get("min") ?? "");
    setMaxDraft(sp.get("max") ?? "");
  }, [sp]);

  useEffect(() => {
    syncFromUrl();
  }, [syncFromUrl]);

  const push = useCallback(
    (patch: Record<string, string | null | undefined>) => {
      const qs = mergeParams(sp, patch);
      router.push(qs ? `${basePath}?${qs}` : basePath, { scroll: false });
    },
    [router, basePath, sp]
  );

  const sortValue = sp.get("sort") ?? "title_asc";
  const featured = sp.get("featured") === "1" || sp.get("featured") === "true";

  const hasFilters = useMemo(() => {
    return (
      (sp.get("q")?.trim() ?? "").length > 0 ||
      (sp.get("min") ?? "") !== "" ||
      (sp.get("max") ?? "") !== "" ||
      featured ||
      (sp.get("sort") && sp.get("sort") !== "title_asc")
    );
  }, [sp, featured]);

  const applySearchAndPrice = () => {
    push({
      q: qDraft.trim() || null,
      min: minDraft.trim() || null,
      max: maxDraft.trim() || null,
    });
  };

  return (
    <div className="mt-8 rounded-xl border border-zinc-200 bg-white p-4 shadow-sm">
      <div className="flex flex-col gap-4 lg:flex-row lg:flex-wrap lg:items-end">
        <div className="min-w-0 flex-1 lg:max-w-md">
          <label htmlFor="cat-filter-q" className="text-xs font-medium text-zinc-600">
            Search in category
          </label>
          <div className="mt-1 flex gap-2">
            <input
              id="cat-filter-q"
              type="search"
              value={qDraft}
              onChange={(e) => setQDraft(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  applySearchAndPrice();
                }
              }}
              placeholder="Product name…"
              className="w-full rounded-md border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-teal-600 focus:ring-1 focus:ring-teal-600"
            />
            <button
              type="button"
              onClick={() => applySearchAndPrice()}
              className="shrink-0 rounded-md bg-teal-800 px-3 py-2 text-sm font-medium text-white hover:bg-teal-900"
            >
              Search
            </button>
          </div>
        </div>

        <div>
          <label htmlFor="cat-filter-sort" className="text-xs font-medium text-zinc-600">
            Sort
          </label>
          <select
            id="cat-filter-sort"
            value={SORT_OPTIONS.some((o) => o.value === sortValue) ? sortValue : "title_asc"}
            onChange={(e) => push({ sort: e.target.value === "title_asc" ? null : e.target.value })}
            className="mt-1 block w-full min-w-[12rem] rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm outline-none focus:border-teal-600 focus:ring-1 focus:ring-teal-600 lg:w-auto"
          >
            {SORT_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-wrap gap-3 sm:items-end">
          <div>
            <label htmlFor="cat-filter-min" className="text-xs font-medium text-zinc-600">
              Min price
            </label>
            <input
              id="cat-filter-min"
              type="number"
              inputMode="decimal"
              min={0}
              step="1"
              placeholder="0"
              value={minDraft}
              onChange={(e) => setMinDraft(e.target.value)}
              className="mt-1 block w-full min-w-[6.5rem] rounded-md border border-zinc-300 px-3 py-2 text-sm sm:w-28"
            />
          </div>
          <div>
            <label htmlFor="cat-filter-max" className="text-xs font-medium text-zinc-600">
              Max price
            </label>
            <input
              id="cat-filter-max"
              type="number"
              inputMode="decimal"
              min={0}
              step="1"
              placeholder="Any"
              value={maxDraft}
              onChange={(e) => setMaxDraft(e.target.value)}
              className="mt-1 block w-full min-w-[6.5rem] rounded-md border border-zinc-300 px-3 py-2 text-sm sm:w-28"
            />
          </div>
          <button
            type="button"
            onClick={() => applySearchAndPrice()}
            className="rounded-md border border-zinc-300 bg-zinc-50 px-3 py-2 text-sm font-medium text-zinc-800 hover:bg-zinc-100"
          >
            Apply prices
          </button>
        </div>

        <label className="flex cursor-pointer items-center gap-2 text-sm text-zinc-700">
          <input
            type="checkbox"
            checked={featured}
            onChange={(e) => push({ featured: e.target.checked ? "1" : null })}
            className="size-4 rounded border-zinc-400 text-teal-800 focus:ring-teal-600"
          />
          Featured only
        </label>

        {hasFilters ? (
          <Link
            href={basePath}
            className="text-sm font-medium text-teal-800 underline-offset-2 hover:underline"
            scroll={false}
          >
            Clear all filters
          </Link>
        ) : null}
      </div>
    </div>
  );
}
