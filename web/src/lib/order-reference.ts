/** Customer-facing order reference; falls back to internal UUID for legacy rows. */
export function displayOrderReference(order: {
  reference_number?: string | null;
  id: string;
}): string {
  const ref = order.reference_number?.trim();
  return ref || order.id;
}
