import type { Scene, TransformNode } from "@babylonjs/core";
import { CountryManager } from "@countryManagers";
import { CountryRenderer } from "../country-data/renderers/CountryRenderer";
import { EarthManager } from "@earthManagers";
import { GameManager } from "@gameManagers";
import { GameLoop } from "./GameLoop";
import { loadGameData } from "@gameUtils";
import {
  S_countryManager,
  S_countryRenderer,
  S_earthManager,
} from "@earthSignals";
import { S_gameManager } from "@gameSignals";
import type { CountriesGeoJson } from "@countryTypes";

export class Game {
  readonly scene: Scene;
  readonly earthRoot: TransformNode;

  private initialized = false;

  countryManager!: CountryManager;
  countryRenderer!: CountryRenderer;
  earthManager!: EarthManager;
  gameManager!: GameManager;
  gameLoop!: GameLoop;

  constructor(scene: Scene, earthRoot: TransformNode) {
    this.scene = scene;
    this.earthRoot = earthRoot;
  }

  async initialize(): Promise<void> {
    if (this.initialized) {
      throw new Error("Game is already initialized.");
    }

    const countryGeoJSON = await this.loadData();

    this.createManagers(countryGeoJSON);
    this.buildRenderers();
    this.startGameLoop();
    this.registerSignals();

    this.gameManager.startNewGame();

    this.initialized = true;
  }

  private async loadData(): Promise<CountriesGeoJson> {
    return loadGameData();
  }

  private createManagers(countryGeoJSON: CountriesGeoJson): void {
    this.countryManager = new CountryManager(countryGeoJSON);

    this.earthManager = new EarthManager(this.scene, this.earthRoot, 5);

    this.countryRenderer = new CountryRenderer(
      this.scene,
      this.countryManager.getAll(),
    );

    this.gameManager = new GameManager(
      this.countryManager,
      this.earthManager,
      this.countryRenderer,
    );

    this.gameLoop = new GameLoop(
      this.scene,
      this.earthManager,
      this.countryRenderer,
    );
  }

  private buildRenderers(): void {
    this.earthManager.build();

    this.countryRenderer.attachTo(this.earthRoot);
    this.countryRenderer.build();
  }

  private startGameLoop(): void {
    this.gameLoop.start();
  }

  private registerSignals(): void {
    S_countryManager.value = this.countryManager;
    S_countryRenderer.value = this.countryRenderer;
    S_earthManager.value = this.earthManager;
    S_gameManager.value = this.gameManager;
  }

  dispose(): void {
    if (!this.initialized) return;

    this.gameLoop.dispose();
    this.countryRenderer.dispose();
    this.earthManager.dispose();

    this.clearSignals();

    this.initialized = false;
  }

  private clearSignals(): void {
    S_countryManager.value = null;
    S_countryRenderer.value = null;
    S_earthManager.value = null;
    S_gameManager.value = null;
  }
}
