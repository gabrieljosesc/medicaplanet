import type { Metadata } from "next";
import { SITE_EMAIL, SITE_PHONE_DISPLAY, SITE_PHONE_TEL, SITE_PUBLIC_URL } from "@/lib/site-constants";

export const metadata: Metadata = {
  title: "Referral program",
  description: "MedicaPlanet referral rewards for professional customers who refer qualified colleagues.",
};

export default function ReferralProgramPage() {
  return (
    <article className="mx-auto max-w-3xl space-y-6 text-filler-ink/90">
      <h1 className="text-center text-xl font-semibold text-filler-ink sm:text-2xl">
        MedicaPlanet is proud to present our Referral Program
      </h1>
      <div className="space-y-4 text-sm leading-relaxed sm:text-base">
        <p>
          To qualify, refer a colleague or a friend, and as soon as they make a one-time purchase of
          over $2,000, you will receive $500 and the referred person will receive $100.
        </p>
        <p>
          To refer someone, tell them about our company, MedicaPlanet, and give them our contacts
          (for example: {SITE_PUBLIC_URL}, {SITE_EMAIL}, {SITE_PHONE_DISPLAY}).
        </p>
        <p>
          When placing an order, the referred person should leave a note identifying the customer who
          referred them.
        </p>
      </div>
      <section className="space-y-3 text-sm sm:text-base">
        <h2 className="font-semibold text-filler-ink">Please note</h2>
        <ul className="list-disc space-y-2 pl-5 marker:text-filler-rose-500">
          <li>The referred person must have a valid medical license.</li>
          <li>
            The reward will be credited as soon as the referred person receives the order, and the
            total amount ordered from our company exceeds $2,000.
          </li>
          <li>
            The reward can be used to purchase any product on our website for the regular list price.
          </li>
          <li>The referral reward does not combine with other promotions.</li>
        </ul>
      </section>
      <p className="text-sm text-filler-ink/70">
        Phone:{" "}
        <a href={SITE_PHONE_TEL} className="text-filler-rose-700 hover:underline">
          {SITE_PHONE_DISPLAY}
        </a>{" "}
        · Email:{" "}
        <a href={`mailto:${SITE_EMAIL}`} className="text-filler-rose-700 hover:underline">
          {SITE_EMAIL}
        </a>
      </p>
      <p className="text-xs text-filler-ink/50">Last updated: April 2026</p>
    </article>
  );
}
