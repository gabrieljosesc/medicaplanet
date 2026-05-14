"use client";

import { useEffect, useId, useState } from "react";
import { signInWithPassword } from "@/app/actions/auth";
import { PasswordField } from "@/components/password-field";

const REMEMBER_KEY = "medicaplanet-remember-email";

/**
 * Login form with remember-me support.
 *
 * Both email and password autofill come from the browser's built-in password
 * manager (Chrome / Safari / Edge / Firefox), triggered by
 * `autoComplete="username"` + `autoComplete="current-password"`. After the
 * first successful sign-in the browser prompts "Save password?"; once saved,
 * it pre-fills both fields on every later visit.
 *
 * To avoid fighting the password manager we render the inputs as
 * **uncontrolled** (`defaultValue`) and only render the form after hydration
 * with the right initial values — controlled inputs that mutate after mount
 * cause many browsers to wipe the auto-filled password.
 *
 * The "Remember me" checkbox stores **only the email** in `localStorage` as
 * a fallback when the password manager is disabled. We deliberately never
 * persist the password client-side because it would be readable in plain
 * text by any script on the page.
 */
export function LoginForm({
  initialEmail,
  next,
}: {
  initialEmail?: string;
  next?: string;
}) {
  const checkboxId = useId();
  const [ready, setReady] = useState(false);
  const [defaultEmail, setDefaultEmail] = useState(initialEmail ?? "");
  const [remember, setRemember] = useState(true);

  useEffect(() => {
    let next = initialEmail ?? "";
    if (!initialEmail) {
      try {
        const stored = window.localStorage.getItem(REMEMBER_KEY);
        if (stored) next = stored;
      } catch {
        /* localStorage blocked — fall through */
      }
    }
    setDefaultEmail(next);
    setReady(true);
  }, [initialEmail]);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    try {
      const data = new FormData(event.currentTarget);
      const submittedEmail = String(data.get("email") ?? "").trim();
      if (remember && submittedEmail) {
        window.localStorage.setItem(REMEMBER_KEY, submittedEmail);
      } else {
        window.localStorage.removeItem(REMEMBER_KEY);
      }
    } catch {
      /* ignore quota / private mode errors */
    }
  };

  if (!ready) {
    return (
      <div
        aria-hidden
        className="mt-6 space-y-4"
      >
        <div className="h-14 rounded-md bg-zinc-100/70" />
        <div className="h-14 rounded-md bg-zinc-100/70" />
        <div className="h-10 rounded-full bg-zinc-100/70" />
      </div>
    );
  }

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
          defaultValue={defaultEmail}
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
      >
        Sign in
      </button>
    </form>
  );
}
