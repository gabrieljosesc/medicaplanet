import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="mt-auto border-t border-emerald-900/10 bg-emerald-950 text-emerald-50">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-10 sm:grid-cols-3">
        <div>
          <p className="text-lg font-semibold">MedicaPlanet</p>
          <p className="mt-2 text-sm text-emerald-200/90">
            Wholesale-style supply for licensed aesthetic and medical professionals. Cold-chain
            awareness where required, with professional verification before fulfillment.
          </p>
        </div>

        <div className="text-sm">
          <p className="font-medium text-white">Contact</p>
          <ul className="mt-2 space-y-1 text-emerald-200/90">
            <li>
              <a href="tel:+18005551234" className="hover:underline">
                (800) 555-1234
              </a>
            </li>
            <li>
              <a href="mailto:orders@medicaplanet.example" className="hover:underline">
                orders@medicaplanet.example
              </a>
            </li>
            <li>Mon–Fri, 10am–6pm EST</li>
          </ul>
        </div>

        <div className="text-sm">
          <p className="font-medium text-white">Policies</p>
          <ul className="mt-2 space-y-1 text-emerald-200/90">
            <li>
              <Link href="/about-us" className="hover:underline">
                About us
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
              <Link href="/legal/returns-cancellations" className="hover:underline">
                Returns & cancellations
              </Link>
            </li>
          </ul>
        </div>
      </div>
      <div className="mx-auto w-full max-w-6xl border-t border-emerald-800/60 px-4 py-5">
        <p className="text-xs font-medium uppercase tracking-wide text-emerald-200">We accept</p>
        <div className="mt-3 flex flex-wrap items-center gap-3">
          <img
            src="https://cdn.simpleicons.org/visa/ffffff"
            alt="Visa"
            className="h-7 w-auto rounded bg-emerald-900/40 p-1.5"
            loading="lazy"
          />
          <img
            src="https://cdn.simpleicons.org/mastercard/ffffff"
            alt="Mastercard"
            className="h-7 w-auto rounded bg-emerald-900/40 p-1.5"
            loading="lazy"
          />
          <img
            src="https://cdn.simpleicons.org/americanexpress/ffffff"
            alt="American Express"
            className="h-7 w-auto rounded bg-emerald-900/40 p-1.5"
            loading="lazy"
          />
          <img
            src="https://cdn.simpleicons.org/googlepay/ffffff"
            alt="Google Pay"
            className="h-7 w-auto rounded bg-emerald-900/40 p-1.5"
            loading="lazy"
          />
          <img
            src="https://cdn.simpleicons.org/applepay/ffffff"
            alt="Apple Pay"
            className="h-7 w-auto rounded bg-emerald-900/40 p-1.5"
            loading="lazy"
          />
        </div>
      </div>
      <div className="border-t border-emerald-800/60 px-4 py-4 text-center text-xs text-emerald-300/80">
        We supply only to persons licensed to purchase and use these products. © {new Date().getFullYear()}{" "}
        MedicaPlanet.
      </div>
    </footer>
  );
}