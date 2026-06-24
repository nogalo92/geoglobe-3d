import type { CountriesGeoJson } from "@globalTypes";
import type { Country, CountryFeature } from "@globalTypes";
import { pointOnFeature } from "@turf/turf";

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
    const name = String(
      feature.properties.NAME ?? feature.properties.ADMIN ?? "Unknown",
    );

    const centerPoint = pointOnFeature(feature);

    const [lon, lat] = centerPoint.geometry.coordinates;

    return {
      id: createCountryId(name),
      name,
      feature,
      center: {
        lon,
        lat,
      },
    };
  });
};
