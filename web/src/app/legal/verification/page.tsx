export default function VerificationPolicyPage() {
  return (
    <article className="mx-auto max-w-3xl space-y-6">
      <h1 className="text-2xl font-semibold text-zinc-900">Professional Verification Policy</h1>
      <p className="text-sm text-zinc-700">
        MedicaPlanet supplies restricted products to licensed professionals and eligible clinical
        businesses. Account registration and orders are subject to review by our compliance team.
      </p>
      <section className="space-y-2 text-sm text-zinc-700">
        <h2 className="text-base font-semibold text-zinc-900">What we verify</h2>
        <ul className="list-disc space-y-1 pl-5">
          <li>Professional identity and contact details.</li>
          <li>License number, jurisdiction, and expiry date.</li>
          <li>Business or facility information when applicable.</li>
          <li>Order destination consistency with declared professional use.</li>
        </ul>
      </section>
      <section className="space-y-2 text-sm text-zinc-700">
        <h2 className="text-base font-semibold text-zinc-900">Verification timing</h2>
        <p>
          Most reviews are completed during business hours before fulfillment. We may request
          additional documentation if details cannot be validated.
        </p>
      </section>
      <section className="space-y-2 text-sm text-zinc-700">
        <h2 className="text-base font-semibold text-zinc-900">When orders can be held or refused</h2>
        <p>
          Orders may be held, edited, or declined if verification fails, documentation is missing,
          or local regulations restrict supply to the destination.
        </p>
      </section>
      <p className="text-xs text-zinc-500">Last updated: April 2026</p>
    </article>
  );
}