import type { ArcRotateCamera, TransformNode } from "@babylonjs/core";
import { signal } from "@preact/signals-react";

export const S_earthRoot = signal<TransformNode | null>(null);
export const S_arcCamera = signal<ArcRotateCamera | null>(null);
