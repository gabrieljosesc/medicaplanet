import Image from "next/image";
import Link from "next/link";
import { HomeHeroSlideshow } from "@/components/home-hero-slideshow";
import { HeroIllustration } from "@/components/hero-illustration";
import { HOME_HERO_ILLUSTRATION_SRC, HOME_HERO_USE_CURATED } from "@/lib/home-hero-curated";
import type { MonthlyHighlightSlide } from "@/lib/monthly-highlight-slides";

/**
 * FillerSupplies-style hero: "Monthly highlights" title, rotating product feature on the left,
 * optional PNG on the right (replaces the inline vector lady when `HOME_HERO_USE_CURATED`).
 */
export function HomeHero({
  slides,
  heroIllustrationSrc,
}: {
  slides: MonthlyHighlightSlide[];
  /** Override; defaults to curated PNG when curated mode is on. */
  heroIllustrationSrc?: string | null;
}) {
  const rightArtSrc =
    heroIllustrationSrc !== undefined
      ? heroIllustrationSrc
      : HOME_HERO_USE_CURATED
        ? HOME_HERO_ILLUSTRATION_SRC
        : null;
  return (
    <section className="relative overflow-hidden bg-filler-cream">
      <div className="pointer-events-none absolute inset-0" aria-hidden>
        <div className="absolute -right-20 -top-10 h-72 w-72 rounded-full bg-filler-pink-200/60 blur-2xl" />
        <div className="absolute -left-10 top-32 h-64 w-64 rounded-full bg-filler-peach-300/50 blur-2xl" />
        <div className="absolute bottom-0 right-1/4 h-48 w-96 rounded-[100%] bg-filler-coral-400/25" />
        <div className="absolute bottom-8 left-8 h-32 w-64 rotate-6 rounded-full bg-filler-pink-300/30" />
      </div>

      <div className="relative z-10 mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-14 lg:py-20">
        <div className="relative grid items-start gap-8 lg:grid-cols-[1fr_auto] lg:gap-10">
          <div className="relative z-10 pr-[36vw] sm:pr-[32vw] lg:pr-0">
            <h1 className="text-xl font-bold tracking-wide text-filler-ink sm:text-2xl">
              MONTHLY HIGHLIGHTS
            </h1>
            <HomeHeroSlideshow slides={slides} />
          </div>
          <div className="pointer-events-none absolute right-1 top-2 z-[5] w-[38vw] max-w-[180px] sm:right-4 sm:top-4 sm:w-[30vw] sm:max-w-[220px] lg:pointer-events-auto lg:static lg:z-auto lg:flex lg:min-h-0 lg:w-full lg:max-w-[310px] lg:justify-end lg:items-start lg:self-start">
            <div className="relative w-full lg:max-w-[310px]">
              <div className="absolute inset-0 top-4 scale-90 rounded-3xl bg-filler-pink-200/40 blur-xl" />
              {rightArtSrc ? (
                <Image
                  src={rightArtSrc}
                  alt=""
                  width={420}
                  height={420}
                  unoptimized
                  className="relative h-auto w-full max-w-md bg-transparent object-contain"
                  priority
                />
              ) : (
                <HeroIllustration className="relative flex justify-center" />
              )}
            </div>
          </div>
        </div>
        <div className="relative z-10 mt-12 flex justify-center sm:mt-16">
          <Link
            href="/shop"
            className="inline-flex items-center justify-center rounded-full bg-filler-rose-700 px-12 py-2.5 text-base font-semibold tracking-wider text-white shadow-md transition-colors hover:bg-filler-rose-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-filler-rose-600/60 focus-visible:ring-offset-2 sm:px-14 sm:py-3 sm:text-lg"
          >
            SHOP
          </Link>
        </div>
      </div>
    </section>
  );
}

export type { MonthlyHighlightSlide } from "@/lib/monthly-highlight-slides";
