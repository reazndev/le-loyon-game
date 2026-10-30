/**
 * vil_chassot_farm (night 3): a light moves behind the nailed shutters, low, like a candle
 * carried at waist height. It shows in the gaps between the boards of whichever window it passes.
 * When the reporter comes close, it goes out.
 */

/** How brightly a window's gaps glow, 0 to 1, with the candle `distance` meters along the wall from it. */
export function gapGlow(distance: number, reach = 1.6): number {
  return Math.max(0, 1 - Math.abs(distance) / reach) ** 1.5;
}

/** Where the candle is along the front wall at time `t`: a slow walk back and forth with pauses. */
export function candleAlong(t: number, halfWidth: number): number {
  // A triangle wave over 26 seconds, held flat at each end for a moment, as if someone stops there.
  const period = 26;
  const phase = (t % period) / period;
  const tri = phase < 0.5 ? phase * 2 : 2 - phase * 2;
  const held = Math.min(1, Math.max(0, (tri - 0.12) / 0.76));
  return -halfWidth + held * 2 * halfWidth;
}
