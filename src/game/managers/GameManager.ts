import { signal } from "@preact/signals-react";
import type { CountryFeature } from "@countryTypes";
import type { CountryManager } from "@countryManagers";
import type { GuessResult } from "@gameTypes";
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

  submitGuess(input: string): GuessResult | null {
    const guessedCountry = this.countryManager.findByAlias(input);
    if (!guessedCountry) return null;

    const targetCountry = this.targetCountry.value;
    if (!targetCountry) return null;

    const distanceKm = getCountryDistanceKm(guessedCountry, targetCountry);

    const distanceRatio = getDistanceRatio(distanceKm);

    this.countryRenderer.markGuess(guessedCountry, distanceRatio);

    const isCorrect =
      guessedCountry.properties.id === targetCountry.properties.id;

    const result = {
      country: guessedCountry,
      distanceKm,
      distanceRatio,
      isCorrect,
    };

    this.guesses.value = [...this.guesses.value, result];

    return result;
  }

  selectCountry(country: CountryFeature | null): void {
    this.selectedCountry.value = country;
  }

  resetSelection(): void {
    this.selectedCountry.value = null;
  }
}
