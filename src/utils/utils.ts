import {
  Color3,
  Color4,
  Vector3,
  Scene as BabylonScene,
  MeshBuilder,
  LinesMesh,
} from "@babylonjs/core";
import type { Vec3Tuple, Vec4Tuple } from "@customTypes/types";

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

export function latLonToVector3(lat: number, lon: number, radius: number) {
  const latRad = (lat * Math.PI) / 180;
  const lonRad = (lon * Math.PI) / 180;

  const x = -radius * Math.cos(latRad) * Math.sin(lonRad);
  const y = radius * Math.sin(latRad);
  const z = radius * Math.cos(latRad) * Math.cos(lonRad);

  return new Vector3(x, y, z);
}

export function addMarker(
  name: string,
  lat: number,
  lon: number,
  scene: BabylonScene,
) {
  const marker = MeshBuilder.CreateSphere(name, { diameter: 0.15 }, scene);

  marker.position = latLonToVector3(lat, lon, 5.15);
  return marker;
}

export const loadCountries = async (path: string) => {
  const response = await fetch(path);

  if (!response.ok) {
    throw new Error("Failed to load countries");
  }

  return response.json();
};

type LonLat = [number, number];

type CountryFeature = {
  type: "Feature";
  properties: Record<string, unknown>;
  geometry: {
    type: "Polygon" | "MultiPolygon";
    coordinates: unknown;
  };
};

const COUNTRY_RADIUS = 5.02;

function renderRing(
  ring: LonLat[],
  scene: BabylonScene,
  name: string,
): LinesMesh {
  const points = ring.map(([lon, lat]) =>
    latLonToVector3(lat, lon, COUNTRY_RADIUS),
  );

  const line = MeshBuilder.CreateLines(
    name,
    {
      points,
    },
    scene,
  );

  line.color = Color3.Green();

  return line;
}

export function renderCountryOutline(
  feature: CountryFeature,
  scene: BabylonScene,
) {
  const { geometry } = feature;
  const countryName = String(
    feature.properties.NAME ?? feature.properties.ADMIN ?? "country",
  );

  if (geometry.type === "Polygon") {
    const rings = geometry.coordinates as LonLat[][];

    rings.forEach((ring, ringIndex) => {
      renderRing(ring, scene, `${countryName}-ring-${ringIndex}`);
    });

    return;
  }

  if (geometry.type === "MultiPolygon") {
    const polygons = geometry.coordinates as LonLat[][][];

    polygons.forEach((polygon, polygonIndex) => {
      polygon.forEach((ring, ringIndex) => {
        renderRing(
          ring,
          scene,
          `${countryName}-polygon-${polygonIndex}-ring-${ringIndex}`,
        );
      });
    });
  }
}
