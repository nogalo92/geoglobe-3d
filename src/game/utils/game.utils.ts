import { loadCountriesData } from "@countryUtils";
import type { CountriesGeoJson, CountryFeature } from "@countryTypes";
import { toRadians } from "@globalUtils";

export async function loadGameData(): Promise<CountriesGeoJson> {
  return loadCountriesData("/data/processed/countries.geojson");
}

export const getDistanceKm = (
  a: [number, number],
  b: [number, number],
): number => {
  const earthRadiusKm = 6371;

  const [lon1, lat1] = a;
  const [lon2, lat2] = b;

  const dLat = toRadians(lat2 - lat1);
  const dLon = toRadians(lon2 - lon1);

  const rLat1 = toRadians(lat1);
  const rLat2 = toRadians(lat2);

  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(rLat1) * Math.cos(rLat2) * Math.sin(dLon / 2) ** 2;

  return Math.round(
    earthRadiusKm * 2 * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h)),
  );
};

export const getCountryDistanceKm = (
  a: CountryFeature,
  b: CountryFeature,
): number => {
  return getDistanceKm(a.properties.centroid, b.properties.centroid);
};

const MAX_WORLD_DISTANCE_KM = 20037;
export function getDistanceRatio(distanceKm: number): number {
  return Math.min(distanceKm / MAX_WORLD_DISTANCE_KM, 1);
}
