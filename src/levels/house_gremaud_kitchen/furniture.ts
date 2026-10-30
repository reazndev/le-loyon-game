import type { Placed } from '../../game/kit/builders';
import type { LevelKit } from '../../game/kit/levelKit';
import { pendantLamp } from '../inn/interior';
import { CLOCK, COUNTER, DRESSER, FRIDGE, HER_CHAIR, NIGHT_LAMP, NORTH, PENDANT, ROOM, STOVE, TABLE, WEST, WINDOW } from './layout';

const PINE = 0x8a6a48;
const ENAMEL = 0xc6bea6;
const IRON = 0x1e1d1b;

/** The stove, the sink, the dresser, the fridge, the table and her chair, and the lamps. His chair moves, so the scene builds it. */
export function buildFurniture(kit: LevelKit, night: boolean): void {
  stove(kit);
  sink(kit);
  dresser(kit);
  fridge(kit);
  table(kit);
  chair(kit, HER_CHAIR.x, HER_CHAIR.z, HER_CHAIR.yaw);
  wallClock(kit);
  pendantLamp(kit, { x: PENDANT.x, y: ROOM.h, z: PENDANT.z }, { on: !night, intensity: 1.3, range: 5, drop: 0.28 });
  if (night) nightLamp(kit);
}

/** A cream enamel wood stove with a black top, a rail along the front, and its pipe into the wall. */
function stove(kit: LevelKit): void {
  const depth = 0.6;
  const x = WEST + depth / 2;
  kit.box({ w: depth, h: 0.84, d: 0.92 }).texture('tiles_white', { tile: 0.9 }).color(ENAMEL).at(x, 0, STOVE.z).collider();
  kit.box({ w: depth + 0.02, h: 0.03, d: 0.94 }).color(IRON).at(x, 0.84, STOVE.z);
  [-0.2, 0.2].forEach((dz) => kit.cylinder({ r: 0.1, h: 0.012, sides: 8 }).color(0x2c2b28).at(x + 0.02, 0.87, STOVE.z + dz));
  kit.box({ w: 0.02, h: 0.3, d: 0.4 }).color(0xa49c86).at(x + depth / 2 + 0.005, 0.32, STOVE.z + 0.18);
  kit.box({ w: 0.02, h: 0.22, d: 0.28 }).color(0x9a927c).at(x + depth / 2 + 0.005, 0.36, STOVE.z - 0.24);
  kit.box({ w: 0.02, h: 0.02, d: 0.9 }).color(0x9a9890).at(x + depth / 2 + 0.06, 0.74, STOVE.z);
  kit.cylinder({ r: 0.07, h: 0.95, sides: 6 }).color(0x2a2926).at(WEST + 0.14, 0.87, STOVE.z - 0.3);
  kit.box({ w: 0.16, h: 0.14, d: 0.14 }).color(0x2a2926).at(WEST + 0.06, 1.72, STOVE.z - 0.3);
  // The wood box beside it, full.
  const woodBox = STOVE.z + 0.7;
  kit.box({ w: 0.45, h: 0.4, d: 0.4 }).texture('wood_planks', { tile: 0.6 }).color(0x6a5440).at(WEST + 0.26, 0, woodBox).collider();
  [-0.1, 0, 0.1].forEach((dz, i) =>
    kit.cylinder({ r: 0.05, h: 0.36, sides: 5 }).texture('bark_spruce', { tile: 0.4 }).at(WEST + 0.44, 0.42, woodBox + dz).object.rotation.set(0, 0, Math.PI / 2 + i * 0.05),
  );
}

/** The counter under the window: cupboards, a steel sink with a drainer and one cup, and tiles. */
function sink(kit: LevelKit): void {
  const w = COUNTER.x1 - COUNTER.x0;
  const x = (COUNTER.x0 + COUNTER.x1) / 2;
  const z = NORTH + COUNTER.d / 2;
  kit.box({ w, h: COUNTER.h - 0.04, d: COUNTER.d }).texture('wood_planks', { tile: 0.7 }).color(PINE).at(x, 0, z).collider();
  kit.box({ w: w + 0.02, h: 0.04, d: COUNTER.d + 0.03 }).color(0x8c8e86).at(x, COUNTER.h - 0.04, z + 0.015);
  // Cupboard doors: thin dark seams between them.
  [-0.7, 0, 0.7].forEach((dx) => kit.box({ w: 0.015, h: 0.7, d: 0.01 }).color(0x3a2c20).at(x + dx, 0.08, NORTH + COUNTER.d + 0.002));
  kit.box({ w: 0.6, h: 0.02, d: 0.42 }).color(0x5c6264).at(WINDOW.x, COUNTER.h, z);
  kit.box({ w: 0.5, h: 0.005, d: 0.34 }).color(0x2e3234).at(WINDOW.x, COUNTER.h + 0.02, z);
  kit.cylinder({ r: 0.015, h: 0.28, sides: 5 }).color(0x9c9e98).at(WINDOW.x, COUNTER.h, NORTH + 0.08);
  kit.box({ w: 0.03, h: 0.025, d: 0.16 }).color(0x9c9e98).at(WINDOW.x, COUNTER.h + 0.26, NORTH + 0.15);
  kit.box({ w: 0.42, h: 0.02, d: 0.36 }).color(0x8a8e8c).at(WINDOW.x + 0.58, COUNTER.h, z);
  kit.cylinder({ r: 0.04, h: 0.08, sides: 6 }).color(0xc4c0b0).at(WINDOW.x + 0.62, COUNTER.h + 0.02, z + 0.03);
  kit.box({ w, h: WINDOW.y - COUNTER.h - 0.05, d: 0.02 }).texture('tiles_white', { tile: 0.45 }).color(0xb0b2a8).at(x, COUNTER.h, NORTH + 0.01);
}

/** The pine dresser on the west wall: cupboards below, open shelves of plates above. */
function dresser(kit: LevelKit): void {
  const depth = 0.48;
  const x = WEST + depth / 2;
  const { z, length } = DRESSER;
  kit.box({ w: depth, h: 0.9, d: length }).texture('wood_planks', { tile: 0.7 }).color(PINE).at(x, 0, z).collider();
  kit.box({ w: depth + 0.04, h: 0.04, d: length + 0.04 }).color(0x6e5238).at(x + 0.01, 0.9, z);
  kit.box({ w: 0.01, h: 0.72, d: 0.015 }).color(0x3a2c20).at(WEST + depth + 0.002, 0.1, z);
  const shelf = WEST + 0.14;
  kit.box({ w: 0.02, h: 1.1, d: length }).texture('wood_planks', { tile: 0.7 }).color(0x7a5c3e).at(WEST + 0.01, 0.94, z);
  [-1, 1].forEach((side) => kit.box({ w: 0.26, h: 1.1, d: 0.03 }).color(0x7a5c3e).at(shelf, 0.94, z + side * (length / 2 - 0.015)));
  [1.32, 1.7, 2.04].forEach((y) => kit.box({ w: 0.26, h: 0.025, d: length }).color(0x7a5c3e).at(shelf, y, z));
  // Plates standing on the shelves, leaning back; cups along the counter top.
  [1.345, 1.725].forEach((y) =>
    [-0.48, -0.24, 0, 0.24, 0.48].forEach((dz) =>
      kit.cylinder({ r: 0.1, h: 0.012, sides: 8 }).texture('plaster_wall', { tile: 0.3 }).color(0xb4ae9c).at(WEST + 0.07, y + 0.1, z + dz).object.rotation.set(0, 0, -Math.PI / 2 + 0.12),
    ),
  );
  [-0.42, -0.2, 0.2, 0.42].forEach((dz) => kit.cylinder({ r: 0.035, h: 0.07, sides: 6 }).color(0xb8b2a0).at(WEST + 0.3, 0.94, z + dz));
}

/** An old off-white fridge with a freezer door on top. The clipping is on it, under a cow magnet. */
function fridge(kit: LevelKit): void {
  const z = NORTH + FRIDGE.d / 2;
  kit.box({ w: FRIDGE.w, h: FRIDGE.h, d: FRIDGE.d }).texture('plaster_wall', { tile: 0.9 }).color(0x9e9a8c).at(FRIDGE.x, 0, z).collider();
  const front = NORTH + FRIDGE.d + 0.005;
  kit.box({ w: FRIDGE.w - 0.02, h: 0.012, d: 0.01 }).color(0x4a4a44).at(FRIDGE.x, 1.12, front);
  kit.box({ w: 0.03, h: 0.32, d: 0.03 }).color(0x8a8a80).at(FRIDGE.x - FRIDGE.w / 2 + 0.06, 0.7, front + 0.01);
  kit.box({ w: 0.15, h: 0.2, d: 0.004 }).color(0xb0a27c).at(FRIDGE.x + 0.08, 0.86, front);
  kit.box({ w: 0.05, h: 0.035, d: 0.02 }).color(0x2a2824).at(FRIDGE.x + 0.08, 1.04, front + 0.01);
  kit.box({ w: 0.02, h: 0.02, d: 0.022 }).color(0xd8d4c8).at(FRIDGE.x + 0.07, 1.045, front + 0.012);
}

function table(kit: LevelKit): void {
  const { x, z, w, d, h } = TABLE;
  // A faded oilcloth over the top.
  kit.box({ w, h: 0.045, d }).color(0x6e7a66).at(x, h - 0.045, z).collider();
  kit.box({ w: w + 0.03, h: 0.06, d: d + 0.03 }).color(0x5e6a58).at(x, h - 0.09, z);
  [-1, 1].forEach((sx) => [-1, 1].forEach((sz) => kit.box({ w: 0.05, h: h - 0.09, d: 0.05 }).color(0x5a422c).at(x + sx * (w / 2 - 0.06), 0, z + sz * (d / 2 - 0.06))));
}

/** A kitchen chair with a cushion. `yaw` is the way the sitter faces. */
export function chair(kit: LevelKit, x: number, z: number, yaw: number): Placed {
  const placed = kit
    .group((g) => {
      g.box({ w: 0.42, h: 0.04, d: 0.42 }).color(0x6a4e34).at(0, 0.42, 0);
      g.box({ w: 0.36, h: 0.04, d: 0.36 }).color(0x6a3a30).at(0, 0.46, -0.01);
      [-1, 1].forEach((sx) => [-1, 1].forEach((sz) => g.box({ w: 0.04, h: 0.42, d: 0.04 }).color(0x5a422c).at(sx * 0.18, 0, sz * 0.18)));
      [-1, 1].forEach((sx) => g.box({ w: 0.04, h: 0.48, d: 0.04 }).color(0x5a422c).at(sx * 0.18, 0.46, 0.19));
      [0.62, 0.84].forEach((y) => g.box({ w: 0.36, h: 0.07, d: 0.025 }).color(0x6a4e34).at(0, y, 0.19));
    })
    .at(x, 0, z)
    .rotY(yaw);
  kit.barrier({ r: 0.24 }).at(x, 0, z);
  return placed;
}

/** A round kitchen clock with a cream face, between the window and the fridge. */
function wallClock(kit: LevelKit): void {
  const face = (r: number, d: number, color: number) => kit.cylinder({ r, h: d, sides: 10 }).color(color).at(CLOCK.x, CLOCK.y, NORTH).object.rotation.set(Math.PI / 2, 0, 0);
  face(0.17, 0.05, 0x3e3a34);
  face(0.145, 0.055, 0xd6ccb0);
  kit.box({ w: 0.012, h: 0.09, d: 0.006 }).color(0x1a1a1a).at(CLOCK.x, CLOCK.y, NORTH + 0.058).object.rotation.set(0, 0, -2.1);
  kit.box({ w: 0.01, h: 0.12, d: 0.006 }).color(0x1a1a1a).at(CLOCK.x, CLOCK.y, NORTH + 0.062).object.rotation.set(0, 0, 0.5);
}

/** The one light left on at night: a small lamp on the dresser, turned low. */
function nightLamp(kit: LevelKit): void {
  const { x, z } = NIGHT_LAMP;
  kit.cylinder({ r: 0.06, h: 0.2, sides: 6 }).color(0x5a4a3a).at(x, 0.94, z);
  kit.cylinder({ r: 0.12, h: 0.14, sides: 8 }).color(0xd8b878).emissive(0x4a3418).doubleSided().at(x, 1.14, z);
  kit.glow(0.45, 0x6a4a20).at(x, 1.2, z);
  kit.light({ color: 0xffb060, intensity: 0.9, range: 3.2 }).flicker(0.03).at(x + 0.15, 1.25, z);
}
