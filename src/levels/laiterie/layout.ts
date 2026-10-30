/**
 * The laiterie-épicerie in plan. Meters; north is -Z. One room under one ceiling: the dairy on
 * the west side, where farmers bring their milk, and the shop on the east side, where Christine
 * stands behind the counter. The street door and the shop window face south onto the square.
 */

export const ROOM = { x0: -4.2, x1: 3.4, z0: -3.6, z1: 3, h: 2.7 };
/** Where the tiled dairy floor gives way to the shop's boards. */
export const DAIRY_EDGE = -0.8;

export const DOOR = { x: 1.6, w: 0.95, h: 2.1 };
export const SHOP_WINDOW = { x: -0.6, w: 1.6, h: 1.3, y: 0.85 };
export const SIDE_WINDOW = { z: 1.1, w: 1.1, h: 1, y: 1.1 };

/** The shop counter runs east to west; Christine stands behind it, facing the door. */
export const SHOP_COUNTER = { x: 1.6, z: -1.5, w: 2.4, d: 0.6, h: 0.98 };
export const CHRISTINE = { x: 1.6, z: -2.05, yaw: 180 };

/** The milk counter runs north to south, with the weighing bucket on it and the tank behind. */
export const MILK_COUNTER = { x: -1.9, z: -1.6, w: 0.7, d: 1.9, h: 0.9 };
export const TANK = { x: -3.45, z: -2.55, r: 0.62 };

export const CORK_BOARD = { x: 0.62, y: 1.15, w: 0.7, h: 0.55 };

/** The brass bell on its spring, inside, over the door. */
export const BELL = { x: DOOR.x, y: DOOR.h + 0.18, z: ROOM.z1 - 0.16 };
export const CLOCK = { x: 2.55, y: 2.05, z: ROOM.z0 + 0.1 };
export const RADIO = { x: 0.75, y: 1.55, z: ROOM.z0 + 0.22 };

/** The far corner of the room from the door: the player has their back to the door while facing it. */
export const BACK_CORNER = { x: -0.4, y: 1.3, z: ROOM.z0 };
