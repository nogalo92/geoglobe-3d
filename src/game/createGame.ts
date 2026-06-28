import type { TransformNode, Scene as BabylonScene } from "@babylonjs/core";
import { Game } from "./Game";

export async function createGame(
  scene: BabylonScene,
  earthRoot: TransformNode,
): Promise<Game> {
  const game = new Game(scene, earthRoot);
  await game.initialize();

  return game;
}
