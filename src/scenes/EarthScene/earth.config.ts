import type {
  AmbientLightConfig,
  ArcRotateCameraConfig,
  SceneConfig,
} from "@globalTypes";

export const SCENE_DEFAULTS: SceneConfig = {
  CLEAR: [0, 0, 0, 1],
};

export const CAMERA_DEFAULTS: ArcRotateCameraConfig = {
  NAME: "arcRotateCamera",
  ALPHA: (3 * Math.PI) / 4,
  BETA: Math.PI / 3 + 0.2,
  RADIUS_DESKTOP: 20,
  RADIUS_MOBILE: 12,
  LOWER_RADIUS_LIMIT_DESKTOP: 0,
  LOWER_RADIUS_LIMIT_MOBILE: 5,
  UPPER_RADIUS_LIMIT_DESKTOP: 25,
  UPPER_RADIUS_LIMIT_MOBILE: 18,
  TARGET: [0, 0, 0],
  MIN_Z: 0.2,
  PRECISION: 10,
};

export const AMBIENT_LIGHT_DEFAULTS: AmbientLightConfig = {
  NAME: "ambientLight",
  DIRECTION: [0.5, 1, 0.5],
  SPECULAR: [0, 0, 0],
  INTENSITY: 1,
  GROUND_COLOR: "#B8B8B8",
};
