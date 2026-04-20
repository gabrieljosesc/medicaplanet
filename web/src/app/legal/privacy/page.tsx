export default function PrivacyPage() {
  return (
    <article className="mx-auto max-w-3xl space-y-6">
      <h1 className="text-2xl font-semibold text-zinc-900">Privacy Notice</h1>
      <p className="text-sm text-zinc-700">
        We collect account, order, and verification data to operate the platform, validate
        professional eligibility, and support lawful fulfillment.
      </p>
      <section className="space-y-2 text-sm text-zinc-700">
        <h2 className="text-base font-semibold text-zinc-900">Data we collect</h2>
        <ul className="list-disc space-y-1 pl-5">
          <li>Account profile fields and authentication details.</li>
          <li>Order and shipping information.</li>
          <li>Professional verification details such as license number and expiry.</li>
          <li>Operational logs used for fraud prevention and support.</li>
        </ul>
      </section>
      <section className="space-y-2 text-sm text-zinc-700">
        <h2 className="text-base font-semibold text-zinc-900">How data is used</h2>
        <p>
          Data is used to provide service access, process orders, verify professional status,
          communicate fulfillment updates, and comply with legal obligations.
        </p>
      </section>
      <section className="space-y-2 text-sm text-zinc-700">
        <h2 className="text-base font-semibold text-zinc-900">Retention and access</h2>
        <p>
          We retain records for operational and compliance purposes. You may request correction of
          inaccurate account data via support.
        </p>
      </section>
      <p className="text-xs text-zinc-500">Last updated: April 2026</p>
    </article>
  );
}