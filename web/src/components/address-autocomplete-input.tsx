"use client";

import { useEffect, useRef } from "react";
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
  autoComplete = "shipping street-address",
  enterKeyHint = "next",
}: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const onChangeRef = useRef(onChange);
  const onAddressSelectRef = useRef(onAddressSelect);

  onChangeRef.current = onChange;
  onAddressSelectRef.current = onAddressSelect;

  useEffect(() => {
    if (!GOOGLE_MAPS_API_KEY || !inputRef.current) return;

    let autocomplete: google.maps.places.Autocomplete | null = null;
    let cancelled = false;

    loadGoogleMaps(GOOGLE_MAPS_API_KEY)
      .then(() => {
        if (cancelled || !inputRef.current || !window.google?.maps?.places) return;

        const instance = new window.google.maps.places.Autocomplete(inputRef.current, {
          types: ["address"],
          fields: ["address_components", "formatted_address"],
        });
        autocomplete = instance;

        instance.addListener("place_changed", () => {
          const place = instance.getPlace();
          if (!place) return;

          const parsed = parseGooglePlace(place);
          if (!parsed) return;

          onChangeRef.current(parsed.line1);
          onAddressSelectRef.current(parsed);
        });
      })
      .catch(() => {
        // Fall back to a plain text input when Maps fails to load.
      });

    return () => {
      cancelled = true;
      if (autocomplete && window.google?.maps?.event) {
        window.google.maps.event.clearInstanceListeners(autocomplete);
      }
    };
  }, []);

  return (
    <div>
      <input
        ref={inputRef}
        id={id}
        name={name}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        autoComplete={autoComplete}
        enterKeyHint={enterKeyHint}
        className={className}
        placeholder={placeholder}
      />
      {GOOGLE_MAPS_API_KEY ? (
        <p className="mt-1 text-[11px] leading-snug text-teal-800/75">
          Start typing your address and choose a suggestion to fill city, state, and zip automatically.
        </p>
      ) : null}
    </div>
  );
}
