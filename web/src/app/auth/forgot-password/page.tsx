import Link from "next/link";
import { requestPasswordReset } from "@/app/actions/auth";

type Props = {
  searchParams: Promise<{
    error?: string;
    sent?: string;
    email?: string;
  }>;
};

export default async function ForgotPasswordPage({ searchParams }: Props) {
  const q = await searchParams;
  const error = q.error ? decodeURIComponent(q.error) : null;
  const sent = q.sent === "1";
  const email = q.email ?? "";

  return (
    <div className="mx-auto max-w-sm">
      <h1 className="text-2xl font-semibold text-zinc-900">Reset password</h1>
      <p className="mt-2 text-sm text-zinc-600">
        Enter your account email and we will send a secure password reset link.
      </p>

      {error ? (
        <p className="mt-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
          {error}
        </p>
      ) : null}
      {sent ? (
        <p className="mt-3 rounded-lg border border-teal-200 bg-teal-50 px-3 py-2 text-sm text-teal-900">
          Password reset email sent{email ? ` to ${email}` : ""}. Please check your inbox.
        </p>
      ) : null}

      <form action={requestPasswordReset} className="mt-6 space-y-4">
        <label className="block">
          <span className="text-xs font-medium text-zinc-600">Email</span>
          <input
            name="email"
            type="email"
            required
            defaultValue={email}
            className="mt-1 w-full rounded-md border border-zinc-300 px-3 py-2 text-sm"
          />
        </label>
        <button
          type="submit"
          className="w-full rounded-full bg-teal-800 py-2.5 text-sm font-semibold text-white transition hover:bg-teal-900 hover:shadow-md"
        >
          Send reset link
        </button>
      </form>

      <p className="mt-4 text-center text-sm text-zinc-600">
        Remembered it?{" "}
        <Link href="/auth/login" className="font-medium text-teal-800 hover:underline">
          Sign in
        </Link>
      </p>
    </div>
  );
}
