"use client";

import { useFormStatus } from "react-dom";
import { LoadingSpinner } from "@/components/loading-spinner";

const primaryClass =
  "inline-flex w-full items-center justify-center gap-2 rounded-full bg-teal-800 py-2.5 text-sm font-semibold text-white transition hover:bg-teal-900 hover:shadow-md active:scale-[0.98] active:opacity-90 disabled:cursor-not-allowed disabled:opacity-70";

type SubmitButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  pendingLabel?: string;
  /** Use `full` for block-width CTAs (login, checkout-style). */
  variant?: "primary" | "inline";
};

/**
 * Submit button that reflects server-action pending state via `useFormStatus`.
 * Must be rendered inside a `<form action={...}>`.
 */
export function SubmitButton({
  children,
  pendingLabel,
  className = "",
  variant = "primary",
  disabled,
  ...rest
}: SubmitButtonProps) {
  const { pending } = useFormStatus();
  const isDisabled = disabled || pending;
  const base = variant === "primary" ? primaryClass : "inline-flex items-center justify-center gap-2";

  return (
    <button
      type="submit"
      disabled={isDisabled}
      aria-busy={pending}
      className={`${base} ${className}`.trim()}
      {...rest}
    >
      {pending ? (
        <>
          <LoadingSpinner className="h-4 w-4 shrink-0" />
          <span>{pendingLabel ?? children}</span>
        </>
      ) : (
        children
      )}
    </button>
  );
}
