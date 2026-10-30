import { flameLevel } from '../../game/ambient';

/** Seconds between the draughts that pull a grave lantern's flame low. */
export const DRAUGHT_EVERY = 9;
const DRAUGHT_SECONDS = 0.6;

/**
 * A candle behind red glass on a grave, out in the open: it wavers like any flame, and every
 * few seconds a draught through the vents in the lid pulls it low for a moment before it
 * stands up again. 0.5 to 1.05.
 */
export function lanternLevel(t: number, seed = 0): number {
  const phase = (((t + seed * 2.3) % DRAUGHT_EVERY) + DRAUGHT_EVERY) % DRAUGHT_EVERY;
  const dip = phase < DRAUGHT_SECONDS ? Math.sin((phase / DRAUGHT_SECONDS) * Math.PI) * 0.4 : 0;
  return flameLevel(t, seed) * (1 - dip);
}
