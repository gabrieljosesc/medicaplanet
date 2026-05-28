"use client";

import { useEffect, useRef, useState } from "react";
import { loadGoogleMaps } from "@/lib/load-google-maps";
import { parseGooglePlace, type ParsedAddress } from "@/lib/parse-google-place";

const GOOGLE_MAPS_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY?.trim() ?? "";

type Props = {
  id?: string;
  name: string;
  value: string;
  onChange: (value: string) => void;
  onAddressSelect: (address: ParsedAddress) => void;
  className?: string;
  placeholder?: string;
  autoComplete?: string;
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
  autoComplete = "off",
  enterKeyHint = "next",
}: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const onChangeRef = useRef(onChange);
  const onAddressSelectRef = useRef(onAddressSelect);
  const externalValueRef = useRef(value);

  const [inputValue, setInputValue] = useState(value);
  const [loadError, setLoadError] = useState(false);
  const [ready, setReady] = useState(false);

  onChangeRef.current = onChange;
  onAddressSelectRef.current = onAddressSelect;

  // Sync when parent resets the form after validation errors (not on every keystroke).
  useEffect(() => {
    if (value !== externalValueRef.current) {
      externalValueRef.current = value;
      setInputValue(value);
    }
  }, [value]);

  useEffect(() => {
    if (!GOOGLE_MAPS_API_KEY || !inputRef.current) return;

    let autocomplete: google.maps.places.Autocomplete | null = null;
    let cancelled = false;

    loadGoogleMaps(GOOGLE_MAPS_API_KEY)
      .then(() => {
        if (cancelled || !inputRef.current || !window.google?.maps?.places) {
          if (!cancelled) setLoadError(true);
          return;
        }

        const instance = new window.google.maps.places.Autocomplete(inputRef.current, {
          types: ["address"],
          componentRestrictions: { country: "us" },
          fields: ["address_components", "formatted_address"],
        });
        autocomplete = instance;
        setReady(true);
        setLoadError(false);

        instance.addListener("place_changed", () => {
          const place = instance.getPlace();
          if (!place) return;

          const parsed = parseGooglePlace(place);
          if (!parsed) return;

          setInputValue(parsed.line1);
          externalValueRef.current = parsed.line1;
          onChangeRef.current(parsed.line1);
          onAddressSelectRef.current(parsed);
        });
      })
      .catch(() => {
        if (!cancelled) setLoadError(true);
      });

    return () => {
      cancelled = true;
      if (autocomplete && window.google?.maps?.event) {
        window.google.maps.event.clearInstanceListeners(autocomplete);
      }
    };
  }, []);

  const handleBlur = () => {
    externalValueRef.current = inputValue;
    onChange(inputValue);
  };

  return (
    <div className="relative">
      <input
        ref={inputRef}
        id={id}
        name={name}
        value={inputValue}
        onChange={(event) => setInputValue(event.target.value)}
        onBlur={handleBlur}
        autoComplete={autoComplete}
        enterKeyHint={enterKeyHint}
        className={className}
        placeholder={placeholder}
      />
      {!GOOGLE_MAPS_API_KEY ? (
        <p className="mt-1 text-[11px] leading-snug text-amber-800/90">
          Address suggestions are not configured on this environment.
        </p>
      ) : loadError ? (
        <p className="mt-1 text-[11px] leading-snug text-amber-800/90">
          Could not load address suggestions. Type your address manually, or check the API key and
          domain restrictions in Google Cloud.
        </p>
      ) : ready ? (
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
