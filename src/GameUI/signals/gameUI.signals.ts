import { signal } from "@preact/signals-react";
import type { CountryFeature } from "@countryTypes";
import type { GuessResult } from "@gameTypes";

export const S_emptyGuesses = signal<GuessResult[]>([]);
export const S_emptyCountry = signal<CountryFeature | null>(null);
