/**
 * The Chassot cellar in plan. The barrel vault runs east to west, springing from the north and
 * south walls. Five stone steps go up through the east wall to the hatch; a wooden stair goes up
 * from the west wall to the shut door into the house.
 */

export const ROOM = { x0: -2, x1: 2, z0: -2.5, z1: 2.5 };
/** Where the vault springs from the side walls, and its height at the crown. */
export const SPRING = 1.5;
export const CROWN = 2.1;

/** The steps up to the hatch: `count` treads of `run` by `rise` from the east wall, `half` either side of z 0. */
export const STEPS = { x: ROOM.x1, count: 5, run: 0.32, rise: 0.3, half: 0.6 };
export const STEPS_TOP = STEPS.x + STEPS.count * STEPS.run;
/** The middle of the hatch boards over the top of the steps. */
export const HATCH = { x: 2.95, y: 3.15, z: 0 };

/** The inside stair's door frame in the west wall. */
export const STAIR_DOOR = { x: ROOM.x0, z: 1.2, w: 0.8, h: 1.9 };

export const BIN = { x: -1.2, z: -1.85 };
export const SHELF = { x: 0.8, z: ROOM.z0 + 0.2, w: 1.7 };
export const CRATE = { x: -0.95, z: 2.05 };
export const CANDLE = { x: 0.45, z: 2.2 };
export const GRATING = { x: ROOM.x1, y: 1.55, z: -1.3 };

export const spawns = {
  default: { x: 1.55, z: 0, yaw: 90 },
  from_farm: { x: 1.55, z: 0, yaw: 90 },
};
