import type { LevelKit } from '../../game/kit/levelKit';
import { fogWindow } from '../../game/kit/windows';
import { wall, type Finish } from '../inn/interior';
import { BAY_DOOR, DOOR, PIT, PIT_EDGES, ROOM } from './layout';

/** The walls, floor, pit, ceiling, bay doors, windows, and strip lights of the workshop. */

/** Grey-green paint over render, with a darker oily band where hands and bumpers touch it. */
const PAINTED: Finish = {
  texture: 'render_wall',
  tile: 1.8,
  color: 0x8a8e86,
  dado: { texture: 'concrete_bunker', color: 0x5c5e56, h: 1.2, tile: 1.4 },
};
const FLOOR = 0x7c7a74;
const STAIN = 0x4e4c48;

export function buildShell(kit: LevelKit, night: boolean): void {
  const { x0, x1, z0, z1, h } = ROOM;
  kit.ground('stone', 0);

  wall(kit, [x0, z1], [x1, z1], h, PAINTED, [
    { at: BAY_DOOR.x - x0, w: BAY_DOOR.w, h: BAY_DOOR.h },
    { at: DOOR.x - x0, w: DOOR.w, h: DOOR.h },
  ]);
  wall(kit, [x0, z1], [x0, z0], h, PAINTED, [
    { at: z1 - 1.2, w: 1.3, h: 0.9, y: 1.5 },
    { at: z1 - 3.6, w: 1.3, h: 0.9, y: 1.5 },
  ]);
  wall(kit, [x1, z1], [x1, z0], h, PAINTED, [{ at: z1 - 1.4, w: 1.3, h: 0.8, y: 1.8 }]);
  wall(kit, [x0, z0], [x1, z0], h, PAINTED);

  fogWindow(kit, { x: x0, z: 1.2, facing: -90, w: 1.3, h: 0.9, y: 1.5, night });
  fogWindow(kit, { x: x0, z: -1.2, facing: -90, w: 1.3, h: 0.9, y: 1.5, night });
  fogWindow(kit, { x: x1, z: 1.4, facing: 90, w: 1.3, h: 0.8, y: 1.8, night });

  floorAroundPit(kit);
  pit(kit);
  stains(kit);

  kit.ceiling({ w: x1 - x0, d: z1 - z0, cell: 1 }).texture('concrete_bunker', { tile: 2.4 }).color(0x5e605c).at(0, h, (z0 + z1) / 2);
  [-4.2, -1.4, 1.4].forEach((z) => kit.box({ w: x1 - x0, h: 0.24, d: 0.14 }).texture('rust_metal', { tile: 1.2 }).color(0x4a4a46).at(0, h - 0.24, z));

  bayDoors(kit, night);
}

/** Concrete everywhere but the pit, in four slabs around the slot. */
function floorAroundPit(kit: LevelKit): void {
  const { x0, x1, z0, z1 } = ROOM;
  const e = PIT_EDGES;
  const slab = (ax: number, bx: number, az: number, bz: number, y = 0) =>
    kit
      .plane({ w: bx - ax, d: bz - az, cell: 0.6 })
      .texture('concrete_floor', { tile: 1.6 })
      .color(FLOOR)
      .at((ax + bx) / 2, y, (az + bz) / 2);
  slab(x0, e.x0, z0, z1);
  slab(e.x1, x1, z0, z1);
  // The end slabs run a little under the side ones, so vertex snapping opens no cracks between.
  slab(e.x0 - 0.3, e.x1 + 0.3, z0, e.z0, -0.004);
  slab(e.x0 - 0.3, e.x1 + 0.3, e.z1, z1, -0.004);
}

/**
 * The inspection pit: concrete sides, a step down at the street end, oily water on the floor,
 * and a painted lip. An invisible barrier keeps the player out, since the floor is flat to the
 * collision code.
 */
function pit(kit: LevelKit): void {
  const { w, d, depth } = PIT;
  const e = PIT_EDGES;
  const side = (sw: number, sd: number, x: number, z: number) =>
    kit.box({ w: sw, h: depth, d: sd, cell: 0.6 }).texture('concrete_bunker', { tile: 1.2 }).color(0x4e4e4a).at(x, -depth, z);
  side(0.1, d + 0.2, e.x0 - 0.05, PIT.z);
  side(0.1, d + 0.2, e.x1 + 0.05, PIT.z);
  side(w, 0.1, PIT.x, e.z0 - 0.05);
  side(w, 0.1, PIT.x, e.z1 + 0.05);
  kit.plane({ w, d, cell: 0.5 }).texture('concrete_floor', { tile: 1.2 }).color(0x2a2824).at(PIT.x, -depth, PIT.z);
  kit.plane({ w: w * 0.8, d: d * 0.5, cell: 0.5 }).color(0x16181a).at(PIT.x, -depth + 0.02, PIT.z - d * 0.15);
  // Two concrete steps down at the street end.
  [0, 1].forEach((i) =>
    kit
      .box({ w, h: depth - 0.45 * (i + 1), d: 0.3 })
      .texture('concrete_bunker', { tile: 1 })
      .color(0x585852)
      .at(PIT.x, -depth, e.z1 - 0.15 - 0.3 * i),
  );
  // The lip, painted yellow once.
  const lip = (lw: number, ld: number, x: number, z: number) => kit.box({ w: lw, h: 0.03, d: ld }).color(0x8a7c3a).at(x, 0, z);
  lip(0.08, d + 0.16, e.x0 - 0.04, PIT.z);
  lip(0.08, d + 0.16, e.x1 + 0.04, PIT.z);
  lip(w, 0.08, PIT.x, e.z0 - 0.04);
  lip(w, 0.08, PIT.x, e.z1 + 0.04);
  // Boards laid across the far end, where Gilles stands to reach the bench.
  [0, 1, 2].forEach((i) => kit.box({ w: w + 0.3, h: 0.04, d: 0.18 }).texture('wood_planks', { tile: 0.8 }).color(0x5a4c3c).at(PIT.x, 0.01, e.z0 + 0.12 + i * 0.21));
  kit.barrier({ w: w + 0.12, d: d - 0.5 }).at(PIT.x, 0, PIT.z + 0.32);
}

/** Old oil soaked into the concrete: under the lift, at the bench, and by the pit. */
function stains(kit: LevelKit): void {
  const spots: [number, number, number, number][] = [
    [2.3, -2.8, 1.1, 0.9],
    [2.1, -1.2, 0.8, 1.2],
    [-2.6, -5.0, 1.6, 0.6],
    [-0.9, 0.4, 0.4, 1.4],
    [-2.4, 2.4, 0.6, 0.8],
  ];
  spots.forEach(([x, z, w, d]) => kit.plane({ w, d, cell: 0.5 }).texture('concrete_floor', { tile: 1.6 }).color(STAIN).at(x, 0.004, z));
}

/**
 * The double bay doors, shut on a crack. The right leaf has dropped on its hinges and stands
 * a hand's width out, so a strip of fog shows down the middle.
 */
function bayDoors(kit: LevelKit, night: boolean): void {
  const { z1 } = ROOM;
  const leafW = BAY_DOOR.w / 2;
  const left = BAY_DOOR.x - leafW;
  const right = BAY_DOOR.x + leafW;
  const leaf = (g: LevelKit, x: number) => {
    g.box({ w: leafW, h: BAY_DOOR.h - 0.03, d: 0.07, cell: 0.8 }).texture('wood_planks', { tile: 1 }).color(0x5a6458).at(x, 0.02, 0);
    g.box({ w: leafW - 0.1, h: 0.12, d: 0.09 }).texture('wood_planks', { tile: 1 }).color(0x4a5248).at(x, 1.1, 0);
    g.box({ w: leafW - 0.1, h: 0.12, d: 0.09 }).texture('wood_planks', { tile: 1 }).color(0x4a5248).at(x, 2.5, 0);
  };
  kit.group((g) => leaf(g, leafW / 2)).at(left, 0, z1 - 0.02);
  kit.group((g) => leaf(g, -leafW / 2)).at(right, 0, z1 - 0.02).rotY(9);
  kit.box({ w: 0.05, h: 0.5, d: 0.05 }).color(0x2c2a28).at(BAY_DOOR.x - 0.1, 1.2, z1 - 0.08);
  kit.barrier({ w: BAY_DOOR.w + 0.2, d: 0.4 }).at(BAY_DOOR.x, 0, z1 - 0.1);

  // The street behind, pale fog by day and nothing at night.
  kit.box({ w: BAY_DOOR.w + 0.6, h: BAY_DOOR.h + 0.2, d: 0.05 }).color(night ? 0x07080b : 0xa2a8aa).unlit().at(BAY_DOOR.x, 0, z1 + 0.45);
  if (night) return;
  kit.glow(1.6, 0x2c3032).at(BAY_DOOR.x + 0.05, 1.4, z1 - 0.2);
  kit.light({ color: 0x8a949c, intensity: 0.7, range: 4 }).at(BAY_DOOR.x, 1.2, z1 - 0.9);
}
