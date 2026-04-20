export default function TermsPage() {
  return (
    <article className="mx-auto max-w-3xl space-y-6">
      <h1 className="text-2xl font-semibold text-zinc-900">Terms of Supply</h1>
      <p className="text-sm text-zinc-700">
        By creating an account or placing an order, you confirm that purchases are made for lawful,
        professional use and that all submitted account data is accurate.
      </p>
      <section className="space-y-2 text-sm text-zinc-700">
        <h2 className="text-base font-semibold text-zinc-900">Order process</h2>
        <p>
          Checkout submissions are reviewed by CSR. Submission does not guarantee acceptance,
          pricing, or immediate dispatch until compliance and stock checks are complete.
        </p>
      </section>
      <section className="space-y-2 text-sm text-zinc-700">
        <h2 className="text-base font-semibold text-zinc-900">Account responsibility</h2>
        <ul className="list-disc space-y-1 pl-5">
          <li>Maintain valid license and contact details.</li>
          <li>Use products in accordance with local regulations and professional standards.</li>
          <li>Report unauthorized account use promptly.</li>
        </ul>
      </section>
      <section className="space-y-2 text-sm text-zinc-700">
        <h2 className="text-base font-semibold text-zinc-900">Right to refuse or cancel</h2>
        <p>
          MedicaPlanet may refuse, suspend, or cancel transactions that conflict with law,
          verification requirements, or product safety controls.
        </p>
      </section>
      <p className="text-xs text-zinc-500">Last updated: April 2026</p>
    </article>
  );
}