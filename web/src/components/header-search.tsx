"use client";

import { IconSearch } from "@/components/nav-icons";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";

type SuggestItem = { slug: string; title: string; category: string | null };

const DEBOUNCE_MS = 280;

export function HeaderSearch({ variant = "default" }: { variant?: "default" | "hero" }) {
  const hero = variant === "hero";
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const [suggestions, setSuggestions] = useState<SuggestItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [highlight, setHighlight] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const goProduct = useCallback(
    (slug: string) => {
      router.push(`/product/${slug}`);
      setOpen(false);
      setQ("");
      setSuggestions([]);
      setHighlight(-1);
    },
    [router]
  );

  const runFullSearch = useCallback(() => {
    const t = q.trim();
    if (t.length < 2) {
      inputRef.current?.focus();
      return;
    }
    router.push(`/search?q=${encodeURIComponent(t)}`);
    setOpen(false);
    setQ("");
    setSuggestions([]);
    setHighlight(-1);
  }, [q, router]);

  useEffect(() => {
    if (open) {
      inputRef.current?.focus();
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) {
        setOpen(false);
        setHighlight(-1);
      }
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        setHighlight(-1);
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  useEffect(() => {
    if (!open) {
      if (debounceRef.current) clearTimeout(debounceRef.current);
      abortRef.current?.abort();
      setSuggestions([]);
      setLoading(false);
      return;
    }

    const t = q.trim();
    if (t.length < 2) {
      if (debounceRef.current) clearTimeout(debounceRef.current);
      abortRef.current?.abort();
      setSuggestions([]);
      setLoading(false);
      setHighlight(-1);
      return;
    }

    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      abortRef.current?.abort();
      const ac = new AbortController();
      abortRef.current = ac;
      setSuggestions([]);
      setLoading(true);
      setHighlight(-1);
      try {
        const res = await fetch(`/api/search-suggest?q=${encodeURIComponent(t)}`, {
          signal: ac.signal,
        });
        if (!res.ok) {
          setSuggestions([]);
          return;
        }
        const data = (await res.json()) as { items?: SuggestItem[] };
        setSuggestions(Array.isArray(data.items) ? data.items : []);
      } catch {
        if (ac.signal.aborted) return;
        setSuggestions([]);
      } finally {
        if (!ac.signal.aborted) setLoading(false);
      }
    }, DEBOUNCE_MS);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [open, q]);

  useEffect(() => {
    if (highlight < 0 || !listRef.current) return;
    const el = listRef.current.querySelector<HTMLElement>(`[data-index="${highlight}"]`);
    el?.scrollIntoView({ block: "nearest" });
  }, [highlight]);

  const showPanel = open && q.trim().length >= 2;

  return (
    <div
      ref={wrapRef}
      className={hero ? "relative z-[115] flex items-center" : "relative z-[60] flex items-center"}
    >
      <div
        className={
          open
            ? hero
              ? "flex h-9 w-[min(18rem,calc(100vw-10rem))] max-w-[18rem] items-center rounded-full border border-white/45 bg-white/20 pl-3 shadow-lg backdrop-blur-md transition-[width,box-shadow,border-color] duration-300 ease-out"
              : "flex h-9 w-[min(18rem,calc(100vw-9rem))] max-w-[18rem] items-center rounded-full border border-zinc-200/90 bg-white/90 pl-3 shadow-md backdrop-blur-md transition-[width,box-shadow,border-color] duration-300 ease-out"
            : hero
              ? "flex h-9 w-9 items-center justify-center rounded-full border border-transparent bg-transparent transition-[width,box-shadow,border-color] duration-300 ease-out"
              : "flex h-9 w-9 items-center justify-center rounded-full border border-transparent bg-transparent transition-[width,box-shadow,border-color] duration-300 ease-out"
        }
      >
        <input
          ref={inputRef}
          type="search"
          name="q"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              if (highlight >= 0 && suggestions[highlight]) {
                goProduct(suggestions[highlight].slug);
              } else {
                runFullSearch();
              }
              return;
            }
            if (!showPanel || suggestions.length === 0) return;
            if (e.key === "ArrowDown") {
              e.preventDefault();
              setHighlight((h) => (h + 1 >= suggestions.length ? 0 : h + 1));
            } else if (e.key === "ArrowUp") {
              e.preventDefault();
              setHighlight((h) => (h <= 0 ? suggestions.length - 1 : h - 1));
            }
          }}
          placeholder="Search products…"
          aria-label="Search products"
          aria-autocomplete="list"
          aria-controls={showPanel ? "header-search-suggestions" : undefined}
          aria-expanded={showPanel && suggestions.length > 0}
          className={
            open
              ? hero
                ? "min-w-0 flex-1 border-0 bg-transparent py-1 pr-1 text-sm text-white outline-none placeholder:text-white/55"
                : "min-w-0 flex-1 border-0 bg-transparent py-1 pr-1 text-sm text-zinc-900 outline-none placeholder:text-zinc-400"
              : "pointer-events-none w-0 border-0 p-0 opacity-0"
          }
        />
        <button
          type="button"
          title={open ? "Search all matches" : "Open search"}
          aria-label={open ? "Search all matches" : "Open search"}
          aria-expanded={open}
          onClick={() => {
            if (open) runFullSearch();
            else setOpen(true);
          }}
          className={
            hero
              ? "inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-white hover:bg-white/15"
              : "inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-filler-rose-800 hover:bg-filler-peach-200/90 hover:text-filler-ink"
          }
        >
          <IconSearch className="h-[22px] w-[22px] shrink-0" />
        </button>
      </div>

      {showPanel && (
        <div
          id="header-search-suggestions"
          className={`absolute left-0 top-[calc(100%+0.35rem)] w-[min(20rem,calc(100vw-2rem))] max-w-[min(20rem,calc(100vw-2rem))] overflow-hidden rounded-2xl border border-zinc-200/70 bg-white/88 py-1 text-sm text-zinc-900 shadow-xl backdrop-blur-xl backdrop-saturate-150 ring-1 ring-black/5 ${hero ? "z-[120]" : "z-[70]"}`}
          role="listbox"
          aria-label="Product suggestions"
        >
          {loading && (
            <p className="px-3 py-2 text-xs text-zinc-500" role="status">
              Searching…
            </p>
          )}
          {!loading && suggestions.length === 0 && (
            <p className="px-3 py-2 text-xs text-zinc-600">
              No product titles match yet. Press{" "}
              <span className="font-medium text-zinc-800">Enter</span> to open the full search page.
            </p>
          )}
          {!loading && suggestions.length > 0 && (
            <>
              <p className="border-b border-zinc-100 px-3 py-1.5 text-[11px] font-medium uppercase tracking-wide text-zinc-500">
                Suggestions — same phrase, different products
              </p>
              <ul ref={listRef} className="max-h-72 overflow-y-auto py-0.5">
                {suggestions.map((item, i) => (
                  <li key={item.slug} role="option" aria-selected={highlight === i}>
                    <Link
                      href={`/product/${item.slug}`}
                      data-index={i}
                      onMouseEnter={() => setHighlight(i)}
                      onClick={() => {
                        setOpen(false);
                        setQ("");
                        setSuggestions([]);
                        setHighlight(-1);
                      }}
                      className={`block px-3 py-2 no-underline transition ${
                        highlight === i ? "bg-filler-peach-200/70" : "hover:bg-zinc-50"
                      }`}
                    >
                      <span className="line-clamp-2 text-sm font-medium text-zinc-900">{item.title}</span>
                      {item.category ? (
                        <span className="mt-0.5 block text-xs text-filler-rose-800/90">
                          {item.category}
                        </span>
                      ) : null}
                    </Link>
                  </li>
                ))}
              </ul>
              <div className="border-t border-zinc-100 px-2 py-1.5">
                <button
                  type="button"
                  onClick={() => runFullSearch()}
                  className="w-full rounded-lg px-2 py-1.5 text-left text-xs font-medium text-filler-rose-800 hover:bg-filler-peach-200/80"
                >
                  View all results for &ldquo;{q.trim()}&rdquo; →
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
