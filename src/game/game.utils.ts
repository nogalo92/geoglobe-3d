import { loadCountries, normalizeCountries } from "@data";
import {
  S_countries,
  S_countriesByName,
  S_guessedCountries,
  S_secretCountry,
  S_selectedCountry,
} from "./game.signals";
import { rotateToCountry } from "@scenes/EarthScene/utils/earth.utils";

export async function loadGameData() {
  const countryGeoJSON = await loadCountries("/assets/geodata/countries.json");

  const countriesData = normalizeCountries(countryGeoJSON.features);

  S_countries.value = countriesData;
}

export const startNewGame = () => {
  const countries = S_countries.value;

  if (countries.length === 0) return;

  const randomIndex = Math.floor(Math.random() * countries.length);

  S_secretCountry.value = countries[randomIndex];
  S_selectedCountry.value = null;
  S_guessedCountries.value = [];

  console.log("Secret:", S_secretCountry.value.name);
};

export const submitCountryGuess = (input: string) => {
  const normalizedInput = input.trim().toLowerCase();
  const country = S_countriesByName.value.get(normalizedInput);
  if (!country) {
    console.warn("Country not found:", input);
    return;
  }

  S_selectedCountry.value = country;
  console.log(country, country.center);
  rotateToCountry(country);

  const alreadyGuessed = S_guessedCountries.value.some(
    (guess) => guess.id === country.id,
  );

  if (!alreadyGuessed) {
    S_guessedCountries.value = [...S_guessedCountries.value, country];
  }

  if (country.id === S_secretCountry.value?.id) {
    console.log("Correct!");
  }
};
