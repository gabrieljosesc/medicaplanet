import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Return policy",
  description: "5-day return program, credits, reshipment, and refunds for MedicaPlanet customers.",
};

export default function ReturnPolicyPage() {
  return (
    <article className="mx-auto max-w-3xl space-y-6 text-filler-ink/90">
      <h1 className="text-center text-2xl font-semibold text-filler-ink sm:text-3xl">
        Return policy
      </h1>
      <p className="text-sm leading-relaxed sm:text-base">
        We want you to feel 100% confident in using our services. That is why we offer a 5-day return
        program. It works in the following way:
      </p>
      <p className="text-sm leading-relaxed sm:text-base">
        If you are not satisfied with your purchase for a valid reason, please contact us as soon as
        you have received the product and apply for a future credit, reshipment, or refund.
      </p>
      <section className="space-y-3 text-sm leading-relaxed sm:text-base">
        <p>
          <span className="font-semibold text-filler-ink">Future credit</span> – an amount of money
          that will be added to your future order. It will be credited from the moment the
          application is approved.
        </p>
        <p>
          <span className="font-semibold text-filler-ink">Reshipment</span> – a second shipment of
          the previous order or part of it to compensate for loss or lack of quality. It will
          usually take 3–5 business days after MedicaPlanet approves the application.
        </p>
        <p>
          <span className="font-semibold text-filler-ink">Refund</span> – whole or partial
          compensation of your order. It may take 5–10 business days for the refund to settle in
          your bank account after MedicaPlanet approves your application.
        </p>
      </section>
      <p className="text-sm leading-relaxed sm:text-base">
        MedicaPlanet will make a decision on a return application within 5 business days. MedicaPlanet
        reserves the right to approve, reject, partially approve, or determine the type of return.
      </p>
      <p className="text-sm leading-relaxed sm:text-base">
        No return will be honored if the product has been opened, used, or damaged (including
        damage incurred in transit) unless the product is faulty.
      </p>
      <p className="text-sm leading-relaxed sm:text-base">
        Please note: once you have placed an order and you refuse acceptance of that delivery from
        the local postal service, courier, border control, or customs, no return will be issued as a
        result of the goods being returned to us.
      </p>
      <p className="text-sm leading-relaxed sm:text-base">
        Kindly note: you are liable for all customs fees and charges.
      </p>
      <p className="text-xs text-filler-ink/50">Last updated: April 2026</p>
    </article>
  );
}
