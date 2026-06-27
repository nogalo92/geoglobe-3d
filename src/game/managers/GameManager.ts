import { signal } from "@preact/signals-react";
import type { CountryFeature } from "@countryTypes";
import type { CountryManager } from "@countryManagers";
import type { GuessResult, SubmitGuessResult } from "@gameTypes";
import { getCountryDistanceKm, getDistanceRatio } from "@gameUtils";
import type { CountryRenderer } from "@countryRenderer";

export class GameManager {
  private countryManager: CountryManager;
  private countryRenderer: CountryRenderer;

  readonly targetCountry = signal<CountryFeature | null>(null);
  readonly selectedCountry = signal<CountryFeature | null>(null);
  readonly guesses = signal<GuessResult[]>([]);

  constructor(
    countryManager: CountryManager,
    countryRenderer: CountryRenderer,
  ) {
    this.countryManager = countryManager;
    this.countryRenderer = countryRenderer;
  }

  startNewGame(): void {
    const target = this.countryManager.getRandomPlayable();

    this.targetCountry.value = target;
    this.selectedCountry.value = null;
    this.guesses.value = [];

    console.log("Secret:", target.properties.displayName);
  }

  submitGuess(input: string): SubmitGuessResult {
    const guessedCountry = this.countryManager.findByAlias(input);

    if (!guessedCountry) {
      return {
        status: "unknown",
      };
    }

    const alreadyGuessed = this.guesses.value.some(
      (guess) => guess.country.properties.id === guessedCountry.properties.id,
    );

    if (alreadyGuessed) {
      return {
        status: "duplicate",
        country: guessedCountry,
      };
    }

    const targetCountry = this.targetCountry.value;

    if (!targetCountry) {
      return {
        status: "no-target",
      };
    }

    const distanceKm = getCountryDistanceKm(guessedCountry, targetCountry);
    const distanceRatio = getDistanceRatio(distanceKm);

    const isCorrect =
      guessedCountry.properties.id === targetCountry.properties.id;

    const guess: GuessResult = {
      country: guessedCountry,
      distanceKm,
      distanceRatio,
      isCorrect,
    };

    this.countryRenderer.markGuess(guessedCountry, distanceRatio);

    this.guesses.value = [...this.guesses.value, guess];

    return {
      status: "accepted",
      guess,
    };
  }

  selectCountry(country: CountryFeature | null): void {
    this.selectedCountry.value = country;
  }

  resetSelection(): void {
    this.selectedCountry.value = null;
  }
}
