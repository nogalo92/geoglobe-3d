import type { CountryFeature } from "@countryTypes";

export type GuessResult = {
  country: CountryFeature;
  distanceKm: number;
  isCorrect: boolean;
};
