import type { AudioManager } from '../../engine/audio/audioManager';
import { oneShot, tone, type OneShot } from '../../engine/characters/voices';

/** One knock of the clapper: seconds after the first, and how hard, 0 to 1. */
export interface Strike {
  time: number;
  level: number;
}

/**
 * The knocks of a bell hung on a coiled spring. A door swinging open (`swing` 1) sets it
 * bouncing: a hard knock, then quicker and softer ones as the spring settles. A draft (`swing`
 * near 0.2) gives one faint knock and barely a second.
 */
export function bellStrikes(swing: number): Strike[] {
  const count = Math.max(1, Math.round(1 + swing * 6));
  return Array.from({ length: count }, (_, i) => ({
    time: 0.13 * i * (1 - i * 0.04),
    level: swing * Math.pow(0.68, i),
  })).filter((strike) => strike.level > 0.02);
}

/** The partials of a small brass shop bell, in Hz, with their share of each knock and ring time. */
const PARTIALS = [
  [1720, 1, 1.4],
  [4130, 0.45, 0.8],
  [6280, 0.22, 0.45],
] as const;

/** The brass bell over the shop door. */
export function shopBell(audio: AudioManager, options: OneShot, swing: number): void {
  const strikes = bellStrikes(swing);
  const last = strikes[strikes.length - 1]?.time ?? 0;
  oneShot(audio, { volume: 0.5, ...options }, last + 1.8, (out, t) =>
    strikes.forEach((strike) =>
      PARTIALS.forEach(([frequency, share, ring]) =>
        tone(audio, out, { frequency: frequency * (1 + (Math.random() - 0.5) * 0.004), start: t + strike.time, duration: ring, gain: 0.2 * share * strike.level }),
      ),
    ),
  );
}
