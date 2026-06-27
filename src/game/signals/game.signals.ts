import type { GameManager } from "@gameManagers";
import { signal } from "@preact/signals-react";

export const S_gameManager = signal<GameManager | null>(null);
