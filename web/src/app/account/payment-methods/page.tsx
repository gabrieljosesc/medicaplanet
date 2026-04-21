import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Payment methods",
};

export default function PaymentMethodsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-zinc-900">Payment methods</h1>
        <p className="mt-1 text-sm text-zinc-600">
          MedicaPlanet does not store card numbers on this site. Orders are confirmed and paid through
          our CSR team using methods agreed with your practice (wire, card link, or invoice terms).
        </p>
      </div>
      <div className="rounded-xl border border-dashed border-zinc-200 bg-white px-8 py-16 text-center shadow-sm">
        <p className="text-sm text-zinc-600">No saved cards.</p>
        <p className="mt-2 text-xs text-zinc-500">
          When you place an order, you can add payment notes at checkout; our team will follow up
          securely.
        </p>
      </div>
    </div>
  );
}
