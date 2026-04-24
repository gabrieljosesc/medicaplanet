"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";

type Slide = { src: string; alt: string; unoptimized: boolean };

function Chevron({ dir }: { dir: "left" | "right" }) {
  return (
    <svg
      viewBox="0 0 24 24"
      width="20"
      height="20"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      {dir === "left" ? <path d="M15 6l-6 6 6 6" /> : <path d="M9 6l6 6-6 6" />}
    </svg>
  );
}

export function ProductImageGallery({ images, title }: { images: Slide[]; title: string }) {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const [index, setIndex] = useState(0);

  const syncIndex = useCallback(() => {
    const el = scrollerRef.current;
    if (!el) return;
    const w = el.clientWidth;
    if (w <= 0) return;
    const i = Math.round(el.scrollLeft / w);
    setIndex(Math.min(images.length - 1, Math.max(0, i)));
  }, [images.length]);

  useEffect(() => {
    const el = scrollerRef.current;
    if (!el) return;
    syncIndex();
    el.addEventListener("scroll", syncIndex, { passive: true });
    const ro = new ResizeObserver(() => syncIndex());
    ro.observe(el);
    return () => {
      el.removeEventListener("scroll", syncIndex);
      ro.disconnect();
    };
  }, [syncIndex]);

  const goTo = (i: number) => {
    const el = scrollerRef.current;
    if (!el) return;
    const w = el.clientWidth;
    el.scrollTo({ left: i * w, behavior: "smooth" });
  };

  const prev = () => goTo(Math.max(0, index - 1));
  const next = () => goTo(Math.min(images.length - 1, index + 1));

  return (
    <div
      className="relative w-full outline-none focus-visible:ring-2 focus-visible:ring-teal-600/40 focus-visible:ring-offset-2"
      tabIndex={0}
      onKeyDown={(e) => {
        const el = scrollerRef.current;
        if (!el || (e.key !== "ArrowLeft" && e.key !== "ArrowRight")) return;
        e.preventDefault();
        const w = el.clientWidth;
        if (w <= 0) return;
        let i = Math.round(el.scrollLeft / w);
        if (e.key === "ArrowLeft") i = Math.max(0, i - 1);
        else i = Math.min(images.length - 1, i + 1);
        goTo(i);
      }}
    >
      <div className="relative">
        <div
          ref={scrollerRef}
          className="flex w-full snap-x snap-mandatory overflow-x-auto scroll-smooth rounded-2xl border border-zinc-200 bg-zinc-100 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          role="region"
          aria-roledescription="carousel"
          aria-label={`${title} photos`}
        >
          {images.map((img, i) => (
            <div
              key={`${img.src}-${i}`}
              className="relative aspect-square w-full shrink-0 snap-center"
            >
              <Image
                src={img.src}
                alt={i === 0 ? img.alt : `${img.alt} — photo ${i + 1}`}
                fill
                className="object-cover"
                priority={i === 0}
                sizes="(max-width:1024px) 100vw, 50vw"
                unoptimized={img.unoptimized}
              />
            </div>
          ))}
        </div>

        {images.length > 1 && (
          <div className="pointer-events-none absolute inset-y-0 left-0 right-0 z-10 hidden items-center justify-between px-2 sm:flex">
            <button
              type="button"
              onClick={prev}
              disabled={index === 0}
              className="pointer-events-auto inline-flex h-10 w-10 items-center justify-center rounded-full border border-zinc-200/80 bg-white/90 text-zinc-800 shadow-sm backdrop-blur transition hover:bg-white disabled:pointer-events-none disabled:opacity-35"
              aria-label="Previous photo"
            >
              <Chevron dir="left" />
            </button>
            <button
              type="button"
              onClick={next}
              disabled={index === images.length - 1}
              className="pointer-events-auto inline-flex h-10 w-10 items-center justify-center rounded-full border border-zinc-200/80 bg-white/90 text-zinc-800 shadow-sm backdrop-blur transition hover:bg-white disabled:pointer-events-none disabled:opacity-35"
              aria-label="Next photo"
            >
              <Chevron dir="right" />
            </button>
          </div>
        )}
      </div>

      {images.length > 1 && (
        <div
          className="mt-3 flex flex-wrap items-center justify-center gap-1.5"
          role="tablist"
          aria-label="Choose photo"
        >
          {images.map((_, i) => (
            <button
              key={i}
              type="button"
              role="tab"
              aria-selected={i === index}
              aria-label={`Photo ${i + 1}`}
              onClick={() => goTo(i)}
              className={
                i === index
                  ? "h-2 w-2 rounded-full bg-teal-700 ring-2 ring-teal-700/25"
                  : "h-2 w-2 rounded-full bg-zinc-300 transition hover:bg-zinc-400"
              }
            />
          ))}
        </div>
      )}
    </div>
  );
}
