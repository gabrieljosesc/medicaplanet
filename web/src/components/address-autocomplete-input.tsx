"use client";

import { useEffect, useRef, useState } from "react";
import { loadGoogleMaps } from "@/lib/load-google-maps";
import { parseGooglePlace, type ParsedAddress } from "@/lib/parse-google-place";

const GOOGLE_MAPS_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY?.trim() ?? "";

type Status = "loading" | "ready" | "error" | "no-key";

type Props = {
  id?: string;
  name: string;
  value: string;
  onChange: (value: string) => void;
  onAddressSelect: (address: ParsedAddress) => void;
  className?: string;
  placeholder?: string;
  enterKeyHint?: "next" | "done" | "search" | "go" | "send";
};

export function AddressAutocompleteInput({
  id,
  name,
  value,
  onChange,
  onAddressSelect,
  className,
  placeholder,
  enterKeyHint = "next",
}: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const onChangeRef = useRef(onChange);
  const onAddressSelectRef = useRef(onAddressSelect);
  const lastExternalValue = useRef(value);

  const [resetKey, setResetKey] = useState(0);
  const [status, setStatus] = useState<Status>(GOOGLE_MAPS_API_KEY ? "loading" : "no-key");

  onChangeRef.current = onChange;
  onAddressSelectRef.current = onAddressSelect;

  // Remount input when parent resets form values (validation errors).
  useEffect(() => {
    if (value !== lastExternalValue.current) {
      lastExternalValue.current = value;
      setResetKey((k) => k + 1);
    }
  }, [value]);

  useEffect(() => {
    if (!GOOGLE_MAPS_API_KEY) {
      setStatus("no-key");
      return;
    }

    const input = inputRef.current;
    if (!input) return;

    let autocomplete: google.maps.places.Autocomplete | null = null;
    let cancelled = false;

    loadGoogleMaps(GOOGLE_MAPS_API_KEY)
      .then(() => {
        if (cancelled || !inputRef.current || !window.google?.maps?.places) {
          if (!cancelled) setStatus("error");
          return;
        }

        const instance = new window.google.maps.places.Autocomplete(inputRef.current, {
          types: ["address"],
          componentRestrictions: { country: "us" },
          fields: ["address_components", "formatted_address"],
        });
        autocomplete = instance;

        instance.addListener("place_changed", () => {
          const place = instance.getPlace();
          if (!place || !inputRef.current) return;

          const parsed = parseGooglePlace(place);
          if (!parsed) return;

          inputRef.current.value = parsed.line1;
          lastExternalValue.current = parsed.line1;
          onChangeRef.current(parsed.line1);
          onAddressSelectRef.current(parsed);
        });

        setStatus("ready");
      })
      .catch(() => {
        if (!cancelled) setStatus("error");
      });

    return () => {
      cancelled = true;
      if (autocomplete && window.google?.maps?.event) {
        window.google.maps.event.clearInstanceListeners(autocomplete);
      }
    };
  }, [resetKey]);

  const syncToParent = () => {
    const v = inputRef.current?.value ?? "";
    lastExternalValue.current = v;
    onChange(v);
  };

  return (
    <div className="relative">
      {/* Uncontrolled: Google Places breaks when React controls value on each keystroke. */}
      <input
        key={resetKey}
        ref={inputRef}
        id={id}
        name={name}
        type="text"
        defaultValue={value}
        onBlur={syncToParent}
        enterKeyHint={enterKeyHint}
        className={className}
        placeholder={placeholder}
        autoComplete="off"
        autoCorrect="off"
        autoCapitalize="off"
        spellCheck={false}
        data-1p-ignore
        data-lpignore="true"
        data-form-type="other"
      />
      {status === "no-key" ? (
        <p className="mt-1 text-[11px] leading-snug text-amber-800/90">
          Address suggestions are not configured on this environment.
        </p>
      ) : status === "error" ? (
        <p className="mt-1 text-[11px] leading-snug text-amber-800/90">
          Could not load address suggestions. Type your address manually, or check the API key and
          domain restrictions in Google Cloud.
        </p>
      ) : status === "ready" ? (
        <p className="mt-1 text-[11px] leading-snug text-teal-800/75">
          Start typing a U.S. address and pick a suggestion to fill city, state, and zip
          automatically.
        </p>
      ) : (
        <p className="mt-1 text-[11px] leading-snug text-teal-800/75">Loading address suggestions…</p>
      )}
    </div>
  );
}
