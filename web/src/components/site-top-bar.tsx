import Link from "next/link";
import { TOP_BAR_NAV } from "@/lib/nav-config";
import { SITE_EMAIL, SITE_PHONE_DISPLAY, SITE_PHONE_TEL } from "@/lib/site-constants";

export function SiteTopBar() {
  return (
    <div className="border-b border-filler-peach-400/30 bg-filler-cream/90 text-[13px] text-filler-ink/85">
      <div className="mx-auto flex max-w-6xl flex-col gap-1.5 px-4 py-1.5 sm:flex-row sm:items-center sm:justify-between sm:py-2">
        <div className="flex flex-wrap items-center gap-2">
          <a
            href={SITE_PHONE_TEL}
            className="inline-flex items-center gap-1 rounded-full border border-filler-peach-300 bg-white px-3 py-1 font-medium text-filler-ink shadow-sm transition hover:border-filler-peach-400 hover:bg-filler-peach-200/40"
          >
            <span aria-hidden>📞</span>
            <span>{SITE_PHONE_DISPLAY}</span>
          </a>
          <a
            href={`mailto:${SITE_EMAIL}`}
            className="inline-flex min-w-0 items-center gap-1 rounded-full border border-filler-peach-300 bg-white px-3 py-1 font-medium text-filler-ink shadow-sm transition hover:border-filler-peach-400 hover:bg-filler-peach-200/40 sm:max-w-[50%]"
          >
            <span aria-hidden>✉️</span>
            <span className="truncate">{SITE_EMAIL}</span>
          </a>
        </div>
        <nav
          className="hidden flex-wrap items-center justify-end gap-x-1 gap-y-0.5 sm:flex"
          aria-label="Secondary"
        >
          {TOP_BAR_NAV.map((n, i) => (
            <span key={n.href} className="inline-flex items-center gap-1 text-filler-ink/70">
              {i > 0 ? (
                <span className="text-filler-ink/25" aria-hidden>
                  ·
                </span>
              ) : null}
              <Link
                href={n.href}
                className="rounded-sm px-0.5 font-medium text-filler-ink/80 transition hover:text-filler-rose-700"
              >
                {n.label}
              </Link>
            </span>
          ))}
        </nav>
      </div>
    </div>
  );
}
