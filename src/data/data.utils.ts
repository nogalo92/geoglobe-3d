import type { CountriesGeoJson } from "@globalTypes";
import type { Country, CountryFeature } from "@globalTypes";

export const loadCountries = async (
  path: string,
): Promise<CountriesGeoJson> => {
  const response = await fetch(path);

  if (!response.ok) {
    throw new Error("Failed to load countries");
  }

  return response.json();
};

function createCountryId(name: string) {
  return name.toLowerCase().replaceAll(" ", "-");
}

export const normalizeCountries = (features: CountryFeature[]): Country[] => {
  return features.map((feature) => {
    const name =
      feature.properties.NAME ?? feature.properties.ADMIN ?? "Unknown";

    return {
      id: createCountryId(name),
      name,
      feature,
      center: {
        lon: Number(feature.properties.LABEL_X ?? 0),
        lat: Number(feature.properties.LABEL_Y ?? 0),
      },
    };
  });
};
