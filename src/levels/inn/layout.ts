/**
 * The Auberge de la Croix-Blanche in plan. Meters; north is -Z. The café is the ground floor with
 * the square to the south. The stübli opens off its west side. The stairs climb north out of the
 * café, and the upstairs corridor and room 3 lie past the café's back wall, so that their walls
 * never stand over a room below (collision is flat).
 */

export const CAFE = { x0: -5, x1: 5, z0: -4, z1: 4, h: 2.7 };
export const STUBLI = { x0: -9, x1: -5, z0: -0.6, z1: 4, h: 2.5 };

export const FRONT_DOOR = { x: 2.6, w: 1.1, h: 2.2 };
export const STUBLI_DOOR = { z: 2.6, w: 0.9, h: 2.1 };
export const KITCHEN_DOOR = { x: 4.1, w: 0.8, h: 2.05 };

/** The counter runs along the north wall from `x0` to the east wall. */
export const COUNTER = { x0: 0.9, z: -3.0, d: 0.6, h: 1.05 };
export const TABLES = [
  { x: -3.4, z: -2.2 },
  { x: -3.4, z: 0.4 },
  { x: -3.3, z: 2.9 },
  { x: -0.6, z: -1.6 },
  { x: -0.6, z: 1.0 },
  { x: 2.3, z: 0.9 },
] as const;
/** Where supper is laid, and where Raymond sits with his thermos. */
export const SUPPER_TABLE = TABLES[4];
export const CORNER_TABLE = TABLES[0];

/** Upstairs floor height, and the stair: fourteen risers climbing north. */
export const UPPER = 2.8;
export const STAIRS = { x0: -2.2, x1: -1.2, z0: -4.05, z1: -8, steps: 14 };
export const CORRIDOR = { x0: -2.2, x1: 6, z0: -9.4, z1: -8, h: 2.4 };
export const ROOM3 = { x0: 6, x1: 9.6, z0: -10.8, z1: -7.2, h: 2.45 };
export const ROOM3_DOOR = { z: -8.7, w: 0.85, h: 2.05 };
/** The other doors off the corridor, on its north side. */
export const CORRIDOR_DOORS = [
  { x: -0.5, label: '1' },
  { x: 1.6, label: '2' },
  { x: 3.8, label: 'yannick' },
] as const;

/** The stübli: the computer desk against the west wall, the phone on the north wall. */
export const DESK = { x: -8.55, z: 2.6, top: 0.74 };
export const SCREEN = { x: DESK.x + 0.13, y: DESK.top + 0.17, z: DESK.z };
/** Where the reporter sits at the computer, facing the screen with the doorway behind. */
export const SEAT = { x: -7.75, z: 2.6, yaw: 90 };
export const PHONE = { x: -6.3, y: 1.5, z: STUBLI.z0 + 0.1 };
/** Where Yannick stands in the stübli doorway, a step back in the dark café. */
export const DOORWAY = { x: -4.7, z: STUBLI_DOOR.z };

export const BED = { x: 8.55, z: -9.9 };
export const ROOM3_DESK = { x: 6.55, z: -10.25 };
export const RADIATOR = { x: 9.45, y: UPPER + 0.3, z: -8.6 };
