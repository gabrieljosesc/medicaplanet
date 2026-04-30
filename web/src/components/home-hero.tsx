import Image from "next/image";
import Link from "next/link";
import { HeroIllustration } from "@/components/hero-illustration";
import { HOME_HERO_ILLUSTRATION_SRC, HOME_HERO_USE_CURATED } from "@/lib/home-hero-curated";

/**
 * Home hero: lady illustration at the top-right corner, "Your Trusted Supplier"
 * headline + tagline centered in the middle, SHOP CTA centered, then a 5-up
 * trust badge row below.
 */
export function HomeHero({
  heroIllustrationSrc,
}: {
  /** Override; defaults to curated PNG when curated mode is on. */
  heroIllustrationSrc?: string | null;
} = {}) {
  const heroArtSrc =
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
        <div className="absolute right-0 top-44 h-40 w-72 rounded-[100%] bg-filler-coral-400/25 sm:right-2 sm:top-52 sm:h-44 sm:w-80 lg:right-4 lg:top-60 lg:h-48 lg:w-96" />
        <div className="absolute bottom-8 left-8 h-32 w-64 rotate-6 rounded-full bg-filler-pink-300/30" />
      </div>

      <div className="pointer-events-none absolute right-1 top-2 z-[5] w-[110px] sm:right-2 sm:top-4 sm:w-[160px] lg:right-4 lg:top-6 lg:w-[210px]">
        <div className="relative">
          <div className="absolute inset-0 top-2 scale-90 rounded-3xl bg-filler-pink-200/40 blur-xl" />
          {heroArtSrc ? (
            <Image
              src={heroArtSrc}
              alt=""
              width={420}
              height={420}
              unoptimized
              className="relative h-auto w-full bg-transparent object-contain"
              priority
            />
          ) : (
            <HeroIllustration className="relative flex justify-center" />
          )}
        </div>
      </div>

      <div className="relative z-10 mx-auto max-w-6xl px-4 pt-12 pb-20 sm:px-6 sm:pt-16 sm:pb-28 lg:pt-20 lg:pb-32">
        <div className="relative z-10 flex flex-col items-center justify-center text-center">
          <h2 className="text-3xl font-bold tracking-tight text-filler-ink sm:text-4xl lg:text-5xl">
            Your Trusted Supplier
          </h2>
          <p className="mt-3 text-sm font-medium text-filler-ink/70 sm:text-base lg:text-lg">
            Genuine Items at wholesale pricing
          </p>
          <Link
            href="/shop"
            className="mt-7 inline-flex items-center justify-center rounded-full bg-filler-rose-700 px-12 py-2.5 text-base font-semibold tracking-wider text-white shadow-md transition-colors hover:bg-filler-rose-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-filler-rose-600/60 focus-visible:ring-offset-2 sm:mt-9 sm:px-14 sm:py-3 sm:text-lg"
          >
            SHOP
          </Link>

          <ul
            className="mx-auto mt-12 flex w-full max-w-4xl snap-x snap-mandatory gap-3 overflow-x-auto px-1 pb-2 [-ms-overflow-style:none] [scrollbar-width:none] sm:mt-16 sm:grid sm:grid-cols-5 sm:gap-x-4 sm:overflow-visible sm:px-0 sm:pb-0 [&::-webkit-scrollbar]:hidden"
            aria-label="Why choose MedicaPlanet"
          >
            <FeatureBadge
              label={"Satisfaction\nGuarantee"}
              icon={
                <svg
                  viewBox="0 0 48 48"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={1.6}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden
                >
                  <path d="M24 6 9 12v10c0 9.5 6.5 17.7 15 20 8.5-2.3 15-10.5 15-20V12L24 6Z" />
                  <path d="m17 24 5 5 9-10" />
                </svg>
              }
            />
            <FeatureBadge
              label={"No Minimum\nOrder"}
              icon={
                <svg
                  viewBox="0 0 48 48"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={1.6}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden
                >
                  <path d="M9 12h4l3.5 18a3 3 0 0 0 3 2.4H35a3 3 0 0 0 2.95-2.4L40 18H16" />
                  <circle cx="20" cy="38" r="2.2" />
                  <circle cx="33" cy="38" r="2.2" />
                  <path d="M27 22v8M23 26h8" />
                </svg>
              }
            />
            <FeatureBadge
              label={"Temperature\nConditions"}
              icon={
                <svg
                  viewBox="0 0 48 48"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={1.6}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden
                >
                  <path d="M22 8a3 3 0 0 1 6 0v17.2a7.5 7.5 0 1 1-6 0V8Z" />
                  <path d="M25 16v10" />
                  <circle cx="25" cy="32.5" r="3" />
                </svg>
              }
            />
            <FeatureBadge
              label={"Priority\nShipping"}
              icon={
                <svg
                  viewBox="0 0 48 48"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={1.6}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden
                >
                  <path d="M4 14h22v18H4z" />
                  <path d="M26 20h8l6 7v5H26V20Z" />
                  <circle cx="13" cy="36" r="3" />
                  <circle cx="33" cy="36" r="3" />
                  <path d="M16 36h14" />
                </svg>
              }
            />
            <FeatureBadge
              label={"10 Years of\nExcellence"}
              icon={
                <svg
                  viewBox="0 0 48 48"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={1.6}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden
                >
                  <circle cx="24" cy="20" r="10" />
                  <path d="m17 28-3 13 10-5 10 5-3-13" />
                  <path d="m24 15 1.7 3.5 3.8.5-2.8 2.7.7 3.8L24 23.7l-3.4 1.8.7-3.8-2.8-2.7 3.8-.5L24 15Z" />
                </svg>
              }
            />
          </ul>
        </div>
      </div>
    </section>
  );
}

function FeatureBadge({
  icon,
  label,
}: {
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <li className="flex shrink-0 basis-[33%] snap-start flex-col items-center gap-2 text-center sm:basis-auto sm:shrink">
      <span
        className="inline-flex h-10 w-10 items-center justify-center text-filler-rose-700 sm:h-12 sm:w-12 [&>svg]:h-full [&>svg]:w-full"
        aria-hidden
      >
        {icon}
      </span>
      <p className="whitespace-pre-line text-[11px] font-semibold leading-tight text-filler-ink/85 sm:text-xs">
        {label}
      </p>
    </li>
  );
}
