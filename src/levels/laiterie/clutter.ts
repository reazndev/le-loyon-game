import type { LevelKit } from '../../game/kit/levelKit';
import { WALL } from '../inn/interior';
import { ROOM, SHOP_COUNTER, SHOP_WINDOW, SIDE_WINDOW } from './layout';

/**
 * What a shop gathers over thirty years: the window display nobody has changed, washing powder
 * on the bottom shelf, crates of empties by the door, the radiator, and an ashtray on the counter.
 * All of it is still, so it goes in the scene's batch.
 */

const EAST_SHELF_X = ROOM.x1 - WALL / 2 - 0.2;
/** The radiator under the side window, for its knocking. */
export const RADIATOR = { x: ROOM.x0 + WALL / 2 + 0.07, y: 0.5, z: SIDE_WINDOW.z };
/** Where the dust hangs in the light from the shop window. */
export const WINDOW_LIGHT = { x: SHOP_WINDOW.x, y: 1.4, z: ROOM.z1 - 1 };

export function buildClutter(kit: LevelKit): void {
  windowDisplay(kit);
  washingPowder(kit);
  emptiesCrates(kit);
  radiator(kit);
  ashtray(kit, SHOP_COUNTER.x + 0.35, SHOP_COUNTER.h, SHOP_COUNTER.z + 0.22);
}

/** A pyramid of tins and a sun-bleached card on the sill inside the shop window, and dead flies. */
function windowDisplay(kit: LevelKit): void {
  const z = ROOM.z1 - WALL / 2 - 0.13;
  const sill = SHOP_WINDOW.y - 0.03;
  kit.box({ w: SHOP_WINDOW.w + 0.1, h: 0.03, d: 0.26 }).texture('wood_planks', { tile: 0.8 }).color(0x5a4634).at(SHOP_WINDOW.x, sill, z);
  const top = SHOP_WINDOW.y;
  [4, 3, 2, 1].forEach((count, row) =>
    Array.from({ length: count }, (_, i) =>
      kit
        .cylinder({ r: 0.04, h: 0.1, sides: 6 })
        .color(row % 2 ? 0x8a6a3a : 0x7a3a2e)
        .at(SHOP_WINDOW.x - 0.45 + (i - (count - 1) / 2) * 0.085, top + row * 0.1, z),
    ),
  );
  // A card for Ovomaltine, faded to the color of weak tea, leaning on the glass.
  kit.box({ w: 0.34, h: 0.26, d: 0.01 }).color(0xa08e6a).at(SHOP_WINDOW.x + 0.3, top, z + 0.06).object.rotation.x = 0.18;
  kit.box({ w: 0.26, h: 0.07, d: 0.012 }).color(0x6a5040).at(SHOP_WINDOW.x + 0.3, top + 0.15, z + 0.035).object.rotation.x = 0.18;
  [-0.1, 0.05, 0.62].forEach((dx, i) => kit.box({ w: 0.012, h: 0.006, d: 0.008 }).color(0x141210).at(SHOP_WINDOW.x + dx, top, z - 0.04 + i * 0.03).rotY(i * 50));
}

/** Boxes of washing powder in the gaps on the bottom board of the east shelves. */
function washingPowder(kit: LevelKit): void {
  const colors = [0x8e9a7e, 0x7a4a34, 0x4e6276, 0xa49c88, 0x8e9a7e, 0x4e6276];
  [-0.42, -0.22, 0.55, 1.25, 1.95, 2.14].forEach((z, i) => kit.box({ w: 0.13, h: 0.24 + (i % 2) * 0.04, d: 0.17 }).color(colors[i]!).at(EAST_SHELF_X + 0.03, 0.145, z));
}

/** Two crates of empty mineral water bottles stacked by the door, waiting for the lorry. */
function emptiesCrates(kit: LevelKit): void {
  const x = ROOM.x1 - WALL / 2 - 0.3;
  const z = ROOM.z1 - WALL / 2 - 0.22;
  [0, 0.28].forEach((y, i) => kit.box({ w: 0.42, h: 0.27, d: 0.32 }).color(i ? 0x6a3428 : 0x5e3024).at(x, y, z).rotY(i * 4));
  kit.barrier({ w: 0.46, d: 0.36 }).at(x, 0, z);
  Array.from({ length: 12 }, (_, i) =>
    kit
      .cylinder({ r: 0.025, h: 0.09, sides: 5 })
      .color(0x3a4a3a)
      .at(x - 0.15 + (i % 4) * 0.1, 0.55, z - 0.1 + Math.floor(i / 4) * 0.1),
  );
}

/** A cast-iron radiator under the side window, painted the color of the tiles long ago. */
function radiator(kit: LevelKit): void {
  const { x, z } = RADIATOR;
  const length = 0.9;
  Array.from({ length: 9 }, (_, i) => kit.box({ w: 0.09, h: 0.58, d: 0.06 }).color(0x6e6c62).at(x, 0.14, z - length / 2 + 0.05 + i * 0.1));
  kit.box({ w: 0.05, h: 0.05, d: length }).color(0x62605a).at(x, 0.66, z);
  kit.box({ w: 0.05, h: 0.05, d: length }).color(0x62605a).at(x, 0.18, z);
  kit.cylinder({ r: 0.02, h: 0.14, sides: 5 }).color(0x5a5a54).at(x, 0, z + length / 2 + 0.03);
  // The sill above it, with a dead geranium nobody has thrown out.
  kit.box({ w: 0.22, h: 0.03, d: SIDE_WINDOW.w + 0.1 }).color(0x9a968a).at(x + 0.05, SIDE_WINDOW.y - 0.03, z);
  kit.cylinder({ r: 0.06, h: 0.1, sides: 6 }).color(0x7a4a30).at(x + 0.06, SIDE_WINDOW.y, z + 0.3);
  [0, 70, 140].forEach((yaw) => kit.box({ w: 0.01, h: 0.12, d: 0.05 }).color(0x4a4230).at(x + 0.06, SIDE_WINDOW.y + 0.1, z + 0.3).rotY(yaw));
}

/** A glass ashtray with a few butts in it. Christine smokes Parisienne when the shop is empty. */
export function ashtray(kit: LevelKit, x: number, y: number, z: number): void {
  kit.cylinder({ r: 0.055, h: 0.022, sides: 8 }).color(0x6a6e64).at(x, y, z);
  kit.cylinder({ r: 0.04, h: 0.023, sides: 8 }).color(0x2a2a26).at(x, y + 0.001, z);
  [0, 70, 150].forEach((yaw, i) => {
    const a = (yaw * Math.PI) / 180;
    kit.box({ w: 0.035, h: 0.009, d: 0.009 }).color(i === 1 ? 0xa06a3a : 0xc8c2b0).at(x + 0.015 * Math.cos(a), y + 0.024, z - 0.015 * Math.sin(a)).rotY(yaw + 20);
  });
}
