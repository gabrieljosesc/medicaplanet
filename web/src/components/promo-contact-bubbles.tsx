"use client";

import { useEffect, useId, useRef, useState } from "react";
import { SITE_EMAIL, SITE_PHONE_DISPLAY, SITE_PHONE_TEL } from "@/lib/site-constants";

type OpenKind = "phone" | "email" | null;

const btnClass =
  "inline-flex h-9 w-9 items-center justify-center rounded-full border border-filler-pink-400/50 bg-white/80 text-filler-ink shadow-sm transition hover:bg-white hover:shadow focus:outline-none focus-visible:ring-2 focus-visible:ring-filler-rose-500/50 focus-visible:ring-offset-1";

const bubbleClass =
  "absolute z-50 w-max max-w-[min(18rem,calc(100vw-3rem))] rounded-lg border border-filler-pink-300/80 bg-filler-cream/98 px-3 py-2 text-left text-xs text-filler-ink shadow-lg backdrop-blur-sm ring-1 ring-black/5 bottom-full right-0 mb-2 sm:bottom-auto sm:top-1/2 sm:mb-0 sm:-translate-y-1/2 sm:right-full sm:mr-2 sm:px-3.5 sm:py-2.5 sm:text-sm";

/**
 * Tapping an icon shows phone/email in a popover; optional links call or open the mail app.
 * Avoids the OS "choose an app" sheet on first tap from direct tel:/mailto:.
 */
export function PromoContactBubbles() {
  const [open, setOpen] = useState<OpenKind>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const phoneId = useId();
  const emailId = useId();

  useEffect(() => {
    if (open == null) return;
    const onDown = (e: MouseEvent) => {
      if (rootRef.current?.contains(e.target as Node)) return;
      setOpen(null);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(null);
    };
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div ref={rootRef} className="relative flex flex-shrink-0 items-center gap-1 sm:gap-1.5">
      <div className="relative">
        <button
          type="button"
          className={btnClass}
          onClick={() => setOpen((o) => (o === "phone" ? null : "phone"))}
          aria-expanded={open === "phone"}
          aria-controls={open === "phone" ? phoneId : undefined}
          aria-label="Show phone number"
        >
          <svg
            className="h-4 w-4"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden
          >
            <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
          </svg>
        </button>
        {open === "phone" ? (
          <div id={phoneId} role="region" aria-label="Phone" className={bubbleClass}>
            <p className="font-medium tabular-nums text-filler-ink">{SITE_PHONE_DISPLAY}</p>
            <a
              href={SITE_PHONE_TEL}
              className="mt-1.5 inline-block text-[11px] font-semibold text-filler-rose-800 underline-offset-2 hover:underline"
            >
              Open phone app
            </a>
          </div>
        ) : null}
      </div>

      <div className="relative">
        <button
          type="button"
          className={btnClass}
          onClick={() => setOpen((o) => (o === "email" ? null : "email"))}
          aria-expanded={open === "email"}
          aria-controls={open === "email" ? emailId : undefined}
          aria-label="Show email address"
        >
          <svg
            className="h-4 w-4"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden
          >
            <rect x="2" y="4" width="20" height="16" rx="2" />
            <path d="m22 7-10 5L2 7" />
          </svg>
        </button>
        {open === "email" ? (
          <div id={emailId} role="region" aria-label="Email" className={bubbleClass}>
            <p className="break-all font-medium text-filler-ink">{SITE_EMAIL}</p>
            <a
              href={`mailto:${SITE_EMAIL}`}
              className="mt-1.5 inline-block text-[11px] font-semibold text-filler-rose-800 underline-offset-2 hover:underline"
            >
              Open email app
            </a>
          </div>
        ) : null}
      </div>
    </div>
  );
}
