export {};

declare global {
  namespace google.maps.places {
    interface AutocompleteOptions {
      fields?: string[];
      types?: string[];
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

    class Autocomplete {
      constructor(input: HTMLInputElement, opts?: AutocompleteOptions);
      addListener(event: string, handler: () => void): MapsEventListener;
      getPlace(): PlaceResult;
    }

    interface MapsEventListener {
      remove(): void;
    }
  }

  namespace google.maps.event {
    function clearInstanceListeners(instance: object): void;
  }

  const google: {
    maps: {
      places: typeof google.maps.places;
      event: typeof google.maps.event;
    };
  };

  interface Window {
    google?: typeof google;
  }
}
