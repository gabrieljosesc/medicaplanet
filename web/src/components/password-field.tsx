"use client";

import { useState } from "react";

type PasswordFieldProps = {
  name: string;
  label: string;
  id?: string;
  autoComplete?: string;
  required?: boolean;
  minLength?: number;
  defaultValue?: string;
  placeholder?: string;
  className?: string;
  labelClassName?: string;
};

export function PasswordField({
  name,
  label,
  id,
  autoComplete,
  required,
  minLength,
  defaultValue,
  placeholder,
  className = "mt-1 w-full rounded-md border border-zinc-300 px-3 py-2 pr-20 text-sm",
  labelClassName = "text-xs font-medium text-zinc-600",
}: PasswordFieldProps) {
  const [visible, setVisible] = useState(false);

  return (
    <label className="block">
      <span className={labelClassName}>{label}</span>
      <span className="relative mt-1 block">
        <input
          id={id}
          name={name}
          type={visible ? "text" : "password"}
          autoComplete={autoComplete}
          required={required}
          minLength={minLength}
          defaultValue={defaultValue}
          placeholder={placeholder}
          className={className}
        />
        <button
          type="button"
          className="absolute right-2 top-1/2 inline-flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full text-teal-800 transition hover:bg-teal-50"
          onClick={() => setVisible((v) => !v)}
          aria-label={visible ? `Hide ${label.toLowerCase()}` : `Show ${label.toLowerCase()}`}
        >
          {visible ? (
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
              <path d="M3 3l18 18" strokeLinecap="round" />
              <path d="M10.6 10.6a2 2 0 0 0 2.8 2.8" strokeLinecap="round" />
              <path d="M9.9 4.4A9.8 9.8 0 0 1 12 4c5 0 8.6 4.3 10 8-0.5 1.4-1.4 2.8-2.5 4" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M6.2 6.2C4.2 7.7 2.8 9.9 2 12c1.4 3.7 5 8 10 8 1.9 0 3.6-.6 5.1-1.6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          ) : (
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
              <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z" strokeLinecap="round" strokeLinejoin="round" />
              <circle cx="12" cy="12" r="3" />
            </svg>
          )}
        </button>
      </span>
    </label>
  );
}
