import type { Trail } from '../forest_path/trail';

/**
 * Leurs in plan, centered on the fountain. North is -Z. The church closes the square to the
 * north, the inn to the east with the Gremaud house behind it, and the road comes in from the
 * west past the bus stop and turns south past the laiterie and the garage toward the Yerly farm.
 */

export const FOUNTAIN = { x: 0, z: -1 };
/** The paved square. */
export const SQUARE = { x: -1, z: -1.5, w: 23, d: 20 };

/** The church front: the tower stands forward of the nave, the main door in its foot. */
export const CHURCH = { x: 0, front: -12, w: 12, d: 22, tower: 4.6 };
export const CHURCH_DOOR = { x: 0, z: CHURCH.front };

/** Houses, by their center; `yaw` turns their front (local +Z) to face the street. */
export const INN = { x: 15, z: -2, w: 13, d: 10, yaw: -90 };
export const INN_DOOR = { z: -3.2 };
export const GREMAUD = { x: 17, z: 13.5, w: 9, d: 8, yaw: -90 };
export const GREMAUD_GATE = { x: 11.4, z: 13.5 };
export const LAITERIE = { x: -10.5, z: 22, w: 10, d: 9, yaw: 90 };
export const GARAGE = { x: 15, z: 26, w: 11, d: 9, yaw: -90 };
export const HOUSE_1 = { x: -18, z: -5, w: 9, d: 9, yaw: 90 };
export const HOUSE_2 = { x: -21, z: 16.5, w: 9, d: 8, yaw: 180 };

export const PHONE_BOX = { x: 8, z: 6.6 };
export const BUS_STOP = { x: -9.5, z: 13.6 };
export const MEMORIAL = { x: -4.4, z: -11.2 };
export const LAMP = { x: -6.4, z: -7.4, yaw: -130 };

/** The road through the village: in from the west, past the bus stop, then south. */
export const mainRoad: Trail = [
  [-48, 8.5],
  [-6, 8.5],
  [1.5, 10],
  [4.2, 14],
  [4.6, 24],
  [4.6, 54],
];
export const ROAD_WIDTH = 6;
/** The lane north past the church's west side to the path up the hill. */
export const churchLane: Trail = [
  [-8, -9],
  [-9.5, -16],
  [-10, -30],
  [-10, -44],
];
/** The lane from the square between the inn and the Gremaud house. */
export const gremaudLane: Trail = [
  [8.5, 7],
  [9.5, 11],
  [GREMAUD_GATE.x - 0.4, GREMAUD_GATE.z],
];

/** The village's edges, hidden in fog. */
export const BOUNDS = { x0: -50, x1: 32, z0: -46, z1: 56 };

export const spawns = {
  default: { x: -7.6, z: 12.6, yaw: 20 },
  bus_stop: { x: -8.2, z: 13.3, yaw: 0 },
  church_door: { x: CHURCH_DOOR.x, z: CHURCH.front + 1.6, yaw: 180 },
  from_inn: { x: INN.x - INN.d / 2 - 1.4, z: INN_DOOR.z, yaw: 90 },
  from_laiterie: { x: LAITERIE.x + LAITERIE.d / 2 + 1.4, z: LAITERIE.z, yaw: -90 },
  from_garage: { x: GARAGE.x - GARAGE.d / 2 - 1.6, z: GARAGE.z + 2, yaw: 90 },
  from_gremaud: { x: GREMAUD_GATE.x - 1.6, z: GREMAUD_GATE.z - 0.4, yaw: 120 },
  from_chassot: { x: BOUNDS.x0 + 4, z: 8.5, yaw: -90 },
  from_yerly: { x: 4.6, z: BOUNDS.z1 - 4, yaw: 0 },
};
