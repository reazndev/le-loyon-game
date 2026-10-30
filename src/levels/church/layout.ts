import type { AbbeSpot } from './abbe';

/**
 * Église Saint-Maurice in plan. Wall centerlines in meters; north is -Z. The nave runs from the
 * main door (south) to the chancel arch; the sacristy lies behind the altar and the parish office
 * beside it.
 */

export const WALL = 0.5;
/** The chancel, sacristy, and office floors sit one step above the nave. */
export const RAISED = 0.3;

export const NAVE = { x0: -5, x1: 5, z0: -11, z1: 11, h: 7 };
export const CHANCEL = { x0: -3.5, x1: 3.5, z0: -17, z1: -11, h: 5.5 };
export const SACRISTY = { x0: -3.5, x1: 3.5, z0: -21, z1: -17, h: 3.1 };
export const OFFICE = { x0: 3.5, x1: 7.5, z0: -21, z1: -17, h: 3.1 };

export const MAIN_DOOR = { x: 0, w: 1.6, h: 2.8 };
/** In the chancel's east wall, out to the path up the hill. Saint Maurice hangs above it. */
export const SIDE_DOOR = { z: -13.6, w: 1, h: 2.2 };
export const SACRISTY_DOOR = { x: -2.5, w: 0.95, h: 2.15 };
export const OFFICE_DOOR = { z: -19.4, w: 0.9, h: 2.1 };

/** The clock mechanism sits in the tower over the main door. */
export const TOWER = { x: 0, y: 10, z: 10 };

export const CONFESSIONAL = { x: -4.2, z: 8.4 };
export const SIDE_ALTAR = { x: 4.35, z: -7.4 };
export const CANDLE_RACK = { x: 4.1, z: -5.6 };
export const REGISTER_CUPBOARD = { x: 1.4, z: -20.45 };

export const PEW_ROWS = 12;
export const PEW = { w: 3.2, firstZ: 6.8, spacing: 0.98, x: 2.45 };

/** Where the abbé stands. Yaw in degrees, the level convention: 0 faces -Z, 90 faces -X. */
export const abbeSpots: Record<AbbeSpot, { x: number; z: number; yaw: number }> = {
  candles: { x: 3.25, z: -5.7, yaw: -90 },
  nave: { x: -1.1, z: -6.2, yaw: 160 },
  sacristy: { x: 1.9, z: -18.4, yaw: 150 },
  sacristy_door: { x: -2.3, z: -15.9, yaw: 200 },
  office: { x: 5.3, z: -19.6, yaw: 0 },
  kneeling: { x: 3.25, z: -7.4, yaw: -90 },
};
