"use client";

import Link from "next/link";
import { Suspense, useActionState } from "react";
import { useSearchParams } from "next/navigation";
import { registerWithProfile, type RegisterFormState } from "@/app/actions/auth";
import { COUNTRY_OPTIONS } from "@/app/auth/register/countries";
import { safeAuthRedirectTarget } from "@/lib/safe-redirect";

const pill =
  "w-full rounded-full border border-emerald-300 bg-white px-4 py-2.5 text-sm text-emerald-950 placeholder:text-emerald-500/70 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 disabled:opacity-60";
const pillError =
  "border-red-500 ring-2 ring-red-200 bg-red-50/60";

function fieldErr(state: RegisterFormState, key: string): string | undefined {
  if (!state || !("fieldErrors" in state) || !state.fieldErrors) return undefined;
  return state.fieldErrors[key];
}

function hasFieldError(state: RegisterFormState, key: string): boolean {
  return Boolean(fieldErr(state, key));
}

function RegisterFormWithQuery() {
  const searchParams = useSearchParams();
  const urlError = searchParams.get("error");
  const next = safeAuthRedirectTarget(searchParams.get("next"));
  const [state, formAction, pending] = useActionState(registerWithProfile, null);

  const globalError =
    (state && "error" in state ? state.error : null) ?? (urlError ? decodeURIComponent(urlError) : null);

  return (
    <RegisterFormInner
      state={state}
      formAction={formAction}
      pending={pending}
      globalError={globalError}
      nextTarget={next}
    />
  );
}

function RegisterFormInner({
  state,
  formAction,
  pending,
  globalError,
  nextTarget,
}: {
  state: RegisterFormState;
  formAction: (payload: FormData) => void;
  pending: boolean;
  globalError: string | null;
  nextTarget: string | null;
}) {
  return (
    <div className="mx-auto max-w-2xl px-1">
      <h1 className="text-2xl font-semibold text-emerald-950">Create account</h1>
      <p className="mt-1 text-sm text-emerald-800/90">
        Licensed professionals only. All fields marked with <span className="text-red-500">*</span>{" "}
        are required for compliance review before account approval and fulfillment access.
      </p>
      <p className="mt-2 text-xs text-emerald-800/80">
        By registering, you agree to our{" "}
        <Link href="/legal/terms" className="underline hover:no-underline">
          Terms of Supply
        </Link>
        ,{" "}
        <Link href="/legal/privacy" className="underline hover:no-underline">
          Privacy Notice
        </Link>
        , and{" "}
        <Link href="/legal/verification" className="underline hover:no-underline">
          Professional Verification Policy
        </Link>
        .
      </p>

      {globalError && (
        <p className="mt-4 rounded-2xl border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-800">
          {globalError}
        </p>
      )}

      <form action={formAction} className="mt-8 space-y-4">
        {nextTarget ? <input type="hidden" name="next" value={nextTarget} /> : null}
        <div>
          <label className="mb-1 block text-sm font-medium text-emerald-900">
            Email <span className="text-red-500">*</span>
          </label>
          <input
            name="email"
            type="email"
            autoComplete="email"
            className={`${pill} ${hasFieldError(state, "email") ? pillError : ""}`}
            placeholder="Email *"
          />
          {fieldErr(state, "email") && (
            <p className="mt-1 text-xs text-red-600">{fieldErr(state, "email")}</p>
          )}
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm font-medium text-emerald-900">
              Password <span className="text-red-500">*</span>
            </label>
            <input
              name="password"
              type="password"
              autoComplete="new-password"
              className={`${pill} ${hasFieldError(state, "password") || hasFieldError(state, "confirm_password") ? pillError : ""}`}
              placeholder="Password *"
            />
            {fieldErr(state, "password") && (
              <p className="mt-1 text-xs text-red-600">{fieldErr(state, "password")}</p>
            )}
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-emerald-900">
              Confirm password <span className="text-red-500">*</span>
            </label>
            <input
              name="confirm_password"
              type="password"
              autoComplete="new-password"
              className={`${pill} ${hasFieldError(state, "confirm_password") ? pillError : ""}`}
              placeholder="Confirm password *"
            />
            {fieldErr(state, "confirm_password") && (
              <p className="mt-1 text-xs text-red-600">{fieldErr(state, "confirm_password")}</p>
            )}
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm font-medium text-emerald-900">
              First name <span className="text-red-500">*</span>
            </label>
            <input
              name="first_name"
              autoComplete="given-name"
              className={`${pill} ${hasFieldError(state, "first_name") ? pillError : ""}`}
              placeholder="First name *"
            />
            {fieldErr(state, "first_name") && (
              <p className="mt-1 text-xs text-red-600">{fieldErr(state, "first_name")}</p>
            )}
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-emerald-900">
              Last name <span className="text-red-500">*</span>
            </label>
            <input
              name="last_name"
              autoComplete="family-name"
              className={`${pill} ${hasFieldError(state, "last_name") ? pillError : ""}`}
              placeholder="Last Name *"
            />
            {fieldErr(state, "last_name") && (
              <p className="mt-1 text-xs text-red-600">{fieldErr(state, "last_name")}</p>
            )}
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm font-medium text-emerald-900">
              Delivery address <span className="text-red-500">*</span>
            </label>
            <input
              name="delivery_address"
              autoComplete="street-address"
              className={`${pill} ${hasFieldError(state, "delivery_address") ? pillError : ""}`}
              placeholder="Delivery Address *"
            />
            {fieldErr(state, "delivery_address") && (
              <p className="mt-1 text-xs text-red-600">{fieldErr(state, "delivery_address")}</p>
            )}
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-emerald-900">
              Country <span className="text-red-500">*</span>
            </label>
            <select
              name="country"
              defaultValue=""
              required
              className={`${pill} cursor-pointer appearance-none bg-[length:1rem] bg-[right_0.75rem_center] bg-no-repeat ${hasFieldError(state, "country") ? pillError : ""}`}
              style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%23059669'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`,
              }}
            >
              <option value="" disabled>
                Please select your Country
              </option>
              {COUNTRY_OPTIONS.map((c) => (
                <option key={c.value} value={c.value}>
                  {c.label}
                </option>
              ))}
            </select>
            {fieldErr(state, "country") && (
              <p className="mt-1 text-xs text-red-600">{fieldErr(state, "country")}</p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm font-medium text-emerald-900">
              City <span className="text-red-500">*</span>
            </label>
            <input
              name="city"
              autoComplete="address-level2"
              className={`${pill} ${hasFieldError(state, "city") ? pillError : ""}`}
              placeholder="City *"
            />
            {fieldErr(state, "city") && (
              <p className="mt-1 text-xs text-red-600">{fieldErr(state, "city")}</p>
            )}
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="min-w-0">
              <label className="mb-1 block text-sm font-medium text-emerald-900">
                State / province <span className="text-red-500">*</span>
              </label>
              <input
                name="state"
                autoComplete="address-level1"
                className={`${pill} ${hasFieldError(state, "state") ? pillError : ""}`}
                placeholder="State *"
              />
              {fieldErr(state, "state") && (
                <p className="mt-1 text-xs text-red-600">{fieldErr(state, "state")}</p>
              )}
            </div>
            <div className="min-w-0">
              <label className="mb-1 block text-sm font-medium text-emerald-900">
                Zip <span className="text-red-500">*</span>
              </label>
              <input
                name="postal_code"
                autoComplete="postal-code"
                className={`${pill} ${hasFieldError(state, "postal_code") ? pillError : ""}`}
                placeholder="Zip *"
              />
              {fieldErr(state, "postal_code") && (
                <p className="mt-1 text-xs text-red-600">{fieldErr(state, "postal_code")}</p>
              )}
            </div>
          </div>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-emerald-900">
            Confirm email <span className="text-red-500">*</span>
          </label>
          <input
            name="confirm_email"
            type="email"
            autoComplete="email"
            className={`${pill} ${hasFieldError(state, "confirm_email") ? pillError : ""}`}
            placeholder="Re-enter your email *"
          />
          {fieldErr(state, "confirm_email") && (
            <p className="mt-1 text-xs text-red-600">{fieldErr(state, "confirm_email")}</p>
          )}
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm font-medium text-emerald-900">
              Phone <span className="text-red-500">*</span>
            </label>
            <input
              name="phone"
              type="tel"
              autoComplete="tel"
              className={`${pill} ${hasFieldError(state, "phone") ? pillError : ""}`}
              placeholder="Phone *"
            />
            {fieldErr(state, "phone") && (
              <p className="mt-1 text-xs text-red-600">{fieldErr(state, "phone")}</p>
            )}
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-emerald-900">
              Profession <span className="text-red-500">*</span>
            </label>
            <input
              name="profession"
              autoComplete="organization-title"
              className={`${pill} ${hasFieldError(state, "profession") ? pillError : ""}`}
              placeholder="Profession *"
            />
            {fieldErr(state, "profession") && (
              <p className="mt-1 text-xs text-red-600">{fieldErr(state, "profession")}</p>
            )}
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm font-medium text-emerald-900">
              License number <span className="text-red-500">*</span>
            </label>
            <input
              name="license_number"
              autoComplete="off"
              className={`${pill} ${hasFieldError(state, "license_number") ? pillError : ""}`}
              placeholder="License Number *"
            />
            {fieldErr(state, "license_number") && (
              <p className="mt-1 text-xs text-red-600">{fieldErr(state, "license_number")}</p>
            )}
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-emerald-900">
              License expiry <span className="text-red-500">*</span>
            </label>
            <input
              name="license_expiry"
              type="date"
              className={`${pill} cursor-pointer ${hasFieldError(state, "license_expiry") ? pillError : ""}`}
            />
            {fieldErr(state, "license_expiry") && (
              <p className="mt-1 text-xs text-red-600">{fieldErr(state, "license_expiry")}</p>
            )}
          </div>
        </div>

        <label className="mt-6 flex items-start gap-2 text-xs text-emerald-900/90">
          <input type="checkbox" required className="mt-0.5 size-4 rounded border-emerald-300" />
          <span>
            I confirm I am authorized to purchase regulated medical/aesthetic supplies and that my
            license information is accurate and current.
          </span>
        </label>

        <div className="mt-6 text-center">
          <button
            type="submit"
            disabled={pending}
            className="inline-flex min-w-44 justify-center rounded-full bg-emerald-700 px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-800 disabled:pointer-events-none disabled:opacity-50"
          >
            {pending ? "Creating account..." : "Register"}
          </button>
        </div>
      </form>

      <p className="mt-6 text-center text-sm text-emerald-900/80">
        Already have an account?{" "}
        <Link
          href={nextTarget ? `/auth/login?next=${encodeURIComponent(nextTarget)}` : "/auth/login"}
          className="font-semibold text-emerald-700 underline-offset-2 hover:underline"
        >
          Sign in
        </Link>
      </p>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense fallback={<div className="mx-auto max-w-2xl py-12 text-center text-emerald-900">Loading...</div>}>
      <RegisterFormWithQuery />
    </Suspense>
  );
}
