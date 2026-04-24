import Link from "next/link";
import { SITE_EMAIL, SITE_PHONE_DISPLAY, SITE_PHONE_TEL } from "@/lib/site-constants";

export function SiteFooter() {
  return (
    <footer className="mt-auto border-t border-filler-rose-800/30 bg-filler-ink text-filler-cream/95">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-10 sm:grid-cols-3">
        <div>
          <p className="text-lg font-bold tracking-tight">MedicaPlanet</p>
          <p className="mt-2 text-sm text-filler-cream/70">
            Wholesale-style supply for licensed aesthetic and medical professionals. Cold-chain
            awareness where required, with professional verification before fulfillment.
          </p>
        </div>

        <div className="text-sm">
          <p className="font-medium text-white">Contact</p>
          <ul className="mt-2 space-y-1 text-filler-cream/75">
            <li>
              <a href={SITE_PHONE_TEL} className="hover:underline">
                {SITE_PHONE_DISPLAY}
              </a>
            </li>
            <li>
              <a href={`mailto:${SITE_EMAIL}`} className="hover:underline">
                {SITE_EMAIL}
              </a>
            </li>
            <li>Mon–Fri, 10am–6pm EST</li>
          </ul>
        </div>

        <div className="text-sm">
          <p className="font-medium text-white">Policies</p>
          <ul className="mt-2 space-y-1 text-filler-cream/75">
            <li>
              <Link href="/about-us" className="hover:underline">
                About us
              </Link>
            </li>
            <li>
              <Link href="/contact" className="hover:underline">
                Contact us
              </Link>
            </li>
            <li>
              <Link href="/legal/verification" className="hover:underline">
                Professional verification
              </Link>
            </li>
            <li>
              <Link href="/legal/research-use-only" className="hover:underline">
                Research use only policy
              </Link>
            </li>
            <li>
              <Link href="/legal/terms" className="hover:underline">
                Terms of supply
              </Link>
            </li>
            <li>
              <Link href="/legal/privacy" className="hover:underline">
                Privacy notice
              </Link>
            </li>
            <li>
              <Link href="/legal/shipping-cold-chain" className="hover:underline">
                Shipping & cold-chain
              </Link>
            </li>
            <li>
              <Link href="/legal/return-policy" className="hover:underline">
                Return policy
              </Link>
            </li>
            <li>
              <Link href="/legal/referral-program" className="hover:underline">
                Referral program
              </Link>
            </li>
          </ul>
        </div>
      </div>
      <div className="mx-auto w-full max-w-6xl border-t border-filler-rose-800/40 px-4 py-5">
        <p className="text-xs font-medium uppercase tracking-wide text-filler-pink-200/90">We accept</p>
        <div className="mt-3 flex flex-wrap items-center gap-3">
          <img
            src="https://cdn.simpleicons.org/visa"
            alt="Visa"
            className="h-10 w-auto rounded-lg border border-filler-rose-800/50 bg-white px-3 py-2 shadow-sm"
            loading="lazy"
          />
          <img
            src="https://cdn.simpleicons.org/mastercard"
            alt="Mastercard"
            className="h-10 w-auto rounded-lg border border-filler-rose-800/50 bg-white px-3 py-2 shadow-sm"
            loading="lazy"
          />
          <img
            src="https://cdn.simpleicons.org/americanexpress"
            alt="American Express"
            className="h-10 w-auto rounded-lg border border-filler-rose-800/50 bg-white px-3 py-2 shadow-sm"
            loading="lazy"
          />
          <img
            src="https://cdn.simpleicons.org/googlepay"
            alt="Google Pay"
            className="h-10 w-auto rounded-lg border border-filler-rose-800/50 bg-white px-3 py-2 shadow-sm"
            loading="lazy"
          />
          <img
            src="https://cdn.simpleicons.org/applepay"
            alt="Apple Pay"
            className="h-10 w-auto rounded-lg border border-filler-rose-800/50 bg-white px-3 py-2 shadow-sm"
            loading="lazy"
          />
        </div>
        <div
          className="mt-5 flex max-w-xl items-start gap-3 rounded-md bg-rose-400/85 px-4 py-3.5 sm:px-5 sm:py-4"
          role="note"
        >
          <span
            className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full border-2 border-white/90 bg-white text-sm font-bold leading-none text-rose-600"
            aria-hidden
          >
            !
          </span>
          <p className="text-sm font-medium leading-snug text-white sm:text-base">
            <span className="block">Please note that we supply to</span>
            <span className="block">licensed medical specialists only.</span>
          </p>
        </div>
      </div>
      <div className="border-t border-filler-rose-800/40 px-4 py-4 text-center text-xs text-filler-cream/55">
        We supply only to persons licensed to purchase and use these products. © {new Date().getFullYear()}{" "}
        MedicaPlanet.
      </div>
    </footer>
  );
}