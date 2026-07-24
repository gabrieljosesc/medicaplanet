"use client";

import { useEffect } from "react";
import { CONVERSION_CURRENCY, GOOGLE_ADS_PURCHASE_SEND_TO } from "@/lib/marketing";

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
    fbq?: (...args: unknown[]) => void;
  }
}

type Props = {
  /** Order reference — used so each order is counted only once. */
  transactionId: string;
  /** Order grand total. Omitted when the order could not be read. */
  value?: number | null;
};

/**
 * Reports a completed order to Google Ads and Meta from the checkout success
 * page. Renders nothing — the base tags live in the root layout, this sends
 * the individual sale so each platform can attribute it to a campaign.
 */
export function PurchaseConversion({ transactionId, value }: Props) {
  useEffect(() => {
    if (!transactionId) return;

    // Google dedupes on transaction_id and Meta on eventID, but this also
    // stops a refresh or back-navigation re-firing during the same session.
    const firedKey = `purchase_tracked_${transactionId}`;
    try {
      if (window.sessionStorage.getItem(firedKey)) return;
    } catch {
      // Storage blocked (private mode) — rely on platform-side dedupe.
    }

    const hasValue = typeof value === "number" && Number.isFinite(value);

    const googleParams: Record<string, unknown> = {
      send_to: GOOGLE_ADS_PURCHASE_SEND_TO,
      transaction_id: transactionId,
    };
    const metaParams: Record<string, unknown> = {};
    if (hasValue) {
      googleParams.value = value;
      googleParams.currency = CONVERSION_CURRENCY;
      metaParams.value = value;
      metaParams.currency = CONVERSION_CURRENCY;
    }

    // Both base tags load with afterInteractive, so gtag/fbq may not exist yet
    // on first render. Poll for each and fire it as soon as it appears, rather
    // than queueing ourselves, so events go through the vendors' own functions.
    let cancelled = false;
    let attempts = 0;
    let googleFired = false;
    let metaFired = false;
    let timer: ReturnType<typeof setTimeout>;

    const markFired = () => {
      try {
        window.sessionStorage.setItem(firedKey, "1");
      } catch {
        // Ignore — the conversion already fired.
      }
    };

    const tick = () => {
      if (cancelled) return;

      if (!googleFired && typeof window.gtag === "function") {
        window.gtag("event", "conversion", googleParams);
        googleFired = true;
      }
      if (!metaFired && typeof window.fbq === "function") {
        // eventID lets Meta dedupe against a server-side Conversions API event
        // if one is added later.
        window.fbq("track", "Purchase", metaParams, { eventID: transactionId });
        metaFired = true;
      }

      if (googleFired || metaFired) markFired();
      if (googleFired && metaFired) return;

      // ~10s total. A tag still missing by then is blocked (ad blocker) or
      // failed to load, so stop rather than retrying forever.
      if (attempts++ < 100) timer = setTimeout(tick, 100);
    };
    tick();

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [transactionId, value]);

  return null;
}
