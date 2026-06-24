import type {
  Feature,
  FeatureCollection,
  MultiPolygon,
  Polygon,
} from "geojson";

export type Vec3Tuple = [number, number, number];
export type Vec4Tuple = [number, number, number, number];
export type LonLat = [number, number];

export type SceneConfig = {
  CLEAR: Vec4Tuple;
};

export type ArcRotateCameraConfig = {
  NAME: string;
  ALPHA: number;
  BETA: number;
  RADIUS_DESKTOP: number;
  RADIUS_MOBILE: number;
  LOWER_RADIUS_LIMIT_DESKTOP: number;
  LOWER_RADIUS_LIMIT_MOBILE: number;
  UPPER_RADIUS_LIMIT_DESKTOP: number;
  UPPER_RADIUS_LIMIT_MOBILE: number;
  TARGET: Vec3Tuple;
  MIN_Z: number;
  PRECISION: number;
};

export type AmbientLightConfig = {
  NAME: string;
  DIRECTION: Vec3Tuple;
  SPECULAR: Vec3Tuple;
  INTENSITY: number;
  GROUND_COLOR: string;
};

export type CountriesGeoJson = FeatureCollection<
  Polygon | MultiPolygon,
  CountryProperties
>;

export type CountryFeature = Feature<Polygon | MultiPolygon, CountryProperties>;

export type Country = {
  id: string;
  name: string;
  feature: CountryFeature;
  center: {
    lon: number;
    lat: number;
  };
};

export type CountryProperties = {
  NAME?: string;
  ADMIN?: string;
  LABEL_X?: number | string;
  LABEL_Y?: number | string;
  [key: string]: unknown;
};
