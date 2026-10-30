/**
 * The square's street lamp on its last legs, as a brightness from 0 to 1 at `t` seconds: steady
 * with a faint shimmer, a stutter of quick drops every quarter minute or so, and about once a
 * minute it goes out and strikes again slowly, dim and orange first, the way an old sodium lamp
 * does. The first outage comes about forty seconds in.
 */
export function lampLevel(t: number, seed = 0): number {
  const shimmer = 0.97 + 0.03 * Math.sin(t * 7.3 + seed);
  const cycle = 71 + (seed % 7);
  const sinceOut = (t + 30 + seed * 5.3) % cycle;
  if (sinceOut < OUT_SECONDS) return DARK;
  if (sinceOut < OUT_SECONDS + STRIKE_SECONDS) return DARK + (1 - DARK) * ((sinceOut - OUT_SECONDS) / STRIKE_SECONDS) ** 2 * shimmer;
  const stutter = (t + seed * 1.7) % (17 + (seed % 3));
  if (stutter < 0.6 && Math.sin(stutter * 40 + seed) > 0.3) return 0.3;
  return shimmer;
}

const OUT_SECONDS = 2.4;
const STRIKE_SECONDS = 3;
/** The filament's glow left when the arc drops. */
const DARK = 0.04;
