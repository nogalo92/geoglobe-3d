import type {
  Color3,
  LinesMesh,
  Mesh,
  StandardMaterial,
  TransformNode,
  Vector3,
} from "@babylonjs/core";
import type { Feature, MultiPolygon, Polygon } from "geojson";

export type CountryId = string;
export type Position = [longitude: number, latitude: number];

export type Bounds = [
  minLongitude: number,
  minLatitude: number,
  maxLongitude: number,
  maxLatitude: number,
];

export type CountryGeometry = Polygon | MultiPolygon;

export type RawCountryProperties = {
  ISO_A2?: string;
  ISO_A3?: string;
  ADM0_A3?: string;
  SOV_A3?: string;
  NAME?: string;
  NAME_LONG?: string;
  ADMIN?: string;
  SOVEREIGNT?: string;
  shapeISO?: string;
  shapeName?: string;
};

export type RawCountryFeature = Feature<
  Polygon | MultiPolygon,
  RawCountryProperties
>;

export type RawCountryGeoJson = {
  type: "FeatureCollection";
  features: RawCountryFeature[];
};

export type CountryProperties = {
  id: CountryId;
  iso2?: string;
  displayName: string;
  dataName: string;
  playable: boolean;
  aliases: string[];
  focusPoint: Position | null;
  centroid: Position;
  bounds: Bounds;
  areaKm2: number;
  index: number;
};

export type CountryFeature = Feature<CountryGeometry, CountryProperties>;

export type CountriesGeoJson = {
  type: "FeatureCollection";
  features: CountryFeature[];
};

export type CountryOverride = {
  displayName?: string;
  playable?: boolean;
  aliases?: string[];
  focusPoint?: Position;
  exclude?: boolean;
  minPolygonAreaRatio?: number;
  simplificationTolerance?: number;
};

export type OptimizedGeometryData = {
  geometry: CountryGeometry;
  centroid: Position;
  bounds: Bounds;
  areaKm2: number;
};

export type OptimizeGeometryOptions = {
  minPolygonAreaRatio?: number;
  simplificationTolerance?: number;
};

export type CountryReviewItem = {
  id: string;
  displayName: string;
  dataName: string;
  iso2?: string;
  playable: boolean;
  areaKm2: number;
  bounds: CountryProperties["bounds"];
  aliases: string[];
};

export type CountryVisualState = {
  id: string;
  root: TransformNode;

  fillMesh?: Mesh;
  markerMesh?: Mesh;
  outlineMesh?: LinesMesh;

  fillMaterial?: StandardMaterial;
  markerMaterial?: StandardMaterial;

  isGuessed: boolean;

  fillAlpha: number;
  targetFillAlpha: number;

  fillColor: Color3;
  targetFillColor: Color3;

  outlineAlpha: number;
  targetOutlineAlpha: number;

  outlineColor: Color3;
  targetOutlineColor: Color3;

  pulseProgress: number;

  lift: number;
  targetLift: number;
  liftNormal: Vector3;
};
