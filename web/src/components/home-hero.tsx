import Image from "next/image";
import Link from "next/link";

/** Cool-toned clinical workspace — Unsplash (free to use under Unsplash License). */
const HERO_IMAGE =
  "https://images.unsplash.com/photo-1551601651-2a8555f1a136?auto=format&fit=crop&w=2400&q=80";

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
    <section className="relative min-h-[min(100svh,920px)] w-full overflow-x-hidden bg-zinc-900">
      <Image
        src={HERO_IMAGE}
        alt="Clinical professional in a modern care setting"
        fill
        priority
        className="object-cover object-[center_30%]"
        sizes="100vw"
      />
      <div
        className="absolute inset-0 bg-gradient-to-r from-black/55 via-black/35 to-black/20"
        aria-hidden
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-black/25" aria-hidden />

      <div className="relative z-10 mx-auto flex min-h-[min(100svh,920px)] max-w-6xl flex-col justify-end px-5 pb-14 pt-36 sm:px-8 sm:pb-20 sm:pt-40 md:items-end md:justify-center md:pb-28 md:pt-32">
        <div className="w-full max-w-xl md:text-right">
          <p className="text-xs font-medium uppercase tracking-[0.22em] text-white/75 sm:text-sm">
            Licensed professionals
          </p>
          <h1 className="mt-4 text-3xl font-semibold leading-[1.15] text-white sm:text-4xl md:text-5xl lg:text-[3.25rem]">
            Original injectables & research peptides at wholesale-style pricing
          </h1>
          <p className="mt-5 max-w-lg text-sm leading-relaxed text-white/85 md:ml-auto">
            Dermal fillers, toxins, mesotherapy, skincare, and peptides — reviewed by CSR;
            payment completed offline per your workflow.
          </p>

          <div className="mt-10 flex flex-col items-stretch gap-6 md:items-end">
            <div className="flex w-full max-w-lg items-center justify-end gap-4 md:ml-auto">
              <span className="h-px max-w-[min(100%,14rem)] flex-1 bg-white/40" aria-hidden />
              <Link
                href="/shop"
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white text-emerald-900 shadow-md transition hover:bg-emerald-50"
                aria-label="Browse catalog"
              >
                <ArrowRightIcon className="h-5 w-5" />
              </Link>
            </div>
            <p className="text-xs font-medium uppercase tracking-widest text-white/60 md:text-right">
              Where clinical supply meets convenience
            </p>
            <div className="flex flex-wrap gap-3 md:justify-end">
              <Link
                href="/shop"
                className="rounded-full bg-white px-6 py-2.5 text-sm font-semibold text-emerald-900 shadow transition hover:bg-emerald-50"
              >
                Browse catalog
              </Link>
              <Link
                href="/peptides"
                className="rounded-full border border-white/50 bg-white/10 px-6 py-2.5 text-sm font-semibold text-white backdrop-blur-sm transition hover:bg-white/20"
              >
                Peptides
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
