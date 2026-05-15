import { LoadingSpinner } from "@/components/loading-spinner";

/** Shown while a route segment is loading (Next.js App Router). */
export default function Loading() {
  return (
    <div className="flex min-h-[40vh] flex-col items-center justify-center gap-3 text-teal-900/80">
      <LoadingSpinner className="h-8 w-8 text-teal-700" label="Loading page" />
      <p className="text-sm font-medium">Loading…</p>
    </div>
  );
}
