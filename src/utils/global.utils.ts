import {
  Color3,
  Color4,
  Vector3,
  Scene as BabylonScene,
} from "@babylonjs/core";

export type Vec2Tuple = [number, number];
export type Vec3Tuple = [number, number, number];
export type Vec4Tuple = [number, number, number, number];

export function toVector3(value: Vec3Tuple) {
  return new Vector3(value[0], value[1], value[2]);
}

export function toColor3(value: Vec3Tuple) {
  return new Color3(value[0], value[1], value[2]);
}

export function toColor4(value: Vec4Tuple) {
  return new Color4(value[0], value[1], value[2], value[3]);
}

export function hexToLinearColor3(value: string) {
  return Color3.FromHexString(value).toLinearSpace();
}

export const latLonToVector3 = (lat: number, lon: number, radius: number) => {
  const latRad = (lat * Math.PI) / 180;
  const lonRad = (lon * Math.PI) / 180;

  const x = -radius * Math.cos(latRad) * Math.sin(lonRad);
  const y = radius * Math.sin(latRad);
  const z = radius * Math.cos(latRad) * Math.cos(lonRad);

  return new Vector3(x, y, z);
};

export const showInspector = async (scene: BabylonScene) => {
  try {
    await import("@babylonjs/core/Debug/debugLayer");
    await import("@babylonjs/inspector");

    await scene.debugLayer.show({
      embedMode: true,
    });
  } catch (error) {
    console.error("Failed to show inspector:", error);
  }
};
