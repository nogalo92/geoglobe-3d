import {
  Color3,
  LinesMesh,
  Mesh,
  MeshBuilder,
  Observer,
  Scene,
  StandardMaterial,
  TransformNode,
  Vector3,
  VertexData,
  type Nullable,
} from "@babylonjs/core";
import type { CountryFeature, CountryGeometry } from "@countryTypes";

import type { CountryManager } from "@countryManagers";
import type { Position } from "geojson";
import { latLonToVector3 } from "@globalUtils";
import earcut from "earcut";
import type { CountryVisualState } from "@countryTypes";

export class CountryRenderer {
  private scene: Scene;
  private countryManager: CountryManager;

  private root: TransformNode;
  private countryRoots = new Map<string, TransformNode>();
  private countryOutlines = new Map<string, LinesMesh>();
  private countryVisuals = new Map<string, CountryVisualState>();

  private updateObserver: Nullable<Observer<Scene>> = null;
  private lastUpdateTime = 0;

  private atmosphereMaterial?: StandardMaterial;
  private atmospherePulse = 0;

  // private activeArc: Mesh | null = null;

  private readonly defaultOutlineColor = Color3.FromHexString("#6f8fa8");
  private readonly defaultFillColor = Color3.FromHexString("#ffffff");

  private attached = false;
  private built = false;

  private COUNTRY_RADIUS = 5.02;

  constructor(scene: Scene, countryManager: CountryManager) {
    this.scene = scene;
    this.countryManager = countryManager;
    this.root = new TransformNode("countries-root", scene);
  }

  build(): void {
    if (this.built) {
      throw new Error("CountryRenderer is already built.");
    }

    for (const country of this.countryManager.getAll()) {
      this.buildCountry(country);
    }

    this.createAtmosphere();

    this.startUpdateLoop();
    this.built = true;
  }

  // private getCountryPoint(
  //   country: CountryFeature,
  //   radiusOffset = 0.12,
  // ): Vector3 {
  //   const [lon, lat] =
  //     country.properties.focusPoint ?? country.properties.centroid;

  //   return latLonToVector3(lat, lon, this.COUNTRY_RADIUS + radiusOffset);
  // }

  // showDistanceArc(from: CountryFeature, to: CountryFeature): void {
  //   this.activeArc?.dispose();
  //   this.activeArc = null;

  //   const start = this.getCountryPoint(from, 0.12).normalize();
  //   const end = this.getCountryPoint(to, 0.12).normalize();

  //   const points: Vector3[] = [];
  //   const segments = 80;

  //   for (let i = 0; i <= segments; i++) {
  //     const t = i / segments;

  //     const direction = Vector3.Slerp(start, end, t).normalize();

  //     const arcLift = Math.sin(t * Math.PI) * 0.65;
  //     const radius = this.COUNTRY_RADIUS + 0.1 + arcLift;

  //     points.push(direction.scale(radius));
  //   }

  //   this.activeArc = MeshBuilder.CreateTube(
  //     "distance-arc",
  //     {
  //       path: points,
  //       radius: 0.015,
  //       tessellation: 8,
  //       updatable: false,
  //     },
  //     this.scene,
  //   );

  //   const mat = new StandardMaterial("distance-arc-mat", this.scene);
  //   mat.diffuseColor = Color3.White();
  //   mat.emissiveColor = Color3.FromHexString("#8defff");
  //   mat.alpha = 0.85;
  //   mat.disableLighting = true;

  //   this.activeArc.material = mat;
  //   this.activeArc.parent = this.root;
  // }

  private createAtmosphere(): void {
    const atmosphere = MeshBuilder.CreateSphere(
      "guess-atmosphere",
      {
        diameter: this.COUNTRY_RADIUS * 2 + 0.35,
        segments: 64,
      },
      this.scene,
    );

    atmosphere.parent = this.root;

    const mat = new StandardMaterial("guess-atmosphere-mat", this.scene);
    mat.diffuseColor = Color3.FromHexString("#62dfff");
    mat.emissiveColor = Color3.FromHexString("#62dfff");
    mat.alpha = 0.04;
    mat.backFaceCulling = false;
    mat.disableLighting = true;

    atmosphere.material = mat;

    this.atmosphereMaterial = mat;
  }

  private updateAtmosphere(dt: number): void {
    this.atmospherePulse = this.damp(this.atmospherePulse, 0, 3.5, dt);

    if (!this.atmosphereMaterial) return;

    const color = Color3.FromHexString("#62dfff");

    this.atmosphereMaterial.alpha = 0.035 + this.atmospherePulse * 0.13;
    this.atmosphereMaterial.emissiveColor = color.scale(
      0.8 + this.atmospherePulse * 2.5,
    );
  }

  private startUpdateLoop(): void {
    this.lastUpdateTime = performance.now();

    this.updateObserver = this.scene.onBeforeRenderObservable.add(() => {
      const now = performance.now();
      const dt = Math.min((now - this.lastUpdateTime) / 1000, 0.05);
      this.lastUpdateTime = now;

      this.update(dt);
    });
  }

  private update(dt: number): void {
    this.updateAtmosphere(dt);

    for (const visual of this.countryVisuals.values()) {
      this.updateCountryVisual(visual, dt);
    }
  }

  private updateCountryVisual(visual: CountryVisualState, dt: number): void {
    const speed = 8;

    visual.fillAlpha = this.damp(
      visual.fillAlpha,
      visual.targetFillAlpha,
      speed,
      dt,
    );

    visual.outlineAlpha = this.damp(
      visual.outlineAlpha,
      visual.targetOutlineAlpha,
      speed,
      dt,
    );

    visual.lift = this.damp(visual.lift, visual.targetLift, 6, dt);

    visual.fillColor = Color3.Lerp(
      visual.fillColor,
      visual.targetFillColor,
      1 - Math.exp(-speed * dt),
    );

    visual.outlineColor = Color3.Lerp(
      visual.outlineColor,
      visual.targetOutlineColor,
      1 - Math.exp(-speed * dt),
    );

    if (visual.pulseProgress > 0) {
      visual.pulseProgress = Math.max(visual.pulseProgress - dt, 0);
    }

    const pulseDuration = 0.65;
    const pulse =
      visual.pulseProgress > 0
        ? Math.sin(
            ((pulseDuration - visual.pulseProgress) / pulseDuration) * Math.PI,
          )
        : 0;

    if (visual.fillMaterial) {
      visual.fillMaterial.diffuseColor = visual.fillColor;
      visual.fillMaterial.emissiveColor = visual.fillColor.scale(
        0.15 + pulse * 0.25,
      );
      visual.fillMaterial.alpha = visual.fillAlpha;
    }

    if (visual.outlineMesh) {
      visual.outlineMesh.color = Color3.Lerp(
        visual.outlineColor,
        Color3.White(),
        pulse * 0.45,
      );

      visual.outlineMesh.alpha = Math.min(
        visual.outlineAlpha + pulse * 0.45,
        1,
      );
    }

    if (visual.markerMesh) {
      const scale = 1 + pulse * 1.4;
      visual.markerMesh.scaling.setAll(scale);
    }

    if (visual.markerMaterial) {
      visual.markerMaterial.diffuseColor = visual.fillColor;
      visual.markerMaterial.emissiveColor = visual.fillColor.scale(
        1.2 + pulse * 1.2,
      );
    }

    visual.root.position.copyFrom(visual.liftNormal.scale(visual.lift));
  }

  private damp(
    current: number,
    target: number,
    speed: number,
    dt: number,
  ): number {
    return current + (target - current) * (1 - Math.exp(-speed * dt));
  }

  private createCountryFillMesh(country: CountryFeature): Mesh {
    const mesh = new Mesh(`country-fill-${country.properties.id}`, this.scene);

    const positions: number[] = [];
    const indices: number[] = [];

    const addPolygon = (rings: Position[][]) => {
      const flat: number[] = [];
      const holes: number[] = [];
      const points3d: Vector3[] = [];

      if (this.crossesAntimeridian(rings)) return;

      rings.forEach((ring, ringIndex) => {
        if (ringIndex > 0) {
          holes.push(flat.length / 2);
        }

        ring.forEach(([lon, lat]) => {
          flat.push(lon, lat);
          points3d.push(latLonToVector3(lat, lon, this.COUNTRY_RADIUS + 0.003));
        });
      });

      const polygonIndices = earcut(flat, holes, 2);
      const vertexOffset = positions.length / 3;

      for (const point of points3d) {
        positions.push(point.x, point.y, point.z);
      }

      for (const index of polygonIndices) {
        indices.push(vertexOffset + index);
      }
    };

    if (country.geometry.type === "Polygon") {
      addPolygon(country.geometry.coordinates);
    } else {
      country.geometry.coordinates.forEach((polygon) => {
        addPolygon(polygon);
      });
    }

    const vertexData = new VertexData();
    vertexData.positions = positions;
    vertexData.indices = indices;

    vertexData.applyToMesh(mesh, true);

    mesh.alwaysSelectAsActiveMesh = true;

    return mesh;
  }

  private crossesAntimeridian(rings: Position[][]): boolean {
    return rings.some((ring) => {
      for (let i = 1; i < ring.length; i++) {
        if (Math.abs(ring[i][0] - ring[i - 1][0]) > 180) {
          return true;
        }
      }

      return false;
    });
  }

  private buildCountry(country: CountryFeature): void {
    const countryId = country.properties.id;

    const countryRoot = new TransformNode(`country-${countryId}`, this.scene);
    countryRoot.parent = this.root;

    this.countryRoots.set(countryId, countryRoot);

    const [lon, lat] =
      country.properties.focusPoint ?? country.properties.centroid;

    const liftNormal = latLonToVector3(lat, lon, 1).normalize();

    const fillMaterial = this.createFillMaterial(countryId);
    const fillMesh = this.createCountryFillMesh(country);
    fillMesh.parent = countryRoot;
    fillMesh.material = fillMaterial;

    const outline = this.buildCountryGeometry(country.geometry, countryRoot);
    outline.color = this.defaultOutlineColor;
    outline.alpha = 0.18;

    this.countryOutlines.set(countryId, outline);

    this.countryVisuals.set(countryId, {
      id: countryId,
      root: countryRoot,

      fillMesh,
      outlineMesh: outline,
      fillMaterial,

      isGuessed: false,

      fillAlpha: 0,
      targetFillAlpha: 0,

      fillColor: this.defaultFillColor.clone(),
      targetFillColor: this.defaultFillColor.clone(),

      outlineAlpha: 0.18,
      targetOutlineAlpha: 0.18,

      outlineColor: this.defaultOutlineColor.clone(),
      targetOutlineColor: this.defaultOutlineColor.clone(),

      lift: 0,
      targetLift: 0,
      liftNormal,
      pulseProgress: 0,
    });
  }

  private coordinatesToPoints(coordinates: Position[]): Vector3[] {
    return coordinates.map(([lon, lat]) =>
      latLonToVector3(lat, lon, this.COUNTRY_RADIUS),
    );
  }

  private createGuessMarker(
    visual: CountryVisualState,
    country: CountryFeature,
    color: Color3,
  ): Mesh {
    const countryId = country.properties.id;

    const [lon, lat] =
      country.properties.focusPoint ?? country.properties.centroid;

    const marker = MeshBuilder.CreateSphere(
      `country-marker-${countryId}`,
      {
        diameter: 0.075,
        segments: 16,
      },
      this.scene,
    );

    marker.position = latLonToVector3(lat, lon, this.COUNTRY_RADIUS + 0.13);

    const mat = new StandardMaterial(
      `country-marker-mat-${countryId}`,
      this.scene,
    );

    mat.diffuseColor = color;
    mat.emissiveColor = color.scale(1.8);
    mat.disableLighting = true;

    marker.material = mat;
    marker.parent = visual.root;

    visual.markerMaterial = mat;

    return marker;
  }

  private buildCountryGeometry(
    geometry: CountryGeometry,
    parent: TransformNode,
  ): LinesMesh {
    const lines: Vector3[][] = [];

    if (geometry.type === "Polygon") {
      geometry.coordinates.forEach((boundary) => {
        lines.push(this.coordinatesToPoints(boundary));
      });
    } else {
      geometry.coordinates.forEach((polygon) => {
        polygon.forEach((boundary) => {
          lines.push(this.coordinatesToPoints(boundary));
        });
      });
    }

    const outline = MeshBuilder.CreateLineSystem(
      "outline",
      { lines },
      this.scene,
    );

    outline.parent = parent;
    outline.alwaysSelectAsActiveMesh = true;

    return outline;
  }

  private getHeatColor(distanceRatio: number): Color3 {
    if (distanceRatio <= 0) {
      return Color3.FromHexString("#36ff6b");
    }

    if (distanceRatio < 0.1) {
      return Color3.FromHexString("#ffe66d");
    }

    if (distanceRatio < 0.35) {
      return Color3.FromHexString("#ff9f43");
    }

    return Color3.FromHexString("#ff4d4d");
  }

  private createFillMaterial(countryId: string): StandardMaterial {
    const mat = new StandardMaterial(
      `country-fill-mat-${countryId}`,
      this.scene,
    );

    mat.diffuseColor = this.defaultFillColor;
    mat.emissiveColor = Color3.Black();
    mat.alpha = 0;

    mat.backFaceCulling = false;
    mat.disableLighting = true;
    mat.useAlphaFromDiffuseTexture = false;

    return mat;
  }

  markGuess(country: CountryFeature, distanceRatio: number): void {
    const countryId = country.properties.id;
    const visual = this.countryVisuals.get(countryId);
    if (!visual) return;

    const color = this.getHeatColor(distanceRatio);

    visual.isGuessed = true;

    visual.targetFillColor = color;
    visual.targetFillAlpha = 0.45;

    visual.targetOutlineColor = color;
    visual.targetOutlineAlpha = 0.55;

    visual.targetLift = 0.035;
    visual.pulseProgress = 0.65;

    this.atmospherePulse = 1;

    if (!visual.markerMesh) {
      visual.markerMesh = this.createGuessMarker(visual, country, color);
    }
  }

  showCountry(id: string): void {
    this.countryRoots.get(id)?.setEnabled(true);
  }

  hideCountry(id: string): void {
    this.countryRoots.get(id)?.setEnabled(false);
  }

  setCountryEnabled(id: string, enabled: boolean): void {
    this.countryRoots.get(id)?.setEnabled(enabled);
  }

  getCountryRoot(id: string): TransformNode | undefined {
    return this.countryRoots.get(id);
  }

  dispose(): void {
    if (this.updateObserver) {
      this.scene.onBeforeRenderObservable.remove(this.updateObserver);
      this.updateObserver = null;
    }

    this.root.dispose();
    this.countryRoots.clear();
    this.countryOutlines.clear();
    this.countryVisuals.clear();
  }

  attachTo(root: TransformNode): void {
    if (this.attached) {
      throw new Error("CountryRenderer is already attached.");
    }

    this.root.parent = root;
    this.attached = true;
  }

  getRoot(): TransformNode {
    return this.root;
  }
}
