import type { Trail } from '../forest_path/trail';

/**
 * Ferme Yerly in plan. North is -Z. The road comes in from the village to the east; the house
 * and cowshed stand under one roof on the north side of the yard; the henhouse is to the south.
 * Behind the tool shed a gate opens on the field, which climbs west to the Bois-Noir.
 */

export const HOUSE = { x: -4, z: -7, w: 9, d: 10 };
export const BARN = { x: 7.5, z: -7.5, w: 13, d: 11 };
/** The open stall on the barn's east end, where the cows stand out of the rain. */
export const STALL = { x: 17.5, z: -6, w: 6, d: 9 };
export const HENHOUSE = { x: -9, z: 9 };
export const SHED = { x: -14, z: -4 };
export const GATE = { x: -19, z: -6 };
export const MANURE = { x: 5, z: 3.2 };
export const BERNARD = { x: 2.4, z: 1.2, yaw: 160 };
/** Where Marquise stands once she is home. */
export const HOME_SPOT = { x: 16.2, z: -4.2 };

/** The field between its fences, from the gate up to the trees. */
export const FIELD = { x0: -44, x1: -20, z0: -17, z1: 4 };
export const FOREST_EDGE = -46;
/** Marquise at the forest edge on day 2, staring into the trees (for2_heifer). */
export const MARQUISE = { x: -41.5, z: -8, yaw: 80 };
/** The dark shape 12 m into the trees that is not there when the reporter looks again (for2_stump). */
export const SHAPE = { x: -55, z: -5.5 };
export const STUMP = { x: -53.4, z: -8.2 };

export const farmRoad: Trail = [
  [37, 12],
  [24, 12],
  [12, 9],
  [6, 6],
];
export const forestTrack: Trail = [
  [FOREST_EDGE + 3, -8],
  [FOREST_EDGE - 4, -8.6],
  [FOREST_EDGE - 12, -10],
];

export const BOUNDS = { x0: -60, x1: 39, z0: -30, z1: 26 };

/** Flat in the yard; the field rises west toward the forest, four meters over its length. */
export function fieldHeight(x: number, z: number): number {
  const rise = Math.max(0, -18 - x);
  return rise * 0.15 + Math.min(1, rise / 8) * 0.3 * Math.sin(x * 0.19 + 0.4) * Math.cos(z * 0.23);
}

export const spawns = {
  default: { x: 31, z: 12, yaw: 90 },
  from_square: { x: 31, z: 12, yaw: 90 },
  from_forest: { x: FOREST_EDGE - 6, z: -8.8, yaw: -95 },
};
