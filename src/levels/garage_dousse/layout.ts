import { WALL, type Room } from '../inn/interior';

/**
 * The plan of Garage Dousse. One workshop, 10 by 10 meters: the street wall with the bay doors
 * and the side door at +Z, the bench along the back wall at -Z, the pit bay on the left and the
 * lift bay on the right.
 */

export const ROOM: Room = { x0: -5, x1: 5, z0: -6, z1: 4, h: 3.8 };

/** The side door the player uses, in the street wall. */
export const DOOR = { x: 3.9, w: 0.95, h: 2.1 };
/** The double bay doors, shut but for a crack, in front of the pit. */
export const BAY_DOOR = { x: -1.6, w: 3.2, h: 3 };

/** The inspection pit, a slot in the floor along Z. */
export const PIT = { x: -1.6, z: -0.9, w: 0.9, d: 5, depth: 1.4 };
export const PIT_EDGES = {
  x0: PIT.x - PIT.w / 2,
  x1: PIT.x + PIT.w / 2,
  z0: PIT.z - PIT.d / 2,
  z1: PIT.z + PIT.d / 2,
};

/** The two-post lift: the middle of the car, how far the posts stand out, and the sills' height. */
export const LIFT = { x: 2.3, z: -1.7, posts: 1.22, rise: 1.75 };
/** Where the sump drips into the tray. */
export const SUMP = { x: LIFT.x, y: LIFT.rise, z: LIFT.z - 1.1 };

export const BENCH = { x: -2.6, z: ROOM.z0 + WALL / 2 + 0.35, w: 3.2, d: 0.7, h: 0.88 };
/** On the wall over the bench, where the card from Calvi is pinned. */
export const POSTCARD = { x: -2.05, y: 1.5, z: ROOM.z0 + WALL / 2 + 0.012 };
export const CALENDAR = { x: -0.25, y: 1.2, z: ROOM.z0 + WALL / 2 + 0.01 };
/** The radio on its shelf on the left wall, near the bench. */
export const RADIO = { x: ROOM.x0 + WALL / 2 + 0.16, y: 1.72, z: -4.5 };

/** Inside the side door, facing into the workshop. */
export const INSIDE_DOOR = { x: DOOR.x, z: ROOM.z1 - 0.9, yaw: 0 };
