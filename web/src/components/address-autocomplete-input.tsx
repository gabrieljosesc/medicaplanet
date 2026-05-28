"use client";

import { useCallback, useEffect, useId, useRef, useState } from "react";
import { loadGoogleMaps } from "@/lib/load-google-maps";
import { parseGooglePlace, type ParsedAddress } from "@/lib/parse-google-place";

const GOOGLE_MAPS_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY?.trim() ?? "";
const MIN_CHARS = 3;
const DEBOUNCE_MS = 300;

type Status = "loading" | "ready" | "error" | "no-key";

type Suggestion = {
  placeId: string;
  description: string;
};

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

function placesStatusOk(status: google.maps.places.PlacesServiceStatus | string): boolean {
  return status === "OK" || status === window.google?.maps?.places?.PlacesServiceStatus?.OK;
}

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
  const listId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const servicesRef = useRef<{
    autocomplete: google.maps.places.AutocompleteService;
    places: google.maps.places.PlacesService;
  } | null>(null);
  const lastExternalValue = useRef(value);
  const statusRef = useRef<Status>(GOOGLE_MAPS_API_KEY ? "loading" : "no-key");

  const [query, setQuery] = useState(value);
  const queryRef = useRef(query);
  queryRef.current = query;
  const [status, setStatus] = useState<Status>(statusRef.current);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [hint, setHint] = useState<string | null>(null);
  const [fetching, setFetching] = useState(false);

  statusRef.current = status;

  // Sync when parent resets form (validation errors only).
  useEffect(() => {
    if (value !== lastExternalValue.current) {
      lastExternalValue.current = value;
      setQuery(value);
      setSuggestions([]);
      setOpen(false);
      setHint(null);
    }
  }, [value]);

  useEffect(() => {
    if (!GOOGLE_MAPS_API_KEY) {
      setStatus("no-key");
      return;
    }

    let cancelled = false;

    loadGoogleMaps(GOOGLE_MAPS_API_KEY)
      .then(() => {
        if (cancelled || !window.google?.maps?.places) {
          if (!cancelled) setStatus("error");
          return;
        }

        const mount = document.createElement("div");
        servicesRef.current = {
          autocomplete: new window.google.maps.places.AutocompleteService(),
          places: new window.google.maps.places.PlacesService(mount),
        };
        setStatus("ready");
      })
      .catch(() => {
        if (!cancelled) setStatus("error");
      });

    return () => {
      cancelled = true;
      servicesRef.current = null;
    };
  }, []);

  const fetchSuggestions = useCallback((input: string) => {
    const services = servicesRef.current;
    const trimmed = input.trim();

    if (!services || trimmed.length < MIN_CHARS) {
      setSuggestions([]);
      setOpen(false);
      setHint(null);
      setFetching(false);
      return;
    }

    setFetching(true);
    setHint(null);

    // Detect when Google silently drops the callback (e.g. Maps JavaScript API not enabled).
    const callbackTimeout = setTimeout(() => {
      setFetching(false);
      setHint(
        "Address lookup timed out. In Google Cloud Console, enable both Maps JavaScript API AND Places API for this key."
      );
    }, 5000);

    services.autocomplete.getPlacePredictions(
      {
        input: trimmed,
        componentRestrictions: { country: "us" },
      },
      (predictions, predictionStatus) => {
        clearTimeout(callbackTimeout);
        setFetching(false);

        if (predictionStatus === "REQUEST_DENIED" || predictionStatus === "OVER_QUERY_LIMIT") {
          setSuggestions([]);
          setOpen(false);
          setHint(
            "Address lookup is blocked. Check the Google API key, billing, and domain restrictions in Google Cloud."
          );
          return;
        }

        if (!placesStatusOk(predictionStatus) || !predictions?.length) {
          setSuggestions([]);
          setOpen(false);
          if (predictionStatus === "ZERO_RESULTS") {
            setHint("No matching addresses. Try a street number + street name (e.g. 123 Main St).");
          }
          return;
        }

        setSuggestions(
          predictions.map((p) => ({
            placeId: p.place_id,
            description: p.description,
          }))
        );
        setOpen(true);
        setActiveIndex(-1);
        setHint(null);
      }
    );
  }, []);

  // If user typed before Google finished loading, search now when ready.
  useEffect(() => {
    if (status === "ready" && queryRef.current.trim().length >= MIN_CHARS) {
      fetchSuggestions(queryRef.current);
    }
  }, [status, fetchSuggestions]);

  const scheduleFetch = useCallback(
    (input: string) => {
      if (debounceRef.current) clearTimeout(debounceRef.current);

      if (statusRef.current !== "ready") {
        return;
      }

      debounceRef.current = setTimeout(() => fetchSuggestions(input), DEBOUNCE_MS);
    },
    [fetchSuggestions]
  );

  const handleInputChange = (next: string) => {
    setQuery(next);
    setHint(null);
    scheduleFetch(next);
  };

  const selectSuggestion = (suggestion: Suggestion) => {
    const services = servicesRef.current;
    if (!services) return;

    setOpen(false);
    setSuggestions([]);
    setHint(null);
    setQuery(suggestion.description);
    lastExternalValue.current = suggestion.description;
    onChange(suggestion.description);

    services.places.getDetails(
      {
        placeId: suggestion.placeId,
        fields: ["address_components", "formatted_address"],
      },
      (place, detailStatus) => {
        if (!placesStatusOk(detailStatus) || !place) return;

        const parsed = parseGooglePlace(place);
        if (!parsed) return;

        setQuery(parsed.line1);
        lastExternalValue.current = parsed.line1;
        onChange(parsed.line1);
        onAddressSelect(parsed);
      }
    );
  };

  const handleBlur = () => {
    const v = inputRef.current?.value ?? queryRef.current;
    lastExternalValue.current = v;
    onChange(v);
    window.setTimeout(() => setOpen(false), 150);
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (!open || !suggestions.length) return;

    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActiveIndex((i) => (i + 1) % suggestions.length);
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setActiveIndex((i) => (i <= 0 ? suggestions.length - 1 : i - 1));
    } else if (event.key === "Enter" && activeIndex >= 0) {
      event.preventDefault();
      selectSuggestion(suggestions[activeIndex]);
    } else if (event.key === "Escape") {
      setOpen(false);
    }
  };

  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  const helperText =
    hint ??
    (status === "no-key"
      ? "Address suggestions are not configured on this environment."
      : status === "error"
        ? "Could not load address suggestions. Type your address manually, or check the API key in Google Cloud."
        : status === "ready"
          ? fetching
            ? "Searching addresses…"
            : "Type at least 3 characters, then pick a U.S. address to fill city, state, and zip."
          : "Loading address suggestions…");

  return (
    <div ref={wrapperRef} className="relative">
      <input
        ref={inputRef}
        id={id}
        name={name}
        type="text"
        value={query}
        onChange={(event) => handleInputChange(event.target.value)}
        onFocus={() => {
          if (suggestions.length > 0) {
            setOpen(true);
          } else if (query.trim().length >= MIN_CHARS && status === "ready") {
            scheduleFetch(query);
          }
        }}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
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
        role="combobox"
        aria-expanded={open && suggestions.length > 0}
        aria-controls={listId}
        aria-autocomplete="list"
      />

      {open && suggestions.length > 0 ? (
        <ul
          id={listId}
          role="listbox"
          className="absolute left-0 right-0 z-[10001] mt-1 max-h-56 overflow-auto rounded-xl border border-teal-200 bg-white py-1 shadow-lg"
        >
          {suggestions.map((s, index) => (
            <li key={s.placeId} role="option" aria-selected={index === activeIndex}>
              <button
                type="button"
                tabIndex={-1}
                className={`w-full px-3 py-2 text-left text-sm text-teal-950 hover:bg-teal-50 ${
                  index === activeIndex ? "bg-teal-50" : ""
                }`}
                onMouseDown={(event) => {
                  event.preventDefault();
                  selectSuggestion(s);
                }}
              >
                {s.description}
              </button>
            </li>
          ))}
        </ul>
      ) : null}

      <p
        className={`mt-1 text-[11px] leading-snug ${
          hint || status === "error" || status === "no-key" ? "text-amber-800/90" : "text-teal-800/75"
        }`}
      >
        {helperText}
      </p>
    </div>
  );
}
