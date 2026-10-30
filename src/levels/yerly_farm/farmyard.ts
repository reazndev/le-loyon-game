import type { Placed } from '../../game/kit/builders';
import type { LevelKit } from '../../game/kit/levelKit';
import { house, palette, woodpile, wallHeight } from '../village_square/houses';
import { fountain, milkCan, tractor } from '../village_square/props';
import { road } from '../village_square/road';
import { BARN, farmRoad, HENHOUSE, HOUSE, MANURE, SHED, STALL } from './layout';

/**
 * The Yerly farmyard: the house and the cowshed in one long building under one roof, the open
 * stall at the end, the manure heap in front as on every Fribourg farm, the henhouse and its run,
 * the tool shed, the trough, and the milk cans out by the road for the morning pickup.
 */

export function yard(kit: LevelKit, night: boolean): void {
  kit.plane({ w: 38, d: 16, cell: 1 }).texture('gravel_path', { tile: 2.2 }).color(0x8e8a80).at(1, 0.02, 4).walkable('gravel');
  road(kit, farmRoad, { width: 5, texture: 'asphalt', tile: 4, color: 0x86867e, lift: 0.04 });

  house(kit, {
    w: HOUSE.w,
    d: HOUSE.d,
    floors: 2,
    front: [-2.6, 0.2, 2.8],
    sides: [-2.8, 2.6],
    doors: [0.2],
    wall: palette.renderWarm,
    shutter: palette.shutterGreen,
    roofHeight: 4.6,
    // The kitchen window is lit from the afternoon on; at night only the kitchen.
    window: ({ face, floor, col }) => (face === 'front' && floor === 0 && col === 2 ? 'lit' : night && floor === 0 ? 'shut' : 'dark'),
    glow: night,
  }).at(HOUSE.x, 0, HOUSE.z);
  cowshed(kit);
  stall(kit);
  manureHeap(kit);
  fountain(kit).at(-1.5, 0, 4.6).rotY(90);
  woodpile(kit, 4.5).at(HOUSE.x - 1, 0, HOUSE.z - HOUSE.d / 2 - 0.4).rotY(180);
  woodpile(kit, 3).at(HOUSE.x - HOUSE.w / 2 - 0.4, 0, HOUSE.z + 1.5).rotY(-90);
  tractor(kit).at(11.5, 0, 6.8).rotY(-120);
  // The milk stand by the road, cans waiting for the lorry.
  kit.box({ w: 2.4, h: 0.85, d: 1.2 }).texture('concrete_floor', { tile: 1.5 }).color(0x8e8c86).at(22, 0, 15.2).collider();
  [-0.7, 0, 0.7].forEach((dx, i) => milkCan(kit, i * 50).at(22 + dx, 0.85, 15.2));
}

/** The cowshed: stone below where the cows stand, grey boards above for the hay, the barn door. */
function cowshed(kit: LevelKit): void {
  const front = BARN.z + BARN.d / 2;
  house(kit, {
    w: BARN.w,
    d: BARN.d,
    floors: 2,
    front: [],
    walls: 'boards',
    gable: 'boards',
    roofHeight: 4.6 * (BARN.d / HOUSE.d),
  }).at(BARN.x, 0, BARN.z);
  // The stable wall, masonry to head height, with small windows and the half door.
  kit.box({ w: BARN.w + 0.06, h: 2.6, d: 0.1 }).texture('render_wall', { tile: 2.5 }).color(palette.renderGrey).at(BARN.x, 0, front + 0.02);
  [-4.6, -2.2, 3.2].forEach((dx) => kit.box({ w: 0.8, h: 0.55, d: 0.04 }).color(0x1c1b18).at(BARN.x + dx, 1.5, front + 0.08));
  kit.box({ w: 1.3, h: 2.2, d: 0.04 }).color(0x0e0d0b).at(BARN.x + 0.4, 0, front + 0.08);
  kit.box({ w: 1.3, h: 1.1, d: 0.06 }).texture('wood_planks', { tile: 1 }).color(0x6a5644).at(BARN.x + 0.4, 0, front + 0.1);
  // The threshing-floor door, big enough for a hay wagon.
  kit.box({ w: 3.6, h: 3.8, d: 0.08 }).texture('wood_planks', { tile: 1.8 }).color(0x5a4c40).at(BARN.x + 4.6, 2.6, front + 0.1);
  kit.box({ w: 0.08, h: 3.8, d: 0.1 }).color(0x3a3028).at(BARN.x + 4.6, 2.6, front + 0.14);
}

/** The open stall on the barn's end: a roof on posts, a rail, the cows in the dry. */
function stall(kit: LevelKit): void {
  const roofY = wallHeight(2) - 1.2;
  [-1, 1].forEach((side) =>
    kit.box({ w: 0.2, h: roofY, d: 0.2 }).texture('bark_spruce', { tile: 0.6 }).color(0x6a5e52).at(STALL.x + STALL.w / 2 - 0.2, 0, STALL.z + (side * STALL.d) / 2).collider(),
  );
  kit.box({ w: STALL.w + 0.6, h: 0.14, d: STALL.d + 0.8 }).texture('roof_tiles', { tile: 2 }).color(palette.roofDark).at(STALL.x, roofY, STALL.z);
  kit.plane({ w: STALL.w, d: STALL.d, cell: 1 }).texture('mud', { tile: 2 }).color(0x5a5248).at(STALL.x, 0.03, STALL.z);
  // The rail across the open side, with a gap the reporter can lead a heifer through.
  kit.box({ w: 0.08, h: 0.08, d: STALL.d * 0.6 }).color(0x6a5e52).at(STALL.x + STALL.w / 2 - 0.2, 1.0, STALL.z - STALL.d * 0.2);
  kit.barrier({ w: 0.3, d: STALL.d * 0.6 }).at(STALL.x + STALL.w / 2 - 0.2, 0, STALL.z - STALL.d * 0.2);
  kit.box({ w: STALL.w, h: 1.1, d: 0.08 }).texture('wood_planks', { tile: 1.5 }).color(0x6a5e52).at(STALL.x, 0, STALL.z - STALL.d / 2).collider();
}

/** The manure heap, squared off inside its low concrete wall. */
function manureHeap(kit: LevelKit): void {
  kit.box({ w: 5, h: 0.6, d: 0.2 }).texture('concrete_floor', { tile: 1.5 }).color(0x7e7c76).at(MANURE.x, 0, MANURE.z - 1.6).collider();
  [-1, 1].forEach((side) => kit.box({ w: 0.2, h: 0.6, d: 3.2 }).texture('concrete_floor', { tile: 1.5 }).color(0x7e7c76).at(MANURE.x + side * 2.5, 0, MANURE.z).collider());
  kit.box({ w: 4.8, h: 0.7, d: 3 }).texture('mud', { tile: 1.2 }).color(0x4a3e30).at(MANURE.x, 0, MANURE.z).collider();
  kit.gable({ w: 4.6, d: 2.8, h: 0.5 }).texture('mud', { tile: 1.2 }).color(0x463a2c).at(MANURE.x, 0.7, MANURE.z);
}

export interface Hen {
  body: Placed;
  head: Placed;
}

/** The henhouse on its posts, a ramp, and a run of wire with hens in it. */
export function henhouse(kit: LevelKit): Hen[] {
  const { x, z } = HENHOUSE;
  kit
    .group((g) => {
      [-0.9, 0.9].forEach((dx) => [-0.7, 0.7].forEach((dz) => g.box({ w: 0.1, h: 0.6, d: 0.1 }).color(0x4a4038).at(dx, 0, dz)));
      g.box({ w: 2.1, h: 1.4, d: 1.7 }).texture('wood_planks', { tile: 1.2 }).color(0x7a6a58).at(0, 0.6, 0).collider();
      g.gable({ w: 2.5, d: 2.1, h: 0.6 }).texture('roof_shingles', { tile: 1 }).color(0x4e4a46).at(0, 2.0, 0).doubleSided();
      g.box({ w: 0.3, h: 0.35, d: 0.04 }).color(0x141210).at(0.5, 0.65, 0.86);
      g.box({ w: 0.3, h: 0.04, d: 1 }).texture('wood_planks', { tile: 0.6 }).color(0x6a5a48).at(0.5, 0.3, 1.3);
    })
    .at(x, 0, z - 2);
  // The run: wire on posts on three sides; the henhouse closes the fourth.
  const run = { w: 6, d: 4.6 };
  [
    [0, run.d / 2, run.w, 0],
    [-run.w / 2, 0, run.d, 90],
    [run.w / 2, 0, run.d, 90],
  ].forEach(([dx, dz, w, yaw]) => {
    kit.box({ w: w!, h: 1.2, d: 0.03 }).texture('iron_fence', { tile: [0.6, 0.6] }).cutout().doubleSided().color(0x8a8a84).at(x + dx!, 0, z + dz!).rotY(yaw!);
    kit.barrier({ w: yaw ? 0.3 : w!, d: yaw ? w! : 0.3 }).at(x + dx!, 0, z + dz!);
  });
  kit.plane({ w: run.w, d: run.d, cell: 1 }).texture('mud', { tile: 1.5 }).color(0x6a6052).at(x, 0.025, z);

  const spots = [
    [-1.6, 0.4, 0xd8d0c0],
    [-0.4, 1.3, 0x8a5a3a],
    [1.2, 0.2, 0xd0c8b8],
    [2.1, 1.4, 0x7a4a2e],
    [0.4, -0.9, 0xc8c0b0],
  ];
  return spots.map(([dx, dz, color], i) => {
    const parts: { head?: Placed } = {};
    const body = kit
      .group((h) => {
        h.box({ w: 0.2, h: 0.2, d: 0.3 }).color(color!).at(0, 0.1, 0);
        h.box({ w: 0.14, h: 0.12, d: 0.08 }).color(color!).at(0, 0.24, -0.16);
        parts.head = h.group((head) => {
          head.box({ w: 0.08, h: 0.1, d: 0.09 }).color(color!).at(0, 0, 0);
          head.box({ w: 0.03, h: 0.05, d: 0.05 }).color(0xa02a20).at(0, 0.09, 0.01);
          head.box({ w: 0.03, h: 0.03, d: 0.04 }).color(0xb89040).at(0, 0.04, 0.06);
        }).at(0, 0.28, 0.18);
      })
      .at(x + dx!, 0, z + dz!)
      .rotY(i * 73);
    return { body, head: parts.head! };
  });
}

/** The tool shed, open to the yard, with the shovel on the left (bernard_shovel). Returns the shovel. */
export function toolShed(kit: LevelKit): Placed {
  const parts: { shovel?: Placed } = {};
  kit
    .group((g) => {
      g.box({ w: 0.12, h: 2.3, d: 3 }).texture('wood_planks', { tile: 1.2 }).color(0x6e5e4e).at(-1.2, 0, 0).collider();
      [-1, 1].forEach((side) => g.box({ w: 2.4, h: 2.3, d: 0.12 }).texture('wood_planks', { tile: 1.2 }).color(0x6a5a4a).at(0, 0, side * 1.45).collider());
      g.box({ w: 2.9, h: 0.12, d: 3.5 }).texture('roof_shingles', { tile: 1 }).color(0x4e4a46).at(-0.1, 2.3, 0);
      g.plane({ w: 2.3, d: 2.8, cell: 0.7 }).texture('wood_floor', { tile: 1 }).color(0x4a4036).at(0, 0.03, 0);
      // Tools hung on the back wall: a hay fork, a rake, a scythe.
      [
        [-0.8, 0x6a5a40],
        [-0.3, 0x5e5038],
        [0.5, 0x6a5a40],
      ].forEach(([dz, c], i) => {
        g.box({ w: 0.04, h: 1.6, d: 0.04 }).color(c!).at(-1.1, 0.5, dz!);
        g.box({ w: 0.03, h: 0.06, d: i === 2 ? 0.7 : 0.35 }).color(0x4a4a48).at(-1.1, i === 2 ? 2.0 : 2.05, dz! + (i === 2 ? 0.3 : 0));
      });
      // The shovel, leaning against the left wall: ash handle, a blade sharpened with a file.
      parts.shovel = g.group((s) => {
        s.box({ w: 0.035, h: 1.15, d: 0.035 }).color(0x9a8a6a).at(0, 0.32, 0);
        s.box({ w: 0.2, h: 0.28, d: 0.02 }).color(0x6a6a66).at(0, 0.02, 0);
        s.box({ w: 0.14, h: 0.03, d: 0.03 }).color(0x8a7a5a).at(0, 1.45, 0);
      }).at(-0.5, 0.05, 1.3);
      parts.shovel.object.rotation.x = 0.18;
      g.box({ w: 0.8, h: 0.5, d: 0.5 }).texture('wood_planks', { tile: 0.6 }).color(0x5e4e3e).at(-0.6, 0, -0.9).collider();
    })
    .at(SHED.x, 0, SHED.z);
  return parts.shovel!;
}
