import { computed, signal } from "@preact/signals-react";
import type { Country } from "@globalTypes";

export const S_countries = signal<Country[]>([]);
export const S_countriesByName = computed(
  () =>
    new Map(
      S_countries.value.map((country) => [country.name.toLowerCase(), country]),
    ),
);

export const S_selectedCountry = signal<Country | null>(null);
export const S_guessedCountries = signal<Country[]>([]);
export const S_secretCountry = signal<Country | null>(null);
