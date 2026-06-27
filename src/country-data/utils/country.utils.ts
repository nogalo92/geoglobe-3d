import type { CountriesGeoJson } from "@countryTypes";

export const loadCountriesData = async (
  path: string,
): Promise<CountriesGeoJson> => {
  const response = await fetch(path);

  if (!response.ok) {
    throw new Error("Failed to load countries");
  }

  return response.json();
};

export const normalizeCountryName = (value: string): string => {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/&/g, " and ")
    .replace(/\bst\.?\b/g, "saint")
    .replace(/[.,'’()]/g, "")
    .replace(/[-_/]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
};
