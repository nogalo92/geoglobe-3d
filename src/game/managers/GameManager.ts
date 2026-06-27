import { signal } from "@preact/signals-react";
import type { CountryFeature } from "@countryTypes";
import type { CountryManager } from "@countryManagers";
import type { GuessResult } from "@gameTypes";
import { getDistanceKm } from "@gameUtils";

export class GameManager {
  private countryManager: CountryManager;

  readonly targetCountry = signal<CountryFeature | null>(null);
  readonly selectedCountry = signal<CountryFeature | null>(null);
  readonly guesses = signal<GuessResult[]>([]);

  constructor(countryManager: CountryManager) {
    this.countryManager = countryManager;
  }

  startNewGame(): void {
    const target = this.countryManager.getRandomPlayable();

    this.targetCountry.value = target;
    this.selectedCountry.value = null;
    this.guesses.value = [];

    console.log("Secret:", target.properties.displayName);
  }

  submitGuess(input: string): GuessResult | null {
    const target = this.targetCountry.value;

    if (!target) {
      throw new Error("Game has not started.");
    }

    const guessedCountry = this.countryManager.findByAlias(input);

    if (!guessedCountry || !guessedCountry.properties.playable) {
      return null;
    }

    const alreadyGuessed = this.guesses.value.some(
      (guess) => guess.country.properties.id === guessedCountry.properties.id,
    );

    if (alreadyGuessed) {
      return null;
    }

    const result: GuessResult = {
      country: guessedCountry,
      distanceKm: getDistanceKm(
        guessedCountry.properties.centroid,
        target.properties.centroid,
      ),
      isCorrect: guessedCountry.properties.id === target.properties.id,
    };

    this.guesses.value = [...this.guesses.value, result];
    this.selectedCountry.value = guessedCountry;

    return result;
  }

  selectCountry(country: CountryFeature | null): void {
    this.selectedCountry.value = country;
  }

  resetSelection(): void {
    this.selectedCountry.value = null;
  }
}
