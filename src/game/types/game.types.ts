import type { CountryFeature } from "@countryTypes";

export type GuessResult = {
  country: CountryFeature;
  distanceKm: number;
  isCorrect: boolean;
  distanceRatio: number;
};

export type SubmitGuessResult =
  | {
      status: "accepted";
      guess: GuessResult;
    }
  | {
      status: "duplicate";
      country: CountryFeature;
    }
  | {
      status: "unknown";
    }
  | {
      status: "no-target";
    };
