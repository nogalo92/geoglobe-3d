import {
  Color3,
  Mesh,
  MeshBuilder,
  Scene,
  StandardMaterial,
  TransformNode,
} from "@babylonjs/core";

export class EarthManager {
  private scene: Scene;
  private root: TransformNode;

  private atmosphere?: Mesh;
  private atmosphereMaterial?: StandardMaterial;

  private atmospherePulse = 0;

  private readonly earthRadius: number;

  constructor(scene: Scene, root: TransformNode, earthRadius: number) {
    this.scene = scene;
    this.root = root;
    this.earthRadius = earthRadius;
  }

  build(): void {
    this.createAtmosphere();
  }

  pulseAtmosphere(): void {
    this.atmospherePulse = 1;
  }

  private createAtmosphere(): void {
    this.atmosphere = MeshBuilder.CreateSphere(
      "earth-atmosphere",
      {
        diameter: this.earthRadius * 2 + 0.45,
        segments: 96,
      },
      this.scene,
    );

    this.atmosphere.parent = this.root;
    this.atmosphere.isPickable = false;

    const mat = new StandardMaterial("earth-atmosphere-mat", this.scene);

    mat.diffuseColor = Color3.FromHexString("#62dfff");
    mat.emissiveColor = Color3.FromHexString("#62dfff");
    mat.alpha = 0.045;
    mat.backFaceCulling = false;
    mat.disableLighting = true;
    mat.needDepthPrePass = true;

    this.atmosphere.material = mat;
    this.atmosphereMaterial = mat;
  }

  update(dt: number): void {
    this.updateAtmosphere(dt);
  }

  private updateAtmosphere(dt: number): void {
    this.atmospherePulse = this.damp(this.atmospherePulse, 0, 3.5, dt);

    if (!this.atmosphereMaterial) return;

    const color = Color3.FromHexString("#62dfff");
    const pulse = this.atmospherePulse;

    this.atmosphereMaterial.alpha = 0.035 + pulse * 0.18;
    this.atmosphereMaterial.emissiveColor = color.scale(0.8 + pulse * 2.5);
  }

  private damp(
    current: number,
    target: number,
    speed: number,
    dt: number,
  ): number {
    return current + (target - current) * (1 - Math.exp(-speed * dt));
  }

  dispose(): void {
    this.atmosphere?.dispose();
  }
}
