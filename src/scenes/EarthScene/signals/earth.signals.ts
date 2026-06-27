import type { ArcRotateCamera, TransformNode } from "@babylonjs/core";
import type { CountryManager } from "@countryManagers";
import type { CountryRenderer } from "@countryRenderer";
import { signal } from "@preact/signals-react";

export const S_earthRoot = signal<TransformNode | null>(null);
export const S_arcCamera = signal<ArcRotateCamera | null>(null);

export const S_countryManager = signal<CountryManager | null>(null);
export const S_countryRenderer = signal<CountryRenderer | null>(null);
