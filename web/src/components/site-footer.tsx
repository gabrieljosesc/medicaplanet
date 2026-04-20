import Image from "next/image";
import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="mt-auto border-t border-emerald-900/10 bg-emerald-950 text-emerald-50">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-10 sm:grid-cols-2">
        <div>
          <Link href="/" className="inline-flex items-center leading-none" aria-label="MedicaPlanet home">
            <Image
              src="/medicaplanet_logo.svg"
              alt=""
              width={160}
              height={107}
              className="h-8 w-auto max-h-8 brightness-0 invert"
              unoptimized
            />
          </Link>
          <p className="mt-2 text-sm text-emerald-200/90">
            Wholesale-style supply for licensed aesthetic and medical professionals. Cold-chain
            awareness where required; CSR verifies licenses before fulfillment.
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
      </div>
      <div className="border-t border-emerald-800/60 px-4 py-4 text-center text-xs text-emerald-300/80">
        We supply only to persons licensed to purchase and use these products. © {new Date().getFullYear()}{" "}
        MedicaPlanet.
      </div>
    </footer>
  );
}
