import type { CountryManager } from "@countryManagers";
import type { CountryRenderer } from "@countryRenderer";
import type { CountryFeature } from "@countryTypes";
import type { GameManager } from "@gameManagers";
import type { EarthManager } from "@scenes/EarthScene/managers";
import type { GameLoop } from "../GameLoop";

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

export type GameInstance = {
  countryManager: CountryManager;
  countryRenderer: CountryRenderer;
  earthManager: EarthManager;
  gameManager: GameManager;
  gameLoop: GameLoop;

  dispose(): void;
};
