import { containsPoint, type Shape } from './collision';

export type Surface = 'grass' | 'gravel' | 'wood' | 'stone' | 'snow';

export interface GroundPatch {
  /** Where the patch is, in the XZ plane. */
  area: Shape;
  /** Height in meters at a world point inside the area. */
  heightAt: (x: number, z: number) => number;
  surface: Surface;
}

export interface GroundSample {
  height: number;
  surface: Surface;
}

/** How high a player can step up in one move, in meters. */
export const STEP_HEIGHT = 0.45;

/**
 * Answers "how high is the ground here, and what is it made of". Overlapping patches resolve to
 * the highest one the player can step onto, so a floor under a ceiling-height box still works.
 */
export class GroundMap {
  private readonly patches = new Set<GroundPatch>();
  fallback: GroundSample = { height: 0, surface: 'grass' };

  add(patch: GroundPatch): () => void {
    this.patches.add(patch);
    return () => this.patches.delete(patch);
  }

  clear(): void {
    this.patches.clear();
    this.fallback = { height: 0, surface: 'grass' };
  }

  /** Samples the ground at (x, z) for someone whose feet are at `feetY`. */
  sample(x: number, z: number, feetY = Infinity): GroundSample {
    let best: GroundSample | null = null;
    for (const patch of this.patches) {
      if (!containsPoint(patch.area, x, z)) continue;
      const height = patch.heightAt(x, z);
      if (height > feetY + STEP_HEIGHT) continue;
      if (!best || height > best.height) best = { height, surface: patch.surface };
    }
    return best ?? this.fallback;
  }
}
