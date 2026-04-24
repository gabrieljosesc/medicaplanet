import Image from "next/image";
import Link from "next/link";

/** Calm clinical environment — Unsplash (Unsplash License). */
const HERO_IMAGE =
  "https://images.unsplash.com/photo-1551884170-09fb70a3a2ed?auto=format&fit=crop&w=2400&q=80";

function ArrowRightIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      className={className}
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M5 12h14M13 6l6 6-6 6" />
    </svg>
  );
}

export function HomeHero() {
  return (
    <section className="relative min-h-[min(100svh,900px)] w-full overflow-x-hidden bg-slate-950">
      <Image
        src={HERO_IMAGE}
        alt="Clinical professional in a modern care setting"
        fill
        priority
        className="object-cover object-center"
        sizes="100vw"
      />
      <div
        className="absolute inset-0 bg-gradient-to-br from-slate-950/90 via-slate-950/55 to-teal-950/40"
        aria-hidden
      />
      <div
        className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_70%_20%,rgba(20,184,166,0.12),transparent_55%)]"
        aria-hidden
      />
      <div
        className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-slate-950/30"
        aria-hidden
      />

      <div className="relative z-10 mx-auto grid min-h-[min(100svh,900px)] max-w-6xl grid-cols-1 items-end gap-10 px-5 pb-16 pt-36 sm:px-8 sm:pb-20 sm:pt-40 lg:grid-cols-12 lg:items-center lg:pb-28 lg:pt-28">
        <div className="lg:col-span-7">
          <p className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-teal-200/95 backdrop-blur-sm sm:text-xs">
            <span className="h-1.5 w-1.5 rounded-full bg-teal-400 shadow-[0_0_12px_rgba(45,212,191,0.8)]" />
            Licensed supply
          </p>
          <h1 className="font-serif text-4xl font-medium leading-[1.12] tracking-tight text-white sm:text-5xl lg:text-[3.35rem] lg:leading-[1.08]">
            Original injectables &amp; research peptides for professional practice
          </h1>
          <p className="mt-5 max-w-xl text-sm leading-relaxed text-slate-200/90 sm:text-base">
            Dermal fillers, toxins, mesotherapy, skincare, and peptides—curated for licensed
            professionals, with secure order review and fulfillment support.
          </p>
        </div>

        <div className="flex flex-col gap-6 border-t border-white/10 pt-8 lg:col-span-5 lg:border-l lg:border-t-0 lg:pl-10 lg:pt-0">
          <p className="text-xs font-medium uppercase tracking-[0.22em] text-teal-200/80">
            Where clinical supply meets convenience
          </p>
          <div className="flex items-center gap-4">
            <span className="h-px flex-1 bg-gradient-to-r from-teal-400/50 to-transparent" aria-hidden />
            <Link
              href="/shop"
              className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-teal-400 text-slate-950 shadow-lg shadow-teal-900/30 transition hover:bg-teal-300"
              aria-label="Browse catalog"
            >
              <ArrowRightIcon className="h-5 w-5" />
            </Link>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
            <Link
              href="/shop"
              className="inline-flex min-h-11 items-center justify-center rounded-full bg-white px-7 text-sm font-semibold text-slate-900 shadow-md transition hover:bg-slate-100"
            >
              Browse catalog
            </Link>
            <Link
              href="/peptides"
              className="inline-flex min-h-11 items-center justify-center rounded-full border border-white/35 bg-white/5 px-7 text-sm font-semibold text-white backdrop-blur-sm transition hover:bg-white/10"
            >
              Peptides
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
