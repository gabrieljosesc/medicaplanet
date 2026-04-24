import Link from "next/link";
import { HeroIllustration } from "@/components/hero-illustration";

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

/** Filler-supplies style: no photo; soft organic shapes, warm palette, illustrated figure. */
export function HomeHero() {
  return (
    <section className="relative overflow-hidden bg-filler-cream">
      <div className="pointer-events-none absolute inset-0" aria-hidden>
        <div className="absolute -right-20 -top-10 h-72 w-72 rounded-full bg-filler-pink-200/60 blur-2xl" />
        <div className="absolute -left-10 top-32 h-64 w-64 rounded-full bg-filler-peach-300/50 blur-2xl" />
        <div className="absolute bottom-0 right-1/4 h-48 w-96 rounded-[100%] bg-filler-coral-400/25" />
        <div className="absolute bottom-8 left-8 h-32 w-64 rotate-6 rounded-full bg-filler-pink-300/30" />
      </div>

      <div className="relative z-10 mx-auto grid max-w-6xl items-center gap-8 px-4 py-12 sm:px-6 sm:py-16 lg:grid-cols-2 lg:gap-12 lg:py-20">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-filler-rose-700/90 sm:text-sm">
            Monthly highlights
          </p>
          <h1 className="mt-3 text-3xl font-bold leading-tight tracking-tight text-filler-ink sm:text-4xl lg:text-[2.4rem] lg:leading-[1.12]">
            Licensed injectables, toxins &amp; research peptides in one place
          </h1>
          <p className="mt-4 max-w-lg text-sm leading-relaxed text-filler-ink/80 sm:text-base">
            Curated for professionals: dermal fillers, botulinum toxins, mesotherapy, skincare, and
            peptides—with order review, verification, and fulfillment support.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
            <Link
              href="/shop"
              className="inline-flex h-12 min-w-[10rem] items-center justify-center rounded-full bg-filler-pink-400 px-6 text-sm font-semibold text-filler-ink shadow-md transition hover:bg-filler-pink-300"
            >
              Shop products
            </Link>
            <Link
              href="/peptides"
              className="inline-flex h-12 min-w-[10rem] items-center justify-center rounded-full border-2 border-filler-rose-600/40 bg-white/70 px-6 text-sm font-semibold text-filler-ink/90 shadow-sm transition hover:border-filler-rose-600/60"
            >
              Peptides
            </Link>
            <Link
              href="/shop"
              className="inline-flex items-center justify-center gap-1.5 text-sm font-semibold text-filler-rose-800 hover:underline"
            >
              See monthly specials
              <ArrowRightIcon className="h-4 w-4" />
            </Link>
          </div>
        </div>
        <div className="flex justify-center lg:justify-end">
          <div className="relative w-full max-w-[420px]">
            <div className="absolute inset-0 top-4 scale-90 rounded-3xl bg-filler-pink-200/40 blur-xl" />
            <HeroIllustration className="relative flex justify-center" />
          </div>
        </div>
      </div>
    </section>
  );
}
