/** Google Places returns ISO 3166-1 alpha-2; registration stores alpha-3 from countries.ts */
export const GOOGLE_COUNTRY_TO_REGISTRATION: Record<string, string> = {
  US: "USA",
  CA: "CAN",
  GB: "GBR",
  AU: "AUS",
  DE: "DEU",
  FR: "FRA",
  IT: "ITA",
  ES: "ESP",
  MX: "MEX",
  BR: "BRA",
  IN: "IND",
  CN: "CHN",
  JP: "JPN",
  KR: "KOR",
  NL: "NLD",
  BE: "BEL",
  CH: "CHE",
  AT: "AUT",
  SE: "SWE",
  NO: "NOR",
  DK: "DNK",
  FI: "FIN",
  IE: "IRL",
  NZ: "NZL",
  SG: "SGP",
  AE: "ARE",
  ZA: "ZAF",
  PH: "PHL",
};

export function mapGoogleCountryToRegistration(iso2: string): string {
  return GOOGLE_COUNTRY_TO_REGISTRATION[iso2.toUpperCase()] ?? "OTHER";
}
