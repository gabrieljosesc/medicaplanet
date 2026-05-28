export {};

declare global {
  namespace google.maps.places {
    interface AutocompletePrediction {
      description: string;
      place_id: string;
    }

    interface AutocompleteRequest {
      input: string;
      componentRestrictions?: { country: string | string[] };
      types?: string[];
    }

    interface PlaceDetailsRequest {
      placeId: string;
      fields?: string[];
    }

    interface PlaceResult {
      address_components?: AddressComponent[];
      formatted_address?: string;
    }

    interface AddressComponent {
      long_name: string;
      short_name: string;
      types: string[];
    }

    class AutocompleteService {
      getPlacePredictions(
        request: AutocompleteRequest,
        callback: (
          predictions: AutocompletePrediction[] | null,
          status: PlacesServiceStatus
        ) => void
      ): void;
    }

    class PlacesService {
      constructor(attrContainer: HTMLDivElement | google.maps.Map);
      getDetails(
        request: PlaceDetailsRequest,
        callback: (place: PlaceResult | null, status: PlacesServiceStatus) => void
      ): void;
    }

    enum PlacesServiceStatus {
      OK = "OK",
      ZERO_RESULTS = "ZERO_RESULTS",
      INVALID_REQUEST = "INVALID_REQUEST",
      OVER_QUERY_LIMIT = "OVER_QUERY_LIMIT",
      REQUEST_DENIED = "REQUEST_DENIED",
      UNKNOWN_ERROR = "UNKNOWN_ERROR",
    }
  }

  namespace google.maps {
    class Map {
      constructor(el: HTMLElement, opts?: object);
    }
  }

  const google: {
    maps: {
      Map: typeof google.maps.Map;
      places: typeof google.maps.places;
    };
  };

  interface Window {
    google?: typeof google;
  }
}
