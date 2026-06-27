import type { Vec3Tuple, Vec4Tuple } from "@globalUtils";

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
  PANNING: number;
};

export type AmbientLightConfig = {
  NAME: string;
  DIRECTION: Vec3Tuple;
  SPECULAR: Vec3Tuple;
  INTENSITY: number;
  GROUND_COLOR: string;
};
