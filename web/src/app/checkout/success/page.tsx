type Props = { searchParams: Promise<{ id?: string }> };

export default async function CheckoutSuccessPage({ searchParams }: Props) {
  const { id } = await searchParams;
  return (
    <div className="rounded-xl border border-emerald-200 bg-emerald-50/60 p-8 text-center">
      <h1 className="text-xl font-semibold text-emerald-950">Order received</h1>
      <p className="mt-3 text-sm text-emerald-900/90">
        Thank you. Our order team will contact you to confirm payment and shipping. No payment was
        captured on this website.
      </p>
      {id && (
        <p className="mt-4 text-xs text-emerald-900/80">
          Reference: <span className="font-mono">{id}</span>
        </p>
      )}
    </div>
  );
}
