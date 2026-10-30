import type { AudioManager, Point3, SoundHandle } from '../../engine/audio/audioManager';
import { clockTick } from '../inn/sounds';

/** A loop that can go quiet and start again. Stopping it ends it for good. */
export interface PausableLoop extends SoundHandle {
  pause(): void;
  resume(): void;
  readonly playing: boolean;
}

/**
 * Wraps a loop that can only be stopped: pausing stops the running loop, resuming starts a
 * fresh one from `start`.
 */
export function pausable(start: () => SoundHandle): PausableLoop {
  let running: SoundHandle | null = start();
  let ended = false;
  return {
    get playing() {
      return running !== null;
    },
    pause() {
      running?.stop(0.02);
      running = null;
    },
    resume() {
      if (!ended && !running) running = start();
    },
    stop(fade) {
      ended = true;
      running?.stop(fade);
      running = null;
    },
  };
}

/** The kitchen clock, louder than a clock should be in a room this small. */
export const kitchenClock = (audio: AudioManager, at: Point3): PausableLoop => pausable(() => clockTick(audio, at, 0.6));
