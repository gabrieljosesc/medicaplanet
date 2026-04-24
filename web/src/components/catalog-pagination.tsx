"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";

type Props = {
  basePath: string;
  currentPage: number;
  totalPages: number;
};

function buildHref(basePath: string, sp: URLSearchParams, nextPage: number) {
  const p = new URLSearchParams(sp.toString());
  if (nextPage <= 1) p.delete("page");
  else p.set("page", String(nextPage));
  const qs = p.toString();
  return qs ? `${basePath}?${qs}` : basePath;
}

export function CatalogPagination({ basePath, currentPage, totalPages }: Props) {
  const sp = useSearchParams();
  if (totalPages <= 1) return null;

  const page = Math.min(Math.max(1, currentPage), totalPages);
  const show = simpleWindow(page, totalPages);
  return (
    <nav
      className="mt-10 flex flex-wrap items-center justify-center gap-2"
      aria-label="Pagination"
    >
      {page > 1 ? (
        <Link
          href={buildHref(basePath, sp, page - 1)}
          scroll={false}
          className="flex h-9 w-9 items-center justify-center rounded-full border border-filler-rose-300/90 bg-white text-sm font-medium text-filler-ink transition hover:border-filler-rose-400 hover:bg-filler-peach-200/30"
        >
          ←
        </Link>
      ) : (
        <span
          className="flex h-9 w-9 items-center justify-center rounded-full border border-filler-peach-200/80 bg-zinc-50/80 text-sm text-filler-ink/25"
          aria-hidden
        >
          ←
        </span>
      )}

      {show.map((item, i) =>
        item === "ellipsis" ? (
          <span
            key={`e-${i}`}
            className="flex h-9 min-w-9 items-center justify-center rounded-full border border-filler-rose-300/90 bg-white px-1.5 text-sm text-filler-ink"
          >
            …
          </span>
        ) : (
          <Link
            key={item}
            href={buildHref(basePath, sp, item)}
            scroll={false}
            className={
              item === page
                ? "flex h-9 w-9 items-center justify-center rounded-full border border-filler-rose-400 bg-filler-pink-300/95 text-sm font-semibold text-white shadow-[0_0_0_3px_rgba(251,182,206,0.4)]"
                : "flex h-9 w-9 items-center justify-center rounded-full border border-filler-rose-300/90 bg-white text-sm font-medium text-filler-ink transition hover:border-filler-rose-400 hover:bg-filler-peach-200/30"
            }
            aria-current={item === page ? "page" : undefined}
          >
            {item}
          </Link>
        )
      )}

      {page < totalPages ? (
        <Link
          href={buildHref(basePath, sp, page + 1)}
          scroll={false}
          className="flex h-9 w-9 items-center justify-center rounded-full border border-filler-rose-300/90 bg-white text-sm font-medium text-filler-ink transition hover:border-filler-rose-400 hover:bg-filler-peach-200/30"
        >
          →
        </Link>
      ) : (
        <span
          className="flex h-9 w-9 items-center justify-center rounded-full border border-filler-peach-200/80 bg-zinc-50/80 text-sm text-filler-ink/25"
          aria-hidden
        >
          →
        </span>
      )}
    </nav>
  );
}

function simpleWindow(c: number, t: number): (number | "ellipsis")[] {
  if (t <= 7) return Array.from({ length: t }, (_, i) => i + 1);
  if (c <= 3) return [1, 2, 3, "ellipsis", t];
  if (c >= t - 2) return [1, "ellipsis", t - 2, t - 1, t];
  return [1, "ellipsis", c - 1, c, c + 1, "ellipsis", t];
}
