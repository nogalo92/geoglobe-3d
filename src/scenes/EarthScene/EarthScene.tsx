import { type ArcRotateCamera } from "@babylonjs/core";
import { useIsMobile } from "@hooks/useIsMobile";
import { Scene, type SceneEventArgs } from "react-babylonjs";
import {
  AMBIENT_LIGHT_DEFAULTS,
  CAMERA_DEFAULTS,
  SCENE_DEFAULTS,
} from "./earth.config";
import {
  hexToLinearColor3,
  showInspector,
  toColor3,
  toColor4,
  toVector3,
} from "@globalUtils";

import type { Country } from "@globalTypes";

import { loadGameData, S_countries, startNewGame } from "@game";
import { S_sceneLoading } from "@globalSignals";
import { createEarth, renderCountryOutline } from "@earthUtils";
import { useEffect } from "react";
import { S_arcCamera, S_earthRoot } from "./signals/earth.signals";

function EarthScene() {
  useEffect(() => {
    loadGameData().then(() => {
      startNewGame();
    });
  }, []);

  const isMobile = useIsMobile(768);
  const isInspectorOn = import.meta.env.VITE_INSPECTOR === "on";

  const setupScene = async ({ scene }: SceneEventArgs) => {
    scene.clearColor = toColor4(SCENE_DEFAULTS.CLEAR);

    const earthRoot = createEarth(scene);
    S_earthRoot.value = earthRoot;

    scene.onReadyObservable.add(async () => {
      S_countries.value.forEach((country: Country) => {
        renderCountryOutline(country.feature, scene, earthRoot);
      });

      if (isInspectorOn) {
        await showInspector(scene);
      }
      S_sceneLoading.value = false;
    });
  };

  const setupCamera = (camera: ArcRotateCamera) => {
    S_arcCamera.value = camera;
  };

  return (
    <Scene
      onSceneMount={(scene: SceneEventArgs) => {
        setupScene(scene);
      }}
    >
      <arcRotateCamera
        name={CAMERA_DEFAULTS.NAME}
        alpha={CAMERA_DEFAULTS.ALPHA}
        beta={CAMERA_DEFAULTS.BETA}
        radius={
          isMobile
            ? CAMERA_DEFAULTS.RADIUS_MOBILE
            : CAMERA_DEFAULTS.RADIUS_DESKTOP
        }
        lowerRadiusLimit={
          isMobile
            ? CAMERA_DEFAULTS.LOWER_RADIUS_LIMIT_MOBILE
            : CAMERA_DEFAULTS.LOWER_RADIUS_LIMIT_DESKTOP
        }
        upperRadiusLimit={
          isMobile
            ? CAMERA_DEFAULTS.UPPER_RADIUS_LIMIT_MOBILE
            : CAMERA_DEFAULTS.UPPER_RADIUS_LIMIT_DESKTOP
        }
        target={toVector3(CAMERA_DEFAULTS.TARGET)}
        minZ={CAMERA_DEFAULTS.MIN_Z}
        // wheelPrecision={CAMERA_DEFAULTS.PRECISION}
        // pinchPrecision={CAMERA_DEFAULTS.PRECISION}
        onCreated={(camera: ArcRotateCamera) => setupCamera(camera)}
      />
      <hemisphericLight
        name={AMBIENT_LIGHT_DEFAULTS.NAME}
        direction={toVector3(AMBIENT_LIGHT_DEFAULTS.DIRECTION)}
        specular={toColor3(AMBIENT_LIGHT_DEFAULTS.SPECULAR)}
        intensity={AMBIENT_LIGHT_DEFAULTS.INTENSITY}
        groundColor={hexToLinearColor3(AMBIENT_LIGHT_DEFAULTS.GROUND_COLOR)}
      />
    </Scene>
  );
}

export default EarthScene;
