import {
  Color3,
  Scene as BabylonScene,
  MeshBuilder,
  LinesMesh,
  TransformNode,
  CreateSphere,
  StandardMaterial,
  Texture,
  Quaternion,
  Vector3,
  Matrix,
} from "@babylonjs/core";

import type { Country, CountryFeature, LonLat } from "@globalTypes";
import { latLonToVector3 } from "@globalUtils";
import { S_arcCamera, S_earthRoot } from "../signals/earth.signals";
import { animateRotationQuaternion } from "../animations/earth.animations";

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

const DEG_TO_RAD = Math.PI / 180;

export const getUprightGlobeRotation = (lat: number, lon: number) => {
  const yaw = lon * DEG_TO_RAD;

  const pitch = -lat * DEG_TO_RAD;

  return Quaternion.FromEulerAngles(
    pitch,
    yaw,
    0, // no roll
  );
};

const WORLD_UP = Vector3.Up();

export function getCountryFacingCameraUprightRotation(
  countryDirection: Vector3,
  cameraDirection: Vector3,
): Quaternion {
  const targetRotation = new Quaternion();

  Quaternion.FromUnitVectorsToRef(
    countryDirection.normalize(),
    cameraDirection.normalize(),
    targetRotation,
  );

  const rotatedNorth = Vector3.TransformCoordinates(
    WORLD_UP,
    MatrixFromQuaternion(targetRotation),
  ).normalize();

  const projectedNorth = projectOnPlane(
    rotatedNorth,
    cameraDirection,
  ).normalize();

  const projectedWorldUp = projectOnPlane(
    WORLD_UP,
    cameraDirection,
  ).normalize();

  const rollAngle = signedAngleAroundAxis(
    projectedNorth,
    projectedWorldUp,
    cameraDirection,
  );

  const rollCorrection = Quaternion.RotationAxis(cameraDirection, rollAngle);

  return rollCorrection.multiply(targetRotation).normalize();
}

function projectOnPlane(vector: Vector3, planeNormal: Vector3) {
  const normal = planeNormal.normalize();
  return vector.subtract(normal.scale(Vector3.Dot(vector, normal)));
}

function signedAngleAroundAxis(from: Vector3, to: Vector3, axis: Vector3) {
  const cross = Vector3.Cross(from, to);
  const sin = Vector3.Dot(cross, axis);
  const cos = Vector3.Dot(from, to);

  return Math.atan2(sin, cos);
}

function MatrixFromQuaternion(q: Quaternion) {
  const matrix = new Matrix();
  q.toRotationMatrix(matrix);
  return matrix;
}

export const rotateToCountry = (country: Country) => {
  const earthRoot = S_earthRoot.value;
  const camera = S_arcCamera.value;

  if (!earthRoot || !camera) return;

  const countryDirection = latLonToVector3(
    country.center.lat,
    country.center.lon,
    1,
  ).normalize();

  const cameraDirection = camera.position.normalize();

  const targetRotation = getCountryFacingCameraUprightRotation(
    countryDirection,
    cameraDirection,
  );

  const fromRotation =
    earthRoot.rotationQuaternion?.clone() ??
    Quaternion.FromEulerVector(earthRoot.rotation);

  animateRotationQuaternion(earthRoot, fromRotation, targetRotation, {
    name: "rotate-to-country",
    durationFrames: 45,
  });
};
