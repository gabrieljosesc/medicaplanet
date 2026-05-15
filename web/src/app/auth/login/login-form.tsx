"use client";

import { useEffect, useId, useState } from "react";
import { signInWithPassword } from "@/app/actions/auth";
import { PasswordField } from "@/components/password-field";

const REMEMBER_EMAIL_KEY = "medicaplanet-remember-email";
const REMEMBER_PASSWORD_KEY = "medicaplanet-remember-password";

function loadRememberedCredentials(): { email: string; password: string } {
  if (typeof window === "undefined") return { email: "", password: "" };
  try {
    return {
      email: window.localStorage.getItem(REMEMBER_EMAIL_KEY) ?? "",
      password: window.localStorage.getItem(REMEMBER_PASSWORD_KEY) ?? "",
    };
  } catch {
    return { email: "", password: "" };
  }
}

function saveRememberedCredentials(email: string, password: string) {
  window.localStorage.setItem(REMEMBER_EMAIL_KEY, email);
  window.localStorage.setItem(REMEMBER_PASSWORD_KEY, password);
}

function clearRememberedCredentials() {
  window.localStorage.removeItem(REMEMBER_EMAIL_KEY);
  window.localStorage.removeItem(REMEMBER_PASSWORD_KEY);
}

/**
 * Login form with "Remember me" — when checked, email and password are saved in
 * the browser's localStorage so both fields are pre-filled after logout.
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
  const [defaultPassword, setDefaultPassword] = useState("");
  const [remember, setRemember] = useState(true);

  useEffect(() => {
    const fromUrl = initialEmail ?? "";
    const stored = loadRememberedCredentials();
    const email = fromUrl || stored.email;
    const password = fromUrl ? "" : stored.password;
    const hasStored = Boolean(stored.email && stored.password);

    setDefaultEmail(email);
    setDefaultPassword(password);
    setRemember(hasStored || !fromUrl);
    setReady(true);
  }, [initialEmail]);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    try {
      const data = new FormData(event.currentTarget);
      const submittedEmail = String(data.get("email") ?? "").trim();
      const submittedPassword = String(data.get("password") ?? "");

      if (remember && submittedEmail) {
        saveRememberedCredentials(submittedEmail, submittedPassword);
      } else {
        clearRememberedCredentials();
      }
    } catch {
      /* ignore quota / private mode errors */
    }
  };

  const handleRememberChange = (checked: boolean) => {
    setRemember(checked);
    if (!checked) {
      try {
        clearRememberedCredentials();
      } catch {
        /* ignore */
      }
    }
  };

  if (!ready) {
    return <LoginFormSkeleton />;
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
      <PasswordField
        name="password"
        label="Password"
        autoComplete="current-password"
        required
        defaultValue={defaultPassword}
      />
      <div className="flex items-center justify-between text-xs">
        <label htmlFor={checkboxId} className="flex cursor-pointer items-center gap-2 text-zinc-700">
          <input
            id={checkboxId}
            type="checkbox"
            checked={remember}
            onChange={(e) => handleRememberChange(e.target.checked)}
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

function LoginFormSkeleton() {
  return (
    <div aria-hidden className="mt-6 space-y-4">
      <div className="h-14 rounded-md bg-zinc-100/70" />
      <div className="h-14 rounded-md bg-zinc-100/70" />
      <div className="h-10 rounded-full bg-zinc-100/70" />
    </div>
  );
}
