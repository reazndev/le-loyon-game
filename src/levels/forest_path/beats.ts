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
