"use client";

import { useEffect } from "react";
import { CONVERSION_CURRENCY, GOOGLE_ADS_PURCHASE_SEND_TO } from "@/lib/marketing";

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

type Props = {
  /** Order reference — Google uses this to count each order only once. */
  transactionId: string;
  /** Order grand total. Omitted when the order could not be read. */
  value?: number | null;
};

/**
 * Fires the Google Ads purchase conversion on the checkout success page.
 *
 * Renders nothing. The base Google tag lives in the root layout; this reports
 * the individual sale so Ads can attribute it to a campaign.
 */
export function PurchaseConversion({ transactionId, value }: Props) {
  useEffect(() => {
    if (!transactionId) return;

    // Google dedupes on transaction_id, but this also stops a page refresh or
    // back-navigation from re-firing during the same session.
    const firedKey = `gads_purchase_${transactionId}`;
    try {
      if (window.sessionStorage.getItem(firedKey)) return;
    } catch {
      // Storage blocked (private mode) — fall through and rely on Google's dedupe.
    }

    const params: Record<string, unknown> = {
      send_to: GOOGLE_ADS_PURCHASE_SEND_TO,
      transaction_id: transactionId,
    };
    if (typeof value === "number" && Number.isFinite(value)) {
      params.value = value;
      params.currency = CONVERSION_CURRENCY;
    }

    // The base tag loads with afterInteractive, so gtag may not exist yet on
    // first render. Poll briefly for it rather than queueing onto dataLayer
    // ourselves, so the event goes through Google's own gtag function.
    let cancelled = false;
    let attempts = 0;
    let timer: ReturnType<typeof setTimeout>;

    const fire = () => {
      if (cancelled) return;
      if (typeof window.gtag === "function") {
        window.gtag("event", "conversion", params);
        try {
          window.sessionStorage.setItem(firedKey, "1");
        } catch {
          // Ignore — the conversion already fired.
        }
        return;
      }
      // ~10s total; gtag.js resolves well within this on any working page.
      if (attempts++ < 100) timer = setTimeout(fire, 100);
    };
    fire();

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [transactionId, value]);

  return null;
}
