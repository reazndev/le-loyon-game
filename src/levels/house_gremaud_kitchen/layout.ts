import { WALL, type Room } from '../inn/interior';

/**
 * The plan of Odile Gremaud's kitchen. The door from the hall is in the south wall, the window
 * over the sink in the north wall, the stove and the dresser along the west wall, and the living
 * room through a closed door in the west wall. The table stands in the middle with his chair on
 * the east side, under his photo and the calendar.
 */

export const ROOM: Room = { x0: -2.2, x1: 2.2, z0: -2.6, z1: 2.0, h: 2.45 };

export const HALL_DOOR = { x: 1.3, w: 0.95, h: 2.1 };
export const LIVING_DOOR = { z: 1.15, w: 0.85, h: 2.05 };
export const WINDOW = { x: -0.35, w: 1.0, h: 1.0, y: 1.08 };

export const TABLE = { x: 0.75, z: -0.35, w: 0.85, d: 1.1, h: 0.76 };
/** Odile's chair, on the west side, pulled out a little. */
export const HER_CHAIR = { x: TABLE.x - 0.7, z: TABLE.z + 0.08 };
/** His chair, on the east side, pushed in square. */
export const HIS_CHAIR = { x: TABLE.x + 0.56, z: TABLE.z };

export const STOVE = { z: -1.75 };
export const DRESSER = { z: -0.15, length: 1.35 };
export const COUNTER = { x0: -1.35, x1: 0.75, d: 0.6, h: 0.88 };
export const FRIDGE = { x: 1.65, w: 0.6, d: 0.62, h: 1.45 };

/** The inside faces of the walls. */
export const WEST = ROOM.x0 + WALL / 2;
export const EAST = ROOM.x1 - WALL / 2;
export const NORTH = ROOM.z0 + WALL / 2;
export const SOUTH = ROOM.z1 - WALL / 2;

export const COAT_HOOK = { x: 0.35, y: 1.72 };
export const PIPE = { x: HIS_CHAIR.x - 0.3, z: TABLE.z + 0.28 };
/** On the east wall over his chair. */
export const PHOTO = { z: TABLE.z, y: 1.36 };
export const CRUCIFIX = { z: TABLE.z - 0.72, y: 1.74 };
export const CALENDAR = { z: 0.95, y: 1.18 };
export const DIARY = { x: TABLE.x - 0.12, z: TABLE.z - 0.18 };
export const CLOCK = { x: 1.05, y: 1.98 };

/** Where his head would be if he sat in his chair. Looking there stops the clock once. */
export const HIS_HEAD = { x: HIS_CHAIR.x, y: 1.22, z: HIS_CHAIR.z };

/** The ceiling lamp over the table, and the small lamp left on at night on the dresser. */
export const PENDANT = { x: TABLE.x, z: TABLE.z };
export const NIGHT_LAMP = { x: ROOM.x0 + 0.42, z: DRESSER.z - 0.45 };
