"use client";

import { useEffect, useId, useState } from "react";
import { signInWithPassword } from "@/app/actions/auth";
import { PasswordField } from "@/components/password-field";

const REMEMBER_KEY = "medicaplanet-remember-email";

/**
 * Login form with remember-me support.
 *
 * Browser password managers trigger off `autoComplete="username"` +
 * `autoComplete="current-password"`, which lets Chrome / Safari / etc. save
 * credentials on submit and autofill them on every later visit. As a fallback
 * (e.g. when the password manager is disabled) we also stash the last-used
 * email in localStorage so it pre-populates the input.
 */
export function LoginForm({
  initialEmail,
  next,
}: {
  initialEmail?: string;
  next?: string;
}) {
  const checkboxId = useId();
  const [email, setEmail] = useState(initialEmail ?? "");
  const [remember, setRemember] = useState(true);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setHydrated(true);
    if (!initialEmail) {
      try {
        const stored = window.localStorage.getItem(REMEMBER_KEY);
        if (stored) setEmail(stored);
        else setRemember(true);
      } catch {
        /* localStorage blocked — fall through with empty email */
      }
    }
  }, [initialEmail]);

  const handleSubmit = () => {
    try {
      if (remember && email) window.localStorage.setItem(REMEMBER_KEY, email);
      else window.localStorage.removeItem(REMEMBER_KEY);
    } catch {
      /* ignore quota / private mode errors */
    }
  };

  return (
    <form
      action={signInWithPassword}
      onSubmit={handleSubmit}
      className="mt-6 space-y-4"
      autoComplete="on"
    >
      {next ? <input type="hidden" name="next" value={next} /> : null}
      <div>
        <label htmlFor="login-email" className="text-xs font-medium text-zinc-600">
          Email
        </label>
        <input
          id="login-email"
          name="email"
          type="email"
          required
          autoComplete="username"
          inputMode="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="mt-1 w-full rounded-md border border-zinc-300 px-3 py-2 text-sm"
        />
      </div>
      <PasswordField name="password" label="Password" autoComplete="current-password" required />
      <div className="flex items-center justify-between text-xs">
        <label htmlFor={checkboxId} className="flex cursor-pointer items-center gap-2 text-zinc-700">
          <input
            id={checkboxId}
            type="checkbox"
            checked={remember}
            onChange={(e) => setRemember(e.target.checked)}
            className="h-4 w-4 rounded border-zinc-300 text-teal-800 focus:ring-teal-700"
          />
          Remember me
        </label>
        <a
          href="/auth/forgot-password"
          className="font-medium text-teal-800 hover:underline"
        >
          Forgot your password?
        </a>
      </div>
      <button
        type="submit"
        className="w-full rounded-full bg-teal-800 py-2.5 text-sm font-semibold text-white transition hover:bg-teal-900 hover:shadow-md"
        suppressHydrationWarning={!hydrated}
      >
        Sign in
      </button>
    </form>
  );
}
