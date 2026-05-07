import Link from "next/link";
import { updateRecoveredPassword } from "@/app/actions/auth";
import { PasswordField } from "@/components/password-field";

type Props = {
  searchParams: Promise<{
    error?: string;
  }>;
};

export default async function UpdatePasswordPage({ searchParams }: Props) {
  const q = await searchParams;
  const error = q.error ? decodeURIComponent(q.error) : null;

  return (
    <div className="mx-auto max-w-sm">
      <h1 className="text-2xl font-semibold text-zinc-900">Create new password</h1>
      <p className="mt-2 text-sm text-zinc-600">
        Choose a new password for your account. The reset link must be opened from the email we sent.
      </p>

      {error ? (
        <p className="mt-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
          {error}
        </p>
      ) : null}

      <form action={updateRecoveredPassword} className="mt-6 space-y-4">
        <PasswordField
          name="password"
          label="New password"
          autoComplete="new-password"
          required
          minLength={6}
        />
        <p className="-mt-2 text-[11px] leading-snug text-zinc-500">
          Use at least 6 characters with 1 uppercase letter, 1 number, and 1 special character.
        </p>
        <PasswordField
          name="confirm_password"
          label="Confirm new password"
          autoComplete="new-password"
          required
          minLength={6}
        />
        <button
          type="submit"
          className="w-full rounded-full bg-teal-800 py-2.5 text-sm font-semibold text-white transition hover:bg-teal-900 hover:shadow-md"
        >
          Update password
        </button>
      </form>

      <p className="mt-4 text-center text-sm text-zinc-600">
        Need a new link?{" "}
        <Link href="/auth/forgot-password" className="font-medium text-teal-800 hover:underline">
          Request password reset
        </Link>
      </p>
    </div>
  );
}
