import type { Nullable, Observer, Scene } from "@babylonjs/core";
import type { EarthManager } from "@earthManagers";
import type { CountryRenderer } from "@countryRenderer";

export class GameLoop {
  private scene: Scene;
  private earthManager: EarthManager;
  private countryRenderer: CountryRenderer;

  private observer: Nullable<Observer<Scene>> = null;

  constructor(
    scene: Scene,
    earthManager: EarthManager,
    countryRenderer: CountryRenderer,
  ) {
    this.scene = scene;
    this.earthManager = earthManager;
    this.countryRenderer = countryRenderer;
  }

  start(): void {
    if (this.observer) return;

    this.observer = this.scene.onBeforeRenderObservable.add(() => {
      const dt = Math.min(this.scene.getEngine().getDeltaTime() / 1000, 0.05);

      this.update(dt);
    });
  }

  private update(dt: number): void {
    this.earthManager.update(dt);
    this.countryRenderer.update(dt);
  }

  dispose(): void {
    if (!this.observer) return;

    this.scene.onBeforeRenderObservable.remove(this.observer);
    this.observer = null;
  }
}
