import Link from "next/link";
import { resendVerificationEmail } from "@/app/actions/auth";
import { safeAuthRedirectTarget } from "@/lib/safe-redirect";
import { LoginForm } from "./login-form";

type Props = {
  searchParams: Promise<{
    error?: string;
    next?: string;
    reason?: string;
    verify?: string;
    email?: string;
    unverified?: string;
    reset?: string;
  }>;
};

export default async function LoginPage({ searchParams }: Props) {
  const q = await searchParams;
  const next = safeAuthRedirectTarget(q.next ?? "") ?? "";
  const reason = q.reason;
  const error = q.error ? decodeURIComponent(q.error) : null;
  const email = q.email ?? "";
  const unverified = q.unverified === "1";
  const verify = q.verify;
  const reset = q.reset;

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
      {verify === "sent" && (
        <p className="mt-3 rounded-lg border border-teal-200 bg-teal-50 px-3 py-2 text-sm text-teal-900">
          Verification email sent. Please check your inbox before signing in.
        </p>
      )}
      {verify === "resent" && (
        <p className="mt-3 rounded-lg border border-teal-200 bg-teal-50 px-3 py-2 text-sm text-teal-900">
          Verification email resent. Please check your inbox.
        </p>
      )}
      {verify === "confirmed" && (
        <p className="mt-3 rounded-lg border border-teal-200 bg-teal-50 px-3 py-2 text-sm text-teal-900">
          Email confirmed successfully. You can sign in now.
        </p>
      )}
      {reset === "updated" && (
        <p className="mt-3 rounded-lg border border-teal-200 bg-teal-50 px-3 py-2 text-sm text-teal-900">
          Password updated successfully. Please sign in with your new password.
        </p>
      )}
      {unverified && (
        <form action={resendVerificationEmail} className="mt-3 rounded-lg border border-amber-200 bg-amber-50 p-3">
          {next ? <input type="hidden" name="next" value={next} /> : null}
          <input type="hidden" name="email" value={email} />
          <p className="text-sm text-amber-950">
            Your email is not verified yet. Click below to resend the verification email.
          </p>
          <button
            type="submit"
            className="mt-2 rounded-full bg-amber-200 px-4 py-2 text-sm font-semibold text-amber-900 hover:bg-amber-300"
          >
            Resend verification email
          </button>
        </form>
      )}
      <LoginForm initialEmail={email} next={next || undefined} />
      <p className="mt-4 text-center text-sm text-zinc-600">
        No account?{" "}
        <Link href={registerHref} className="font-medium text-teal-800 hover:underline">
          Register
        </Link>
      </p>
    </div>
  );
}
