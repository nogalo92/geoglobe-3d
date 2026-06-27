import {
  S_countries,
  S_countriesByName,
  S_guessedCountries,
  S_secretCountry,
  S_selectedCountry,
} from "@gameSignals";

import { rotateToCountry } from "@earthUtils";
import { loadCountriesData, normalizeCountryName } from "@countryUtils";

export async function loadGameData() {
  const countryGeoJSON = await loadCountriesData(
    "/data/processed/countries.geojson",
  );

  S_countries.value = countryGeoJSON.features;
}

export const startNewGame = () => {
  const countries = S_countries.value.filter(
    (country) => country.properties.playable,
  );

  if (countries.length === 0) return;

  const randomIndex = Math.floor(Math.random() * countries.length);

  S_secretCountry.value = countries[randomIndex];
  S_selectedCountry.value = null;
  S_guessedCountries.value = [];

  console.log("Secret:", S_secretCountry.value.properties.displayName);
};

export const submitCountryGuess = (input: string) => {
  const normalizedInput = normalizeCountryName(input);
  const country = S_countriesByName.value.get(normalizedInput);

  if (!country) {
    console.warn("Country not found:", input);
    return;
  }

  if (!country.properties.playable) {
    console.warn("Country is not playable:", country.properties.displayName);
    return;
  }

  S_selectedCountry.value = country;
  rotateToCountry(country);

  const alreadyGuessed = S_guessedCountries.value.some(
    (guess) => guess.properties.id === country.properties.id,
  );

  if (!alreadyGuessed) {
    S_guessedCountries.value = [...S_guessedCountries.value, country];
  }

  if (country.properties.id === S_secretCountry.value?.properties.id) {
    console.log("Correct!");
  }
};
