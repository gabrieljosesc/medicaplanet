"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { isCuratedHomeHeroImageSrc } from "@/lib/home-hero-curated";
import type { MonthlyHighlightSlide } from "@/lib/monthly-highlight-slides";

const AUTO_MS = 5500;

export function HomeHeroSlideshow({ slides }: { slides: MonthlyHighlightSlide[] }) {
  const [index, setIndex] = useState(0);
  const [reducedMotion, setReducedMotion] = useState(false);

  const n = slides.length;

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReducedMotion(mq.matches);
    const onChange = () => setReducedMotion(mq.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  useEffect(() => {
    if (n <= 1 || reducedMotion) return;
    const id = setInterval(() => {
      setIndex((i) => (i + 1) % n);
    }, AUTO_MS);
    return () => clearInterval(id);
  }, [n, reducedMotion]);

  if (n === 0) {
    return (
      <p className="mt-6 text-sm text-filler-ink/60">
        Product highlights will appear here once your catalog is live.
      </p>
    );
  }

  return (
    <div className="mt-6 w-full max-w-md">
      <p className="sr-only" aria-live="polite">
        {n > 1
          ? `Product ${index + 1} of ${n}: ${slides[index]?.title ?? ""}. Auto-rotates.`
          : `Highlight: ${slides[0]?.title ?? ""}.`}
      </p>
      <div className="relative min-h-[200px] sm:min-h-[220px]">
        {slides.map((s, i) => (
          <div
            key={s.slug}
            className={
              i === index
                ? "relative opacity-100 transition-opacity duration-500"
                : "pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500"
            }
            aria-hidden={i !== index}
            role="group"
            aria-roledescription="slide"
          >
            <Link
              href={`/product/${s.slug}`}
              className="block focus:outline-none focus-visible:ring-2 focus-visible:ring-filler-rose-600/50 focus-visible:ring-offset-2"
            >
              <div
                className={
                  "relative aspect-[4/3] w-full overflow-hidden rounded-2xl bg-transparent"
                }
              >
                <Image
                  src={s.heroImageSrc}
                  alt={s.title}
                  fill
                  className={
                    "object-contain object-center mix-blend-multiply"
                  }
                  sizes="(max-width: 768px) 90vw, 420px"
                  unoptimized={s.imageUnoptimized}
                  priority={i === 0}
                />
              </div>
              <p className="mt-3 text-center text-sm font-semibold leading-snug text-filler-rose-800 sm:text-base">
                {s.title}
              </p>
              <div className="mt-2 text-center">
                {s.displayPrice != null ? (
                  <p className="text-lg font-bold tabular-nums text-filler-ink sm:text-xl">
                    {s.showFrom ? (
                      <span className="text-sm font-medium text-filler-ink/70">From </span>
                    ) : null}
                    <span>
                      {s.currency === "USD" ? "$" : `${s.currency} `}
                      {s.displayPrice}
                    </span>
                    {s.compareAt != null && s.displayPrice < s.compareAt ? (
                      <span className="ml-2 text-sm font-medium tabular-nums text-filler-ink/45 line-through">
                        {s.currency === "USD" ? "$" : `${s.currency} `}
                        {Math.round(s.compareAt)}
                      </span>
                    ) : null}
                  </p>
                ) : (
                  <p className="text-sm font-medium text-filler-ink/70">Request pricing</p>
                )}
                <p className="mt-1 text-xs font-medium text-filler-rose-800/90 underline-offset-2 hover:underline">
                  View product
                </p>
              </div>
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}
