import type { LevelKit } from '../../game/kit/levelKit';
import { WALL } from '../inn/interior';
import { ashtray } from '../laiterie/clutter';
import { BENCH, ROOM } from './layout';

/**
 * The rest of a working garage: the shelf of oils and filters, tins over the pegboard, the jack,
 * hubcaps on the wall, the clock, the cork board of invoices, and what is left on the bench. All
 * of it is still, so it goes in the scene's batch.
 */

const NORTH = ROOM.z0 + WALL / 2;
const SOUTH = ROOM.z1 - WALL / 2;
const EAST = ROOM.x1 - WALL / 2;
const WEST = ROOM.x0 + WALL / 2;

/** The workshop clock over the bench, facing the bays. */
export const CLOCK = { x: 1.2, y: 2.55, z: NORTH };
/** Yannick's lunch, half eaten, on the bench. The flies have found it. */
export const SANDWICH = { x: BENCH.x - 0.75, y: BENCH.h, z: BENCH.z + 0.18 };

/** Oil cans in the colors they had then, faded under the dust. */
const OILS = [0x3e5a3a, 0x8a7a3a, 0x6a2e26, 0x3a4a5e, 0x5a5a52];

export function buildClutter(kit: LevelKit): void {
  oilShelf(kit);
  overThePegboard(kit);
  onTheBench(kit);
  clock(kit);
  invoices(kit);
  hubcaps(kit);
  trolleyJack(kit, 3.05, 0.75);
  floorThings(kit);
}

/** Steel shelving on the east wall: oil cans, filter boxes, a jerrycan, spark plug cartons. */
function oilShelf(kit: LevelKit): void {
  const depth = 0.4;
  const length = 2;
  const x = EAST - depth / 2;
  const z = -1.55;
  const boards = [0.15, 0.6, 1.05, 1.5];
  [-1, 1].forEach((side) => kit.box({ w: depth, h: 1.8, d: 0.04 }).color(0x3e4644).at(x, 0, z + (side * length) / 2));
  boards.forEach((y, row) => {
    kit.box({ w: depth, h: 0.025, d: length }).texture('rust_metal', { tile: 0.8 }).color(0x4e5652).at(x, y, z);
    const top = y + 0.025;
    if (row === 0) {
      kit.box({ w: 0.16, h: 0.36, d: 0.32 }).color(0x4a5a3a).at(x, top, z - 0.6);
      kit.box({ w: 0.3, h: 0.22, d: 0.5 }).color(0x6a604a).at(x, top, z + 0.3);
      return;
    }
    Array.from({ length: 9 - row }, (_, i) => {
      const dz = -length / 2 + 0.16 + i * ((length - 0.3) / (8 - row));
      if ((i + row) % 3 === 0) kit.box({ w: 0.14, h: 0.12, d: 0.14 }).color(0x6a6458 - row * 0x060606).at(x + 0.04, top, z + dz);
      else kit.cylinder({ r: 0.06, h: 0.22, sides: 6 }).color(OILS[(i * 2 + row) % OILS.length]!).at(x + 0.03, top, z + dz);
    });
  });
  kit.barrier({ w: depth + 0.05, d: length }).at(x, 0, z);
}

/** A plank shelf over the pegboard with paint tins, grease, and jars of screws. */
function overThePegboard(kit: LevelKit): void {
  const x = BENCH.x - 0.55;
  const y = 1.98;
  const z = NORTH + 0.12;
  kit.box({ w: 1.7, h: 0.025, d: 0.22 }).texture('wood_planks', { tile: 0.8 }).color(0x5e5040).at(x, y, z);
  [-0.7, 0.7].forEach((dx) => kit.box({ w: 0.03, h: 0.14, d: 0.18 }).color(0x3c3c3a).at(x + dx, y - 0.14, z));
  const things: [dx: number, r: number, h: number, color: number][] = [
    [-0.72, 0.07, 0.12, 0x5a6a5a],
    [-0.56, 0.07, 0.12, 0x7a6a4a],
    [-0.4, 0.05, 0.1, 0x3a3a36],
    [-0.2, 0.045, 0.13, 0x6e6c60],
    [-0.08, 0.045, 0.13, 0x6e6c60],
    [0.04, 0.045, 0.11, 0x6e6c60],
    [0.28, 0.08, 0.16, 0x6a3a2c],
    [0.5, 0.06, 0.2, 0x4a5a6a],
  ];
  things.forEach(([dx, r, h, color]) => kit.cylinder({ r, h, sides: 6 }).color(color).at(x + dx, y + 0.025, z));
}

/** A cold coffee, an ashtray, spanners put down, and the sandwich. */
function onTheBench(kit: LevelKit): void {
  const { x, z, h } = BENCH;
  kit.cylinder({ r: 0.04, h: 0.09, sides: 6 }).color(0x8a8270).at(x - 0.95, h, z - 0.15);
  kit.cylinder({ r: 0.032, h: 0.091, sides: 6 }).color(0x1e140e).at(x - 0.95, h + 0.001, z - 0.15);
  ashtray(kit, x + 0.02, h, z + 0.24);
  [0.2, 0.17, 0.14].forEach((length, i) => kit.box({ w: length, h: 0.012, d: 0.025 }).color(0x5c5c5e).at(x + 0.62 + i * 0.05, h, z + 0.2 - i * 0.04).rotY(-15 + i * 22));
  const s = SANDWICH;
  kit.box({ w: 0.24, h: 0.004, d: 0.2 }).color(0xb4ae9c).at(s.x, s.y, s.z).rotY(-12);
  kit.box({ w: 0.13, h: 0.05, d: 0.07 }).color(0x9a6a3a).at(s.x + 0.02, s.y + 0.004, s.z).rotY(20);
}

/** A round workshop clock with a cream face. Its second hand is the scene's. */
function clock(kit: LevelKit): void {
  const { x, y, z } = CLOCK;
  kit.cylinder({ r: 0.22, h: 0.06, sides: 12 }).color(0x2e302e).at(x, y, z).object.rotation.x = Math.PI / 2;
  kit.cylinder({ r: 0.19, h: 0.065, sides: 12 }).color(0xc8c0a8).at(x, y, z).object.rotation.x = Math.PI / 2;
  kit.box({ w: 0.014, h: 0.15, d: 0.006 }).color(0x161616).at(x, y, z + 0.036).object.rotation.z = 1.05;
  kit.box({ w: 0.016, h: 0.1, d: 0.006 }).color(0x161616).at(x, y, z + 0.038).object.rotation.z = -2.1;
  [0, 1, 2, 3].forEach((i) => kit.box({ w: 0.012, h: 0.03, d: 0.004 }).color(0x3a3a38).at(x + Math.sin((i * Math.PI) / 2) * 0.16, y + Math.cos((i * Math.PI) / 2) * 0.16 - 0.015, z + 0.034));
}

/** A cork board by the side door: invoices, a tyre price list, and a card for winter tyres. */
function invoices(kit: LevelKit): void {
  const x = 2.4;
  const y = 1.25;
  const z = SOUTH - 0.015;
  kit.box({ w: 0.8, h: 0.6, d: 0.03 }).color(0x7e6040).at(x, y, z);
  const papers: [dx: number, dy: number, w: number, h: number, color: number, tilt: number][] = [
    [-0.25, 0.3, 0.18, 0.24, 0xc8c2ae, 0.04],
    [-0.05, 0.32, 0.16, 0.22, 0xd2ccb6, -0.03],
    [0.2, 0.28, 0.22, 0.28, 0xbcb6a2, 0.02],
    [-0.22, 0.04, 0.2, 0.15, 0xc4c69a, -0.05],
    [0.02, 0.06, 0.14, 0.18, 0xd0c8b0, 0.06],
    [0.24, 0.05, 0.14, 0.1, 0xa8b4b8, 0],
  ];
  papers.forEach(([dx, dy, w, h, color, tilt]) => {
    kit.box({ w, h, d: 0.004 }).color(color).at(x + dx, y + dy, z - 0.017).object.rotation.z = tilt;
    kit.box({ w: 0.012, h: 0.012, d: 0.008 }).color(0x8a2a22).at(x + dx, y + dy + h - 0.025, z - 0.021);
  });
}

/** Three hubcaps hung on nails on the west wall, from cars long scrapped. */
function hubcaps(kit: LevelKit): void {
  [-2.35, -2.85, -3.35].forEach((z, i) => {
    const cap = kit.cylinder({ r: 0.17 - i * 0.015, h: 0.03, sides: 10 }).color([0x7a7c78, 0x6a6c68, 0x8a8a84][i]!).at(WEST + 0.015, 1.95 - i * 0.04, z);
    cap.object.rotation.z = Math.PI / 2;
  });
}

/** A red trolley jack left beside the lift, its handle down on the floor. */
function trolleyJack(kit: LevelKit, x: number, z: number): void {
  kit.box({ w: 0.24, h: 0.12, d: 0.56 }).texture('rust_metal', { tile: 0.4 }).color(0x6a2a22).at(x, 0.04, z).collider();
  kit.cylinder({ r: 0.06, h: 0.04, sides: 8 }).color(0x3a3a38).at(x, 0.16, z - 0.24);
  [-1, 1].forEach((side) => [-0.2, 0.22].forEach((dz) => (kit.cylinder({ r: 0.045, h: 0.03, sides: 6 }).color(0x1a1a1a).at(x + side * 0.13, 0.045, z + dz).object.rotation.z = Math.PI / 2)));
  kit.box({ w: 0.03, h: 0.03, d: 1.0 }).color(0x5a2420).at(x, 0.06, z + 0.75).object.rotation.x = 0.1;
}

/** A battery on the floor by the bench, a bucket of sawdust by the pit, oil cans by the drums. */
function floorThings(kit: LevelKit): void {
  const bx = BENCH.x + BENCH.w / 2 + 0.25;
  const bz = BENCH.z;
  kit.box({ w: 0.26, h: 0.2, d: 0.17 }).color(0x1c1c1e).at(bx, 0, bz);
  [-0.08, 0.08].forEach((dx, i) => kit.cylinder({ r: 0.015, h: 0.025, sides: 4 }).color(i ? 0x6a2a22 : 0x2a2a2a).at(bx + dx, 0.2, bz));
  kit.cylinder({ r: 0.15, h: 0.3, sides: 8 }).texture('rust_metal', { tile: 0.5 }).color(0x5a5c58).at(-0.62, 0, 1.0).collider();
  kit.cylinder({ r: 0.135, h: 0.01, sides: 8 }).color(0x8a7650).at(-0.62, 0.27, 1.0);
  [
    [3.85, -4.55],
    [3.98, -4.75],
    [3.75, -4.78],
  ].forEach(([x, z], i) => kit.cylinder({ r: 0.08, h: 0.24, sides: 6 }).color(OILS[i]!).at(x!, 0, z!));
}
