type Props = { searchParams: Promise<{ ref?: string; id?: string }> };

export default async function CheckoutSuccessPage({ searchParams }: Props) {
  const { ref, id } = await searchParams;
  const reference = ref ?? id;
  return (
    <div className="rounded-xl border border-teal-200 bg-teal-50/60 p-8 text-center">
      <h1 className="text-xl font-semibold text-teal-950">Order received</h1>
      <p className="mt-3 text-sm text-teal-900/90">
        Thank you! Your order is being processed.
        <br />
        We&apos;ve sent a summary to your email. You&apos;ll receive another email when your order is
        confirmed.
      </p>
      {reference && (
        <p className="mt-4 text-xs text-teal-900/80">
          Reference: <span className="font-mono">{reference}</span>
        </p>
      )}
    </div>
  );
}
