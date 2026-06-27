import type { Scene, TransformNode } from "@babylonjs/core";
import { CountryManager } from "@countryManagers";
import { CountryRenderer } from "../country-data/renderers/CountryRenderer";
import { loadGameData } from "@gameUtils";
import { S_countryManager, S_countryRenderer } from "@earthSignals";
import { S_gameManager } from "@gameSignals";
import { GameManager } from "@gameManagers";

export async function initializeGame(
  scene: Scene,
  earthRoot: TransformNode,
): Promise<void> {
  const countryGeoJSON = await loadGameData();
  const countryManager = new CountryManager(countryGeoJSON);
  const countryRenderer = new CountryRenderer(scene, countryManager);
  const gameManager = new GameManager(countryManager, countryRenderer);

  countryRenderer.attachTo(earthRoot);
  countryRenderer.build();

  S_countryManager.value = countryManager;
  S_countryRenderer.value = countryRenderer;
  S_gameManager.value = gameManager;

  gameManager.startNewGame();
}
