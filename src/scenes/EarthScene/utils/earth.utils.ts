import {
  Color3,
  Scene as BabylonScene,
  MeshBuilder,
  LinesMesh,
  TransformNode,
  CreateSphere,
  StandardMaterial,
  Texture,
} from "@babylonjs/core";

import type { CountryFeature, LonLat } from "@globalTypes";
import { latLonToVector3 } from "@globalUtils";

export const createEarth = (scene: BabylonScene): TransformNode => {
  const earth = CreateSphere("Earth", { diameter: 10, segments: 128 }, scene);
  earth.rotation.y = Math.PI / 2;

  const earthMaterial = new StandardMaterial("M_Earth", scene);

  const earthTexture = new Texture(
    "/assets/textures/earth_day_8k.jpg",
  ) as Texture;
  earthTexture.wAng = Math.PI;

  earthMaterial.diffuseTexture = earthTexture;
  earth.material = earthMaterial;

  const earthRoot = new TransformNode("EarthRoot", scene);
  earth.parent = earthRoot;

  return earthRoot;
};

export const addCountryMarker = (
  name: string,
  lat: number,
  lon: number,
  scene: BabylonScene,
) => {
  const marker = MeshBuilder.CreateSphere(name, { diameter: 0.15 }, scene);

  marker.position = latLonToVector3(lat, lon, 5.15);
  return marker;
};

const COUNTRY_RADIUS = 5;

const renderRing = (
  ring: LonLat[],
  scene: BabylonScene,
  name: string,
  parent?: TransformNode,
): LinesMesh => {
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

  if (parent) {
    line.parent = parent;
  }

  return line;
};

export const renderCountryOutline = (
  feature: CountryFeature,
  scene: BabylonScene,
  parent?: TransformNode,
) => {
  const { geometry } = feature;
  const countryName = String(
    feature.properties.NAME ?? feature.properties.ADMIN ?? "country",
  );

  if (geometry.type === "Polygon") {
    const rings = geometry.coordinates as LonLat[][];

    rings.forEach((ring, ringIndex) => {
      renderRing(ring, scene, `${countryName}-ring-${ringIndex}`, parent);
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
          parent,
        );
      });
    });
  }
};
