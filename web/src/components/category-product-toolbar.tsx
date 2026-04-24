"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";

type Props = { basePath: string };

const SORT_OPTIONS: { value: string; label: string }[] = [
  { value: "master_asc", label: "Product master list" },
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

  const syncFromUrl = useCallback(() => {
    setQDraft(sp.get("q") ?? "");
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

  const sortValue = sp.get("sort") ?? "master_asc";

  const hasFilters = useMemo(() => {
    return (
      (sp.get("q")?.trim() ?? "").length > 0 ||
      (sp.get("sort") != null && sp.get("sort") !== "master_asc")
    );
  }, [sp]);

  const applySearch = () => {
    push({
      q: qDraft.trim() || null,
      page: null,
    });
  };

  return (
    <div
      className={
        "mt-6 gap-4 md:mt-8 md:rounded-xl md:border md:border-zinc-200 md:bg-white md:p-4 md:shadow-sm " +
        "flex flex-col sm:flex-row sm:flex-wrap sm:items-end"
      }
    >
      <div className="min-w-0 flex-1 sm:max-w-md">
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
                applySearch();
              }
            }}
            placeholder="Product name…"
            className="w-full rounded-md border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-teal-600 focus:ring-1 focus:ring-teal-600"
          />
          <button
            type="button"
            onClick={() => applySearch()}
            className="shrink-0 rounded-md bg-teal-800 px-3 py-2 text-sm font-medium text-white hover:bg-teal-900"
          >
            Search
          </button>
        </div>
      </div>

      <div className="sm:min-w-[12rem]">
        <label htmlFor="cat-filter-sort" className="text-xs font-medium text-zinc-600">
          Sort
        </label>
        <select
          id="cat-filter-sort"
          value={SORT_OPTIONS.some((o) => o.value === sortValue) ? sortValue : "master_asc"}
          onChange={(e) => {
            const v = e.target.value;
            push({ sort: v === "master_asc" ? null : v, page: null });
          }}
          className="mt-1 block w-full min-w-[12rem] rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm outline-none focus:border-teal-600 focus:ring-1 focus:ring-teal-600"
        >
          {SORT_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      </div>

      {hasFilters ? (
        <div className="w-full sm:w-auto sm:pt-5">
          <Link
            href={basePath}
            className="text-sm font-medium text-teal-800 underline-offset-2 hover:underline"
            scroll={false}
          >
            Clear filters
          </Link>
        </div>
      ) : null}
    </div>
  );
}
