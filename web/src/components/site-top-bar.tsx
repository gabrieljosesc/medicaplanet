import Link from "next/link";
import { TOP_BAR_NAV } from "@/lib/nav-config";
import { SITE_EMAIL, SITE_PHONE_DISPLAY, SITE_PHONE_TEL } from "@/lib/site-constants";

export function SiteTopBar() {
  return (
    <div className="border-b border-filler-peach-400/30 bg-filler-cream/90 text-[13px] text-filler-ink/85">
      <div className="mx-auto flex max-w-6xl flex-col gap-1.5 px-4 py-1.5 sm:flex-row sm:items-center sm:justify-between sm:py-2">
        <p className="flex flex-wrap items-center gap-x-3 gap-y-0.5">
          <a
            href={SITE_PHONE_TEL}
            className="whitespace-nowrap font-medium text-filler-ink hover:underline"
          >
            {SITE_PHONE_DISPLAY}
          </a>
          <span className="text-filler-ink/35" aria-hidden>
            |
          </span>
          <a
            href={`mailto:${SITE_EMAIL}`}
            className="min-w-0 break-all text-filler-ink hover:underline sm:max-w-[50%]"
          >
            {SITE_EMAIL}
          </a>
        </p>
        <nav
          className="flex flex-wrap items-center justify-end gap-x-1 gap-y-0.5"
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
