/**
 * A place where Le Loyon stands or a scare beat from docs/script/07-scares.md happens. Scenes
 * export these as `markers` and stage their beats at them, so the places are data in one spot.
 */
export interface BeatMarker {
  /** Beat id from 07-scares.md, such as `for1_ahead`. */
  beat: string;
  x: number;
  z: number;
  /** Height above the ground. Omit for standing on it. */
  y?: number;
  /** Degrees, the level convention: 0 faces -Z, 90 faces -X. */
  yaw: number;
  /** What happens here, for whoever stages the beat. */
  note: string;
}

export type Markers = Record<string, BeatMarker>;

/**
 * A marker as the point a `look` trigger aims at. The director wants a height in the world, and
 * markers keep theirs above the ground, which climbs meters across a forest scene.
 */
export const lookPoint = (marker: BeatMarker, ground: (x: number, z: number) => number, above = marker.y ?? 1.5) => ({
  x: marker.x,
  z: marker.z,
  y: ground(marker.x, marker.z) + above,
});
