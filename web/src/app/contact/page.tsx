import type { Metadata } from "next";
import Link from "next/link";
import { SITE_EMAIL, SITE_PHONE_DISPLAY, SITE_PHONE_TEL } from "@/lib/site-constants";

export const metadata: Metadata = {
  title: "Contact us",
  description: "Phone, email, and hours for MedicaPlanet professional supply.",
};

export default function ContactPage() {
  return (
    <div className="mx-auto max-w-lg space-y-6">
      <h1 className="text-2xl font-semibold text-filler-ink">Contact us</h1>
      <p className="text-sm text-filler-ink/80">
        Licensed-professional customers can reach our team for quotes, order review, and cold-chain
        questions.
      </p>
      <ul className="space-y-2 text-sm text-filler-ink/90">
        <li>
          <span className="font-medium">Phone: </span>
          <a href={SITE_PHONE_TEL} className="text-filler-rose-700 hover:underline">
            {SITE_PHONE_DISPLAY}
          </a>
        </li>
        <li>
          <span className="font-medium">Email: </span>
          <a
            href={`mailto:${SITE_EMAIL}`}
            className="text-filler-rose-700 hover:underline"
          >
            {SITE_EMAIL}
          </a>
        </li>
        <li>
          <span className="font-medium">Hours: </span>
          Mon–Fri, 10am–6pm EST
        </li>
      </ul>
      <p className="text-sm text-filler-ink/70">
        Return to the{" "}
        <Link href="/" className="text-filler-rose-700 hover:underline">
          home page
        </Link>{" "}
        or{" "}
        <Link href="/shop" className="text-filler-rose-700 hover:underline">
          product catalog
        </Link>
        .
      </p>
    </div>
  );
}
