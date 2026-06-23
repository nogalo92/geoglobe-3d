import {
  MeshBuilder,
  StandardMaterial,
  Texture,
  type ArcRotateCamera,
} from "@babylonjs/core";
import { useIsMobile } from "@hooks/useIsMobile";
import { Scene, type SceneEventArgs } from "react-babylonjs";
import {
  AMBIENT_LIGHT_DEFAULTS,
  CAMERA_DEFAULTS,
  SCENE_DEFAULTS,
} from "./globe.config";
import {
  hexToLinearColor3,
  loadCountries,
  renderCountryOutline,
  showInspector,
  toColor3,
  toColor4,
  toVector3,
} from "@utils/utils";
import { isSceneLoading } from "../../signals/signals";

function GlobeScene() {
  const isMobile = useIsMobile(768);
  const isInspectorOn = import.meta.env.VITE_INSPECTOR === "on";

  const setupScene = async ({ scene }: SceneEventArgs) => {
    scene.clearColor = toColor4(SCENE_DEFAULTS.CLEAR);

    const earth = MeshBuilder.CreateSphere(
      "Earth",
      { diameter: 10, segments: 64 },
      scene,
    );

    earth.rotation.y = Math.PI;

    const earthMaterial = new StandardMaterial("M_Earth", scene);
    const earthTexture = new Texture(
      "/assets/textures/earth_day_8k.jpg",
    ) as Texture;

    earthTexture.wAng = Math.PI;
    earthTexture.vAng = 0.456;
    earthMaterial.diffuseTexture = earthTexture;

    earth.material = earthMaterial;

    const countries = await loadCountries(
      "/assets/geodata/ne_50mcountries.json",
    );

    const bosnia = countries.features.find(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (feature: any) =>
        feature.properties.NAME === "Philippines" ||
        feature.properties.ADMIN === "Philippines",
    );

    if (bosnia) {
      renderCountryOutline(bosnia, scene);
    } else {
      console.warn("Bosnia not found");
    }

    scene.onReadyObservable.add(async () => {
      if (isInspectorOn) {
        await showInspector(scene);
      }

      isSceneLoading.value = false;
    });
  };

  const setupCamera = (camera: ArcRotateCamera) => {
    console.log(camera);
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
        wheelPrecision={CAMERA_DEFAULTS.PRECISION}
        pinchPrecision={CAMERA_DEFAULTS.PRECISION}
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

export default GlobeScene;
