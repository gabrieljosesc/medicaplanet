"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

type Props = {
  basePath: string;
  /** When set, suggestions are limited to this catalog category (matches `/category/[slug]`). */
  categorySlug?: string | null;
};

const SORT_OPTIONS: { value: string; label: string }[] = [
  { value: "master_asc", label: "Product master list" },
  { value: "title_asc", label: "Name A–Z" },
  { value: "title_desc", label: "Name Z–A" },
  { value: "price_asc", label: "Price: low to high" },
  { value: "price_desc", label: "Price: high to low" },
  { value: "rating_desc", label: "Rating: high to low" },
  { value: "newest", label: "Newest first" },
];

const LIVE_FILTER_DEBOUNCE_MS = 380;
const SUGGEST_DEBOUNCE_MS = 200;

type SuggestItem = { slug: string; title: string; category: string | null };

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

export function CategoryProductToolbar({ basePath, categorySlug }: Props) {
  const router = useRouter();
  const sp = useSearchParams();
  const urlQ = sp.get("q") ?? "";

  const [qDraft, setQDraft] = useState("");
  const [suggestions, setSuggestions] = useState<SuggestItem[]>([]);
  const [suggestLoading, setSuggestLoading] = useState(false);
  const [panelOpen, setPanelOpen] = useState(false);
  const [highlight, setHighlight] = useState(-1);

  const wrapRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

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

  /** Debounced live filter: URL `q` tracks input */
  useEffect(() => {
    const next = qDraft.trim();
    const cur = urlQ.trim();
    if (next === cur) return;
    const id = setTimeout(() => {
      push({
        q: next || null,
        page: null,
      });
    }, LIVE_FILTER_DEBOUNCE_MS);
    return () => clearTimeout(id);
  }, [qDraft, urlQ, push]);

  /** Suggestions (reuse `/api/search-suggest`) */
  useEffect(() => {
    const t = qDraft.trim();
    if (t.length < 2) {
      setSuggestions([]);
      setSuggestLoading(false);
      setHighlight(-1);
      return;
    }

    const ac = new AbortController();
    setSuggestLoading(true);
    setHighlight(-1);

    const timer = setTimeout(async () => {
      try {
        const params = new URLSearchParams({ q: t });
        if (categorySlug) params.set("categorySlug", categorySlug);
        const res = await fetch(`/api/search-suggest?${params.toString()}`, { signal: ac.signal });
        if (!res.ok) {
          setSuggestions([]);
          return;
        }
        const data = (await res.json()) as { items?: SuggestItem[] };
        setSuggestions(Array.isArray(data.items) ? data.items : []);
      } catch {
        if (!ac.signal.aborted) setSuggestions([]);
      } finally {
        if (!ac.signal.aborted) setSuggestLoading(false);
      }
    }, SUGGEST_DEBOUNCE_MS);

    return () => {
      clearTimeout(timer);
      ac.abort();
    };
  }, [qDraft, categorySlug]);

  useEffect(() => {
    if (!panelOpen) return;
    const onDoc = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) {
        setPanelOpen(false);
        setHighlight(-1);
      }
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [panelOpen]);

  useEffect(() => {
    if (highlight < 0 || !listRef.current) return;
    const el = listRef.current.querySelector<HTMLElement>(`[data-suggest-index="${highlight}"]`);
    el?.scrollIntoView({ block: "nearest" });
  }, [highlight]);

  const sortValue = sp.get("sort") ?? "master_asc";

  const hasFilters = useMemo(() => {
    return (
      (sp.get("q")?.trim() ?? "").length > 0 ||
      (sp.get("sort") != null && sp.get("sort") !== "master_asc")
    );
  }, [sp]);

  const applySearchNow = () => {
    push({
      q: qDraft.trim() || null,
      page: null,
    });
    setPanelOpen(false);
  };

  const pickSuggestion = (item: SuggestItem) => {
    setQDraft(item.title);
    push({ q: item.title, page: null });
    setPanelOpen(false);
    setSuggestions([]);
    setHighlight(-1);
  };

  const showDropdown = panelOpen && qDraft.trim().length >= 2;

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
        <div ref={wrapRef} className="relative mt-1">
          <div className="flex gap-2">
            <input
              id="cat-filter-q"
              type="search"
              autoComplete="off"
              value={qDraft}
              onChange={(e) => {
                setQDraft(e.target.value);
                setPanelOpen(true);
              }}
              onFocus={() => setPanelOpen(true)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  if (highlight >= 0 && suggestions[highlight]) {
                    pickSuggestion(suggestions[highlight]);
                  } else {
                    applySearchNow();
                  }
                  return;
                }
                if (e.key === "Escape") {
                  setPanelOpen(false);
                  setHighlight(-1);
                  return;
                }
                if (!showDropdown || suggestions.length === 0) return;
                if (e.key === "ArrowDown") {
                  e.preventDefault();
                  setHighlight((h) => (h + 1 >= suggestions.length ? 0 : h + 1));
                } else if (e.key === "ArrowUp") {
                  e.preventDefault();
                  setHighlight((h) => (h <= 0 ? suggestions.length - 1 : h - 1));
                }
              }}
              placeholder="Product name…"
              role="combobox"
              aria-expanded={showDropdown}
              aria-controls={showDropdown ? "cat-search-suggestions" : undefined}
              aria-autocomplete="list"
              className="min-w-0 flex-1 rounded-md border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-teal-600 focus:ring-1 focus:ring-teal-600"
            />
            <button
              type="button"
              onClick={() => applySearchNow()}
              className="shrink-0 rounded-md bg-teal-800 px-3 py-2 text-sm font-medium text-white hover:bg-teal-900"
            >
              Search
            </button>
          </div>

          {showDropdown ? (
            <div
              id="cat-search-suggestions"
              role="listbox"
              aria-label="Product suggestions"
              className="absolute left-0 right-0 top-[calc(100%+0.35rem)] z-50 max-h-72 overflow-hidden rounded-lg border border-zinc-200 bg-white py-1 text-sm shadow-lg ring-1 ring-black/5"
            >
              {suggestLoading && suggestions.length === 0 ? (
                <p className="px-3 py-2 text-xs text-zinc-500">Searching…</p>
              ) : null}
              {!suggestLoading && suggestions.length === 0 ? (
                <p className="px-3 py-2 text-xs text-zinc-600">No matching product titles.</p>
              ) : null}
              <ul ref={listRef} className="max-h-64 overflow-y-auto py-0.5">
                {suggestions.map((item, i) => (
                  <li key={item.slug} role="option" aria-selected={highlight === i}>
                    <button
                      type="button"
                      data-suggest-index={i}
                      onMouseEnter={() => setHighlight(i)}
                      onClick={() => pickSuggestion(item)}
                      className={`flex w-full flex-col px-3 py-2 text-left transition ${
                        highlight === i ? "bg-teal-50" : "hover:bg-zinc-50"
                      }`}
                    >
                      <span className="line-clamp-2 font-medium text-zinc-900">{item.title}</span>
                      {item.category ? (
                        <span className="mt-0.5 text-xs text-teal-800/90">{item.category}</span>
                      ) : null}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </div>
        <p className="mt-1.5 text-[11px] text-zinc-500">
          Results update as you type; suggestions appear after 2+ letters.
        </p>
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
