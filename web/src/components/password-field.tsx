"use client";

import { useState } from "react";

type PasswordFieldProps = {
  name: string;
  label: string;
  autoComplete?: string;
  required?: boolean;
  minLength?: number;
  className?: string;
};

export function PasswordField({
  name,
  label,
  autoComplete,
  required,
  minLength,
  className = "mt-1 w-full rounded-md border border-zinc-300 px-3 py-2 pr-20 text-sm",
}: PasswordFieldProps) {
  const [visible, setVisible] = useState(false);

  return (
    <label className="block">
      <span className="text-xs font-medium text-zinc-600">{label}</span>
      <span className="relative mt-1 block">
        <input
          name={name}
          type={visible ? "text" : "password"}
          autoComplete={autoComplete}
          required={required}
          minLength={minLength}
          className={className}
        />
        <button
          type="button"
          className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md px-2 py-1 text-xs font-semibold text-teal-800 hover:bg-teal-50"
          onClick={() => setVisible((v) => !v)}
          aria-label={visible ? `Hide ${label.toLowerCase()}` : `Show ${label.toLowerCase()}`}
        >
          {visible ? "Hide" : "Show"}
        </button>
      </span>
    </label>
  );
}
