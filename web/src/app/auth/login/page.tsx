import Link from "next/link";
import { signInWithPassword } from "@/app/actions/auth";
import { safeAuthRedirectTarget } from "@/lib/safe-redirect";

type Props = {
  searchParams: Promise<{ error?: string; next?: string; reason?: string }>;
};

export default async function LoginPage({ searchParams }: Props) {
  const q = await searchParams;
  const next = safeAuthRedirectTarget(q.next ?? "") ?? "";
  const reason = q.reason;
  const error = q.error ? decodeURIComponent(q.error) : null;

  const registerHref = next ? `/auth/register?next=${encodeURIComponent(next)}` : "/auth/register";

  return (
    <div className="mx-auto max-w-sm">
      <h1 className="text-2xl font-semibold text-zinc-900">Sign in</h1>
      {reason === "checkout" && (
        <p className="mt-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950">
          Sign in to continue to <strong>checkout</strong>. New here?{" "}
          <Link href={registerHref} className="font-semibold text-amber-900 underline underline-offset-2">
            Create an account
          </Link>
          .
        </p>
      )}
      {error && (
        <p className="mt-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">{error}</p>
      )}
      <form action={signInWithPassword} className="mt-6 space-y-4">
        {next ? <input type="hidden" name="next" value={next} /> : null}
        <div>
          <label className="text-xs font-medium text-zinc-600">Email</label>
          <input name="email" type="email" required className="mt-1 w-full rounded-md border border-zinc-300 px-3 py-2 text-sm" />
        </div>
        <div>
          <label className="text-xs font-medium text-zinc-600">Password</label>
          <input name="password" type="password" required className="mt-1 w-full rounded-md border border-zinc-300 px-3 py-2 text-sm" />
        </div>
        <button
          type="submit"
          className="w-full rounded-full bg-emerald-800 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-900 hover:shadow-md"
        >
          Sign in
        </button>
      </form>
      <p className="mt-4 text-center text-sm text-zinc-600">
        No account?{" "}
        <Link href={registerHref} className="font-medium text-emerald-800 hover:underline">
          Register
        </Link>
      </p>
    </div>
  );
}
