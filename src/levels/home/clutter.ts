import type { Placed } from '../../game/kit/builders';
import type { LevelKit } from '../../game/kit/levelKit';
import { scrawl } from '../forest_path/scrawl';
import { monthCells } from './calendar';
import { ROOM, WINDOW } from './room';

/**
 * The small things of a one-room flat lived in alone: a kitchen corner with the dishes left in
 * the sink, newspapers kept for later, a radio, the calendar and the clock, a second coat, shoes
 * by the door, curtains half drawn. All of it stays off the paths to the desk, the window, the
 * bag, and the door.
 */

/** The wall clock over the desk, for its tick. */
export const CLOCK = { x: -ROOM.halfW + 0.04, y: 1.85, z: -0.95 };
/** The radiator under the window, for its knock. */
export const RADIATOR = { x: (WINDOW.x0 + WINDOW.x1) / 2, y: 0.3, z: -ROOM.halfD + 0.1 };

const SOUTH = ROOM.halfD - 0.02;
const CHINA = 0xb8b4a8;

export function clutter(kit: LevelKit): void {
  kit.batch((still) => {
    kitchenCorner(still);
    westCorner(still);
    calendar(still);
    clock(still);
    byTheDoor(still);
  });
}

/** A counter with a steel sink in the corner by the window, and a cupboard over it. */
function kitchenCorner(kit: LevelKit): void {
  const x = 1.86;
  const z = -ROOM.halfD + 0.28;
  const top = 0.88;
  kit.box({ w: 0.62, h: top, d: 0.55 }).texture('wood_planks', { tile: 0.8 }).color(0x8a7a62).at(x, 0, z).collider();
  kit.box({ w: 0.64, h: 0.03, d: 0.57 }).color(0x9a968a).at(x, top, z);
  kit.box({ w: 0.3, h: 0.004, d: 0.34 }).color(0x4a4c4c).at(x - 0.1, top + 0.03, z + 0.02);
  // The tap.
  kit.cylinder({ r: 0.012, h: 0.2, sides: 5 }).color(0x8a8c8c).at(x - 0.1, top + 0.03, z - 0.2);
  kit.box({ w: 0.02, h: 0.02, d: 0.12 }).color(0x8a8c8c).at(x - 0.1, top + 0.2, z - 0.14);
  // Tonight's dishes, not yet washed.
  [0, 1, 2].forEach((i) => kit.cylinder({ r: 0.1, h: 0.012, sides: 10 }).color(CHINA).at(x - 0.12 + i * 0.01, top + 0.035 + i * 0.013, z + 0.04));
  kit.cylinder({ r: 0.04, h: 0.09, sides: 7 }).color(0x5a6a7a).at(x - 0.02, top + 0.035, z + 0.12);
  kit.box({ w: 0.012, h: 0.006, d: 0.2 }).color(0x8a8c8c).at(x - 0.16, top + 0.075, z + 0.05).rotY(20);
  // A drying rack with yesterday's plates standing in it.
  kit.box({ w: 0.2, h: 0.015, d: 0.3 }).color(0x8a8c8c).at(x + 0.18, top + 0.03, z);
  [-0.08, -0.02, 0.04].forEach((dz) => standingPlate(kit, x + 0.18, top + 0.045, z + dz));
  kit.cylinder({ r: 0.035, h: 0.08, sides: 7 }).color(CHINA).at(x + 0.18, top + 0.045, z + 0.1);
  // The cupboard on the wall.
  kit.box({ w: 0.62, h: 0.55, d: 0.32 }).texture('wood_planks', { tile: 0.8 }).color(0x8a7a62).at(x, 1.55, -ROOM.halfD + 0.16);
  kit.box({ w: 0.01, h: 0.5, d: 0.01 }).color(0x4a3e30).at(x, 1.575, -ROOM.halfD + 0.325);
  // A tea towel on a nail in the counter's side.
  kit.box({ w: 0.02, h: 0.34, d: 0.2 }).color(0x3e4650).at(x - 0.32, 0.5, z + 0.05);
}

/** A plate on edge in the rack, facing along X. */
function standingPlate(kit: LevelKit, x: number, y: number, z: number): void {
  kit.cylinder({ r: 0.09, h: 0.012, sides: 10 }).color(CHINA).at(x, y + 0.09, z).object.rotation.set(Math.PI / 2, 0, 0);
}

/** Newspapers kept on the floor by the shelf, and the radio on top of it, switched off. */
function westCorner(kit: LevelKit): void {
  const x = -ROOM.halfW + 0.2;
  kit.box({ w: 0.32, h: 0.12, d: 0.4 }).color(0x9a968a).at(x, 0, 1.33).collider();
  [0xa8a494, 0x9e9a8a, 0xb0ac9c, 0xa29e8e].forEach((color, i) => kit.box({ w: 0.3, h: 0.035, d: 0.4 }).color(color).at(x + (i % 2) * 0.02, 0.12 + i * 0.035, 1.33).rotY(i * 5 - 6));
  kit.box({ w: 0.3, h: 0.02, d: 0.42 }).color(0xb8b4a4).at(x + 0.06, 0.26, 1.3).rotY(14);

  const radio = { x: -ROOM.halfW + 0.16, y: 1.4, z: 0.8 };
  kit.box({ w: 0.14, h: 0.15, d: 0.28 }).color(0x3a3430).at(radio.x, radio.y, radio.z);
  kit.box({ w: 0.005, h: 0.08, d: 0.12 }).color(0x1e1a18).at(radio.x + 0.071, radio.y + 0.04, radio.z - 0.06);
  kit.box({ w: 0.005, h: 0.02, d: 0.08 }).color(0x8a8270).at(radio.x + 0.071, radio.y + 0.1, radio.z + 0.07);
  kit.box({ w: 0.006, h: 0.3, d: 0.006 }).color(0x8a8a86).at(radio.x - 0.03, radio.y + 0.15, radio.z + 0.1).object.rotation.set(0.3, 0, 0);
}

/** The bank's free calendar on the wall by the desk, the days to Sunday crossed off. */
function calendar(kit: LevelKit): void {
  const days = monthCells(1998, 10);
  scrawl(kit, { w: 0.28, h: 0.42 }, [28, 42], (g) => {
    g.fillStyle = '#a49e8c';
    g.fillRect(0, 0, 28, 42);
    // A view of the lake for the month, faded.
    g.fillStyle = '#7a8a90';
    g.fillRect(2, 2, 24, 8);
    g.fillStyle = '#5a6a5a';
    g.fillRect(2, 10, 24, 6);
    g.fillStyle = '#9a6a5a';
    g.fillRect(2, 18, 24, 3);
    const cell = (column: number, row: number) => [3 + Math.round(column * 3.3), 23 + Math.round(row * 3.1)] as const;
    days.forEach(({ day, column, row }) => {
      const [x, y] = cell(column, row);
      g.fillStyle = column === 6 ? '#8a4a40' : '#3a3a3a';
      g.fillRect(x, y, 2, 1);
      // Every day before today is struck through.
      if (day < 16) {
        g.fillStyle = '#2a2a3a';
        g.fillRect(x, y + 1, 2, 1);
      }
    });
    const [x, y] = cell(days[15]!.column, days[15]!.row);
    g.strokeStyle = '#2a2a6a';
    g.strokeRect(x - 1.5, y - 1.5, 5, 4);
  }).at(-0.08, 1.22, -ROOM.halfD + 0.004);
  kit.box({ w: 0.01, h: 0.01, d: 0.02 }).color(0x3a3a3a).at(-0.08, 1.63, -ROOM.halfD + 0.01);
}

/** A round kitchen clock on the west wall, reading ten past eleven. */
function clock(kit: LevelKit): void {
  const { x, y, z } = CLOCK;
  const face = x + 0.03;
  kit.cylinder({ r: 0.13, h: 0.03, sides: 12 }).color(0x2a2a2a).at(x - 0.01, y, z).object.rotation.set(0, 0, -Math.PI / 2);
  kit.cylinder({ r: 0.115, h: 0.002, sides: 12 }).color(0xd8d4c4).at(face, y, z).object.rotation.set(0, 0, -Math.PI / 2);
  hand(kit, face, y, z, 0.07, 335);
  hand(kit, face, y, z, 0.1, 60);
}

/** A clock hand from the middle of a face on the west wall, `degrees` clockwise from twelve. */
function hand(kit: LevelKit, x: number, y: number, z: number, length: number, degrees: number): void {
  kit.box({ w: 0.004, h: length, d: 0.008 }).color(0x111111).at(x + 0.004, y, z).object.rotation.set((-degrees * Math.PI) / 180, 0, 0);
}

/** A second coat and a scarf on the hooks, and two pairs of shoes on the mat. */
function byTheDoor(kit: LevelKit): void {
  kit.box({ w: 0.28, h: 0.03, d: 0.04 }).color(0x5a4a38).at(0.08, 1.75, SOUTH - 0.02);
  kit.box({ w: 0.36, h: 0.85, d: 0.1 }).color(0x4e4a40).at(0.02, 0.88, SOUTH - 0.07);
  kit.box({ w: 0.26, h: 0.16, d: 0.11 }).color(0x46423a).at(0.02, 1.6, SOUTH - 0.07);
  kit.box({ w: 0.09, h: 0.62, d: 0.03 }).color(0x5a2a28).at(0.18, 1.12, SOUTH - 0.14);

  kit.box({ w: 0.5, h: 0.01, d: 0.34 }).color(0x4a3a30).at(-0.5, 0, SOUTH - 0.3);
  [
    [-0.66, 0x2a1e18],
    [-0.56, 0x2a1e18],
    [-0.4, 0x3a3a40],
    [-0.31, 0x3a3a40],
  ].forEach(([x, color], i) => shoe(kit, x!, SOUTH - 0.3 + (i % 2) * 0.03, color!));
}

/** A shoe on the floor, toe toward the room. */
function shoe(kit: LevelKit, x: number, z: number, color: number): void {
  kit.box({ w: 0.09, h: 0.04, d: 0.26 }).color(0x1a1612).at(x, 0.01, z);
  kit.box({ w: 0.085, h: 0.06, d: 0.15 }).color(color).at(x, 0.05, z + 0.05);
}

/**
 * Curtains half drawn at the window. The right one hangs in the draft from the old frame and
 * moves a little; it stays out of the batch so it can.
 */
export function curtains(kit: LevelKit): Placed {
  const z = -ROOM.halfD + 0.06;
  const drop = 2.12 - WINDOW.y0 - 0.06;
  kit.box({ w: 1.5, h: 0.02, d: 0.02 }).color(0x6a6a66).at((WINDOW.x0 + WINDOW.x1) / 2, 2.12, z);
  kit.box({ w: 0.32, h: drop, d: 0.03 }).color(0x5a5042).at(WINDOW.x0 - 0.1, 2.12 - drop, z);
  return kit.group((g) => g.box({ w: 0.3, h: drop, d: 0.03 }).color(0x5a5042).at(0, -drop, 0)).at(WINDOW.x1 + 0.1, 2.12, z);
}
