import type { LevelKit } from '../../game/kit/levelKit';
import { COUNTER, DRESSER, HALL_DOOR, NORTH, SOUTH, STOVE, WEST, WINDOW } from './layout';

/**
 * Odile's few things: the kettle on the stove, a towel on its rail, canisters by the drainer,
 * apples on the dresser, a geranium on the sill, the radiator, the doormat, and the curtain that
 * does not move. All still, so it goes in the scene's batch.
 */

const CURTAIN = 0x7e8472;
const ROD_Y = WINDOW.y + WINDOW.h + 0.08;
const CURTAIN_W = 0.26;

/** The radiator under the coat hook wall, for its knocking. */
export const RADIATOR = { x: -1.1, y: 0.45, z: SOUTH - 0.06 };
/** The hook of the curtain that moves, at the left of the window, where the frame lets in a draft. */
export const DRAFTY_CURTAIN = { x: WINDOW.x - WINDOW.w / 2 + 0.07, y: ROD_Y, z: NORTH + 0.05 };
/** Where the cat sits, on the counter left of the window. */
export const CAT_SPOT = { x: COUNTER.x0 + 0.27, y: COUNTER.h, z: NORTH + 0.28, yaw: 168 };

export function buildClutter(kit: LevelKit): void {
  curtains(kit);
  windowSill(kit);
  kettle(kit);
  canisters(kit);
  apples(kit);
  radiator(kit);
  kit.box({ w: 0.7, h: 0.012, d: 0.42 }).color(0x4a3e30).at(HALL_DOOR.x, 0, SOUTH - 0.32);
}

/** One half curtain hanging from a hook, built from the hook down so it can swing. */
export function curtain(kit: LevelKit): void {
  kit.box({ w: CURTAIN_W, h: WINDOW.h + 0.04, d: 0.015 }).color(CURTAIN).at(0, -WINDOW.h - 0.06, 0);
  kit.box({ w: CURTAIN_W, h: 0.03, d: 0.018 }).color(0x8a7e66).at(0, -WINDOW.h - 0.06, 0);
}

/** The rod, a short valance, and the right-hand curtain. The left one is the scene's. */
function curtains(kit: LevelKit): void {
  const z = NORTH + 0.05;
  kit.cylinder({ r: 0.01, h: WINDOW.w + 0.2, sides: 4 }).color(0x6a5a40).at(WINDOW.x - WINDOW.w / 2 - 0.1, ROD_Y, z).object.rotation.z = -Math.PI / 2;
  kit.box({ w: WINDOW.w + 0.14, h: 0.16, d: 0.02 }).color(0x6e7464).at(WINDOW.x, ROD_Y - 0.15, z + 0.01);
  kit.group((g) => curtain(g)).at(WINDOW.x + WINDOW.w / 2 - 0.07, ROD_Y, z);
}

/** The sill, with a geranium cut back for the winter and one red flower still on it. */
function windowSill(kit: LevelKit): void {
  const y = WINDOW.y - 0.025;
  kit.box({ w: WINDOW.w + 0.1, h: 0.025, d: 0.14 }).color(0x9a8a6c).at(WINDOW.x, y, NORTH + 0.07);
  const x = WINDOW.x + 0.33;
  const z = NORTH + 0.07;
  kit.cylinder({ r: 0.055, h: 0.09, sides: 6 }).color(0x8a4e34).at(x, y + 0.025, z);
  [0, 60, 120].forEach((yaw, i) => kit.box({ w: 0.08, h: 0.06 + i * 0.02, d: 0.01 }).color(0x3e4a30).at(x, y + 0.11, z).rotY(yaw));
  kit.box({ w: 0.03, h: 0.03, d: 0.03 }).color(0x7a2a24).at(x + 0.02, y + 0.2, z);
}

/** A blue enamel kettle on the back plate, and a tea towel over the stove's rail. */
function kettle(kit: LevelKit): void {
  const x = WEST + 0.32;
  const z = STOVE.z - 0.2;
  const top = 0.882;
  kit.cylinder({ r: 0.09, h: 0.13, sides: 8 }).color(0x4e5a66).at(x, top, z);
  kit.cylinder({ r: 0.05, h: 0.03, sides: 8 }).color(0x46525c).at(x, top + 0.13, z);
  kit.box({ w: 0.12, h: 0.025, d: 0.025 }).color(0x46525c).at(x + 0.1, top + 0.08, z).object.rotation.z = 0.6;
  kit.box({ w: 0.015, h: 0.08, d: 0.12 }).color(0x1e1d1b).at(x, top + 0.15, z);
  // The towel hangs over the rail on the front of the stove.
  kit.box({ w: 0.02, h: 0.34, d: 0.22 }).color(0x9a8a76).at(WEST + 0.67, 0.4, STOVE.z - 0.1);
  kit.box({ w: 0.022, h: 0.03, d: 0.22 }).color(0x6a3a30).at(WEST + 0.67, 0.48, STOVE.z - 0.1);
}

/** Sugar and coffee in cream tins, at the right end of the counter. */
function canisters(kit: LevelKit): void {
  [0.55, 0.67].forEach((x, i) => {
    kit.cylinder({ r: 0.05, h: 0.16 - i * 0.03, sides: 8 }).color(0xbab09a).at(x, COUNTER.h, NORTH + 0.12);
    kit.cylinder({ r: 0.051, h: 0.02, sides: 8 }).color(0x4e5e6a).at(x, COUNTER.h + 0.09 - i * 0.03, NORTH + 0.12);
  });
}

/** A bowl of apples from the tree behind the house, on the dresser between the cups. */
function apples(kit: LevelKit): void {
  const x = WEST + 0.28;
  const z = DRESSER.z;
  kit.cylinder({ r: 0.1, h: 0.05, sides: 8 }).color(0x9a9282).at(x, 0.94, z);
  [
    [0, 0, 0x7a3a2a],
    [0.05, 0.04, 0x8a7a3a],
    [-0.04, 0.04, 0x6e3424],
  ].forEach(([dx, dz, color]) => kit.cylinder({ r: 0.035, h: 0.055, sides: 6 }).color(color!).at(x + dx!, 0.97, z + dz!));
}

/** A cast-iron radiator under the south wall, painted cream like the walls. */
function radiator(kit: LevelKit): void {
  const { x, z } = RADIATOR;
  const length = 1;
  Array.from({ length: 10 }, (_, i) => kit.box({ w: 0.06, h: 0.56, d: 0.08 }).color(0x9e9682).at(x - length / 2 + 0.05 + i * 0.1, 0.14, z));
  [0.16, 0.66].forEach((y) => kit.box({ w: length, h: 0.04, d: 0.05 }).color(0x8a836e).at(x, y, z));
  kit.barrier({ w: length, d: 0.2 }).at(x, 0, z);
}
