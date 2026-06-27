import type {
  Bounds,
  CountryGeometry,
  OptimizedGeometryData,
  OptimizeGeometryOptions,
  Position,
  RawCountryFeature,
} from "@countryTypes";
import { area, bbox, centroid, simplify } from "@turf/turf";
import type { Position as GeoJsonPosition } from "geojson";

const DEFAULT_SIMPLIFICATION_TOLERANCE = 0.01;
const GEOMETRY_DECIMALS = 4;
const MIN_POLYGON_AREA_RATIO = 0.005;

function roundNumber(value: number, decimals = 6): number {
  return Number(value.toFixed(decimals));
}

function roundPosition(position: Position, decimals = 6): Position {
  return [
    roundNumber(position[0], decimals),
    roundNumber(position[1], decimals),
  ];
}

function roundGeoJsonPosition(
  position: GeoJsonPosition,
  decimals = 5,
): GeoJsonPosition {
  return [
    roundNumber(position[0], decimals),
    roundNumber(position[1], decimals),
  ];
}

function roundBounds(bounds: Bounds, decimals = 6): Bounds {
  return [
    roundNumber(bounds[0], decimals),
    roundNumber(bounds[1], decimals),
    roundNumber(bounds[2], decimals),
    roundNumber(bounds[3], decimals),
  ];
}

function roundGeometryCoordinates(geometry: CountryGeometry): CountryGeometry {
  if (geometry.type === "Polygon") {
    return {
      type: "Polygon",
      coordinates: geometry.coordinates.map((ring) =>
        ring.map((position) =>
          roundGeoJsonPosition(position, GEOMETRY_DECIMALS),
        ),
      ),
    };
  }

  return {
    type: "MultiPolygon",
    coordinates: geometry.coordinates.map((polygon) =>
      polygon.map((ring) =>
        ring.map((position) =>
          roundGeoJsonPosition(position, GEOMETRY_DECIMALS),
        ),
      ),
    ),
  };
}

function simplifyCountryFeature(
  feature: RawCountryFeature,
  tolerance: number,
): RawCountryFeature {
  return simplify(feature, {
    tolerance,
    highQuality: true,
    mutate: false,
  }) as RawCountryFeature;
}

function getGeometryCentroid(feature: RawCountryFeature): Position {
  const result = centroid(feature);
  return result.geometry.coordinates as Position;
}

function getGeometryBounds(feature: RawCountryFeature): Bounds {
  const result = bbox(feature);

  return [result[0], result[1], result[2], result[3]];
}

function getGeometryAreaKm2(feature: RawCountryFeature): number {
  return area(feature) / 1_000_000;
}

function getSinglePolygonAreaKm2(coordinates: GeoJsonPosition[][]): number {
  const polygonFeature: RawCountryFeature = {
    type: "Feature",
    properties: {},
    geometry: {
      type: "Polygon",
      coordinates,
    },
  } as RawCountryFeature;

  return area(polygonFeature) / 1_000_000;
}

function removeTinyPolygons(
  geometry: CountryGeometry,
  minPolygonAreaRatio: number,
): CountryGeometry {
  if (geometry.type === "Polygon") {
    return geometry;
  }

  const polygonAreas = geometry.coordinates.map((polygon) => ({
    polygon,
    areaKm2: getSinglePolygonAreaKm2(polygon),
  }));

  const totalAreaKm2 = polygonAreas.reduce(
    (sum, item) => sum + item.areaKm2,
    0,
  );

  const minAreaKm2 = totalAreaKm2 * minPolygonAreaRatio;

  const keptPolygons = polygonAreas
    .filter((item) => item.areaKm2 >= minAreaKm2)
    .map((item) => item.polygon);

  return {
    type: "MultiPolygon",
    coordinates:
      keptPolygons.length > 0 ? keptPolygons : [polygonAreas[0].polygon],
  };
}

export function optimizeGeometry(
  feature: RawCountryFeature,
  options: OptimizeGeometryOptions = {},
): OptimizedGeometryData {
  const minPolygonAreaRatio =
    options.minPolygonAreaRatio ?? MIN_POLYGON_AREA_RATIO;

  const tolerance =
    options.simplificationTolerance ?? DEFAULT_SIMPLIFICATION_TOLERANCE;

  const geometryWithoutTinyPolygons = removeTinyPolygons(
    feature.geometry,
    minPolygonAreaRatio,
  );

  const cleanupFeature: RawCountryFeature = {
    type: "Feature",
    properties: feature.properties,
    geometry: geometryWithoutTinyPolygons,
  };

  const simplifiedFeature = simplifyCountryFeature(cleanupFeature, tolerance);
  const geometry = roundGeometryCoordinates(simplifiedFeature.geometry);

  const processedFeature: RawCountryFeature = {
    type: "Feature",
    properties: feature.properties,
    geometry,
  };

  return {
    geometry,
    centroid: roundPosition(getGeometryCentroid(processedFeature)),
    bounds: roundBounds(getGeometryBounds(processedFeature)),
    areaKm2: roundNumber(getGeometryAreaKm2(processedFeature), 2),
  };
}
