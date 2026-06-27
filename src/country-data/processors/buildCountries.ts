/// <reference types="node" />
import type {
  CountriesGeoJson,
  CountryFeature,
  CountryProperties,
  CountryReviewItem,
  RawCountryGeoJson,
  RawCountryProperties,
} from "@countryTypes";
import { countryConfig } from "./countryConfig.ts";
import { optimizeGeometry } from "./optimizeGeometry.ts";

import fs from "node:fs";
import path from "node:path";

const ROOT_DIR = process.cwd();

const INPUT_PATH = path.join(ROOT_DIR, "public/data/raw/raw-countries.geojson");

const TUVALU_INPUT_PATH = path.join(
  ROOT_DIR,
  "public/data/raw/raw-tuvalu.geojson",
);

const OUTPUT_PATH = path.join(
  ROOT_DIR,
  "public/data/processed/countries.geojson",
);

const REVIEW_OUTPUT_PATH = path.join(
  ROOT_DIR,
  "public/data/processed/country-review.json",
);

function readJsonFile<T>(filePath: string): T {
  const file = fs.readFileSync(filePath, "utf-8");
  return JSON.parse(file) as T;
}

function writeJsonFile(filePath: string, data: unknown): void {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), "utf-8");
}

const manualIso3ByName: Record<string, string> = {
  France: "FRA",
  Norway: "NOR",
  Kosovo: "XKX",
};

function getIso3(properties: RawCountryProperties): string | null {
  const iso3 =
    properties.ISO_A3 ??
    properties.ADM0_A3 ??
    properties.SOV_A3 ??
    properties.shapeISO;

  if (iso3 && iso3 !== "-99") {
    return iso3;
  }

  const name = getCountryName(properties);

  return manualIso3ByName[name] ?? null;
}

function getIso2(properties: RawCountryProperties): string | undefined {
  if (!properties.ISO_A2 || properties.ISO_A2 === "-99") {
    return undefined;
  }

  return properties.ISO_A2;
}

function getCountryName(properties: RawCountryProperties): string {
  return (
    properties.NAME_LONG ?? properties.NAME ?? properties.shapeName ?? "Unknown"
  );
}

function uniqueStrings(values: string[]): string[] {
  return Array.from(new Set(values));
}

function buildCountries(): void {
  // const skippedCountries: string[] = [];

  const baseGeoJson = readJsonFile<RawCountryGeoJson>(INPUT_PATH);
  const tuvaluGeoJson = readJsonFile<RawCountryGeoJson>(TUVALU_INPUT_PATH);

  const rawGeoJson: RawCountryGeoJson = {
    type: "FeatureCollection",
    features: [...baseGeoJson.features, ...tuvaluGeoJson.features],
  };

  const countryFeatures: CountryFeature[] = [];

  for (const feature of rawGeoJson.features) {
    if (!feature.geometry) {
      // skippedCountries.push(
      //   `No geometry: ${getCountryName(feature.properties)}`,
      // );
      continue;
    }

    const iso3 = getIso3(feature.properties);

    if (!iso3) {
      // skippedCountries.push(`No ISO3: ${getCountryName(feature.properties)}`);
      continue;
    }

    const override = countryConfig[iso3];

    if (override?.exclude) {
      // skippedCountries.push(
      //   `Excluded: ${iso3} ${getCountryName(feature.properties)}`,
      // );
      continue;
    }

    const name = getCountryName(feature.properties);
    const displayName = override?.displayName ?? name;

    const aliases = uniqueStrings([
      displayName,
      name,
      ...(override?.aliases ?? []),
    ]);

    const optimizedGeometry = optimizeGeometry(feature, {
      minPolygonAreaRatio: override?.minPolygonAreaRatio,
      simplificationTolerance: override?.simplificationTolerance,
    });

    const processedCountryProperties: CountryProperties = {
      index: -1,
      id: iso3,
      iso2: getIso2(feature.properties),
      displayName,
      dataName: name,
      playable: override?.playable ?? true,
      aliases,
      focusPoint: override?.focusPoint ?? null,
      centroid: optimizedGeometry.centroid,
      bounds: optimizedGeometry.bounds,
      areaKm2: optimizedGeometry.areaKm2,
    };

    countryFeatures.push({
      type: "Feature",
      properties: processedCountryProperties,
      geometry: optimizedGeometry.geometry,
    });

    // console.log("Skipped countries:");
    // console.table(skippedCountries);
  }

  countryFeatures.sort((a, b) =>
    a.properties.id.localeCompare(b.properties.id),
  );

  countryFeatures.forEach((feature, index) => {
    feature.properties.index = index;
  });

  const countryReview: CountryReviewItem[] = countryFeatures
    .map((feature) => ({
      id: feature.properties.id,
      index: feature.properties.index,
      displayName: feature.properties.displayName,
      dataName: feature.properties.dataName,
      iso2: feature.properties.iso2,
      playable: feature.properties.playable,
      areaKm2: feature.properties.areaKm2,
      bounds: feature.properties.bounds,
      aliases: feature.properties.aliases,
    }))
    .sort((a, b) => a.areaKm2 - b.areaKm2);

  const processedGeoJson: CountriesGeoJson = {
    type: "FeatureCollection",
    features: countryFeatures,
  };

  writeJsonFile(OUTPUT_PATH, processedGeoJson);
  writeJsonFile(REVIEW_OUTPUT_PATH, countryReview);

  console.log(`Generated ${countryFeatures.length} country features`);
  console.log(`Saved to: ${OUTPUT_PATH}`);
  console.log(`Saved review to: ${REVIEW_OUTPUT_PATH}`);
}

buildCountries();
