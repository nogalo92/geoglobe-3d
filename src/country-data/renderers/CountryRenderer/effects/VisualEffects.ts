export interface VisualEffect {
  update(dt: number): boolean;
  dispose(): void;
}
