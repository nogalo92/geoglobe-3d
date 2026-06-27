import {
  Color3,
  LinesMesh,
  MeshBuilder,
  Scene,
  TransformNode,
} from "@babylonjs/core";
import type { CountryFeature, CountryGeometry } from "@countryTypes";

import type { CountryManager } from "../managers/countryManager";
import type { Position } from "geojson";
import { latLonToVector3 } from "@globalUtils";

export class CountryRenderer {
  private scene: Scene;
  private countryManager: CountryManager;

  private root: TransformNode;
  private countryRoots = new Map<string, TransformNode>();
  private attached = false;
  private built = false;
  private COUNTRY_RADIUS = 5.01;

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

    this.built = true;
  }
  private buildCountry(country: CountryFeature): void {
    const countryId = country.properties.id;

    const countryRoot = new TransformNode(`country-${countryId}`, this.scene);
    countryRoot.parent = this.root;

    this.countryRoots.set(countryId, countryRoot);

    this.buildCountryGeometry(country.geometry, countryRoot);
  }

  private buildCountryGeometry(
    geometry: CountryGeometry,
    parent: TransformNode,
  ) {
    if (geometry.type === "Polygon") {
      this.buildPolygon(geometry.coordinates, parent);
      return;
    }

    geometry.coordinates.forEach((polygon) => {
      this.buildPolygon(polygon, parent);
    });
  }

  private buildPolygon(polygon: Position[][], parent: TransformNode): void {
    polygon.forEach((boundary, boundaryIndex) => {
      this.buildPolygonOutline(boundary, `boundary-${boundaryIndex}`, parent);
    });
  }

  private buildPolygonOutline(
    coordinates: Position[],
    name: string,
    parent: TransformNode,
  ): LinesMesh {
    const points = coordinates.map(([lon, lat]) =>
      latLonToVector3(lat, lon, this.COUNTRY_RADIUS),
    );

    const outline = MeshBuilder.CreateLines(
      name,
      {
        points,
      },
      this.scene,
    );

    outline.color = Color3.Green();
    outline.parent = parent;

    return outline;
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
    this.root.dispose();
    this.countryRoots.clear();
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
