"use client";

import { useCallback, useEffect, useRef, useState } from "react";

type Feature = {
  label: string;
  icon: React.ReactNode;
};

const AUTO_MS = 2800;

export function HomeHeroFeatures({ features }: { features: Feature[] }) {
  const scrollRef = useRef<HTMLUListElement>(null);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const interactionResetRef = useRef<number | null>(null);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReducedMotion(mq.matches);
    const onChange = () => setReducedMotion(mq.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  const stepWidthFor = useCallback((el: HTMLUListElement) => {
    const first = el.querySelector<HTMLElement>("[data-feature]");
    if (!first) return 0;
    const styles = window.getComputedStyle(el);
    const gap = parseFloat(styles.columnGap || styles.gap || "0") || 0;
    return first.offsetWidth + gap;
  }, []);

  const isMobileLayout = useCallback((el: HTMLUListElement) => {
    return el.scrollWidth - el.clientWidth > 4;
  }, []);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    if (reducedMotion) return;
    if (paused) return;

    const tick = () => {
      const node = scrollRef.current;
      if (!node) return;
      if (!isMobileLayout(node)) return;
      const step = stepWidthFor(node);
      if (step <= 0) return;
      const maxScroll = node.scrollWidth - node.clientWidth;
      const next = node.scrollLeft + step;
      if (next > maxScroll - 2) {
        node.scrollTo({ left: 0, behavior: "smooth" });
      } else {
        node.scrollTo({ left: next, behavior: "smooth" });
      }
    };

    const id = window.setInterval(tick, AUTO_MS);
    return () => window.clearInterval(id);
  }, [reducedMotion, paused, isMobileLayout, stepWidthFor]);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    const onScroll = () => {
      const step = stepWidthFor(el);
      if (step <= 0) return;
      const i = Math.round(el.scrollLeft / step);
      setActiveIndex(Math.min(features.length - 1, Math.max(0, i)));
    };

    const onPointerDown = () => {
      setPaused(true);
      if (interactionResetRef.current) {
        window.clearTimeout(interactionResetRef.current);
      }
      interactionResetRef.current = window.setTimeout(() => {
        setPaused(false);
      }, 6000);
    };

    el.addEventListener("scroll", onScroll, { passive: true });
    el.addEventListener("pointerdown", onPointerDown, { passive: true });
    return () => {
      el.removeEventListener("scroll", onScroll);
      el.removeEventListener("pointerdown", onPointerDown);
      if (interactionResetRef.current) {
        window.clearTimeout(interactionResetRef.current);
      }
    };
  }, [features.length, stepWidthFor]);

  return (
    <div className="mx-auto mt-12 w-full max-w-4xl sm:mt-16">
      <ul
        ref={scrollRef}
        className="flex w-full snap-x snap-mandatory gap-3 overflow-x-auto px-1 pb-2 [-ms-overflow-style:none] [scrollbar-width:none] sm:grid sm:grid-cols-5 sm:gap-x-4 sm:overflow-visible sm:px-0 sm:pb-0 [&::-webkit-scrollbar]:hidden"
        aria-label="Why choose MedicaPlanet"
      >
        {features.map((f, i) => (
          <li
            key={i}
            data-feature
            className="flex shrink-0 basis-[33%] snap-start flex-col items-center gap-2 text-center sm:basis-auto sm:shrink"
          >
            <span
              className="inline-flex h-10 w-10 items-center justify-center text-filler-rose-700 sm:h-12 sm:w-12 [&>svg]:h-full [&>svg]:w-full"
              aria-hidden
            >
              {f.icon}
            </span>
            <p className="whitespace-pre-line text-[11px] font-semibold leading-tight text-filler-ink/85 sm:text-xs">
              {f.label}
            </p>
          </li>
        ))}
      </ul>

      {features.length > 1 ? (
        <div
          className="mt-2 flex items-center justify-center gap-1.5 sm:hidden"
          aria-hidden
        >
          {features.map((_, i) => (
            <span
              key={i}
              className={
                i === activeIndex
                  ? "h-1.5 w-4 rounded-full bg-filler-rose-700"
                  : "h-1.5 w-1.5 rounded-full bg-filler-peach-300"
              }
            />
          ))}
        </div>
      ) : null}
    </div>
  );
}
