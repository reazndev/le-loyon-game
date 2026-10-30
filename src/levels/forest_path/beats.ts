import { Emitter } from '../../engine/events';

/**
 * A place where Le Loyon stands or a scare beat from docs/script/07-scares.md happens. Scenes
 * export these as `markers`; the integration step places characters and sounds at them.
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

export interface BeatCue {
  beat: string;
  /** Which variant of the beat, where the scene knows it, such as a right or wrong knock. */
  variant?: string;
}

/**
 * Beats that start with something the player does rather than where they walk: turning a
 * crank, looking into a mirror, knocking. Scenes emit them; the scare director listens.
 */
export const beatCues = new Emitter<{ cue: BeatCue }>();

export const cue = (beat: string, variant?: string): void =>
  beatCues.emit('cue', variant === undefined ? { beat } : { beat, variant });
