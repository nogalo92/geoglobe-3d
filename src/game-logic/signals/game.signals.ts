import type { CountryFeature } from "@countryTypes";
import { normalizeCountryName } from "@countryUtils";
import { computed, signal } from "@preact/signals-react";

export const S_countries = signal<CountryFeature[]>([]);

export const S_countriesByName = computed(() => {
  const map = new Map<string, CountryFeature>();

  for (const country of S_countries.value) {
    for (const alias of country.properties.aliases) {
      map.set(normalizeCountryName(alias), country);
    }
  }

  return map;
});

export const S_selectedCountry = signal<CountryFeature | null>(null);
export const S_guessedCountries = signal<CountryFeature[]>([]);
export const S_secretCountry = signal<CountryFeature | null>(null);
