import type { LevelKit } from '../../game/kit/levelKit';
import { BENCH, CALENDAR, RADIO, ROOM } from './layout';

/** The bench and its tools, the calendar, the radio shelf, oil drums, and tyres. */

const WOOD = 0x5e5040;
const STEEL = 0x3c3c3a;

export function buildBench(kit: LevelKit): void {
  const { x, z, w, d, h } = BENCH;
  kit.box({ w, h: 0.06, d, cell: 0.6 }).texture('wood_planks', { tile: 1 }).color(0x4e4234).at(x, h - 0.06, z).collider();
  kit.box({ w: w - 0.1, h: 0.03, d: d - 0.1 }).texture('wood_planks', { tile: 1 }).color(0x3e352c).at(x, 0.2, z);
  [-1, 1].forEach((sx) => [-1, 1].forEach((sz) => kit.box({ w: 0.07, h: h - 0.06, d: 0.07 }).color(WOOD).at(x + sx * (w / 2 - 0.08), 0, z + sz * (d / 2 - 0.08))));

  // A vice at the left end.
  kit.box({ w: 0.22, h: 0.12, d: 0.16 }).texture('rust_metal', { tile: 0.4 }).color(0x3e4a44).at(x - w / 2 + 0.25, h, z + d / 2 - 0.15);
  kit.box({ w: 0.04, h: 0.04, d: 0.3 }).color(STEEL).at(x - w / 2 + 0.25, h + 0.05, z + d / 2 + 0.02);
  // The brake disc Yannick is cleaning, a rag, a parts tray, an oil can, a toolbox.
  kit.cylinder({ r: 0.13, h: 0.03, sides: 10 }).texture('rust_metal', { tile: 0.3 }).color(0x8a8078).at(x - 0.6, h, z + 0.08);
  kit.cylinder({ r: 0.05, h: 0.031, sides: 6 }).color(0x2a2826).at(x - 0.6, h, z + 0.08);
  kit.box({ w: 0.26, h: 0.02, d: 0.2 }).color(0x6a6250).at(x - 0.2, h, z + 0.15).rotY(18);
  kit.box({ w: 0.34, h: 0.05, d: 0.22 }).texture('rust_metal', { tile: 0.4 }).color(0x4a4a46).at(x + 0.35, h, z - 0.05);
  kit.cylinder({ r: 0.05, h: 0.16, sides: 6 }).color(0x5a2c22).at(x + 0.75, h, z - 0.12);
  kit.box({ w: 0.5, h: 0.2, d: 0.22 }).texture('rust_metal', { tile: 0.5 }).color(0x6a2e26).at(x + 1.2, h, z - 0.08);
  kit.box({ w: 0.46, h: 0.03, d: 0.04 }).color(0x2a2a28).at(x + 1.2, h + 0.22, z - 0.08);

  pegboard(kit);
}

/** A pegboard over the bench with the tools hanging on it. */
function pegboard(kit: LevelKit): void {
  const wallZ = ROOM.z0 + 0.1;
  const left = BENCH.x - BENCH.w / 2 + 0.2;
  kit.box({ w: 1.7, h: 0.8, d: 0.02 }).texture('wood_planks', { tile: 0.6 }).color(0x6a5a44).at(left + 0.85, 1.05, wallZ);
  // Spanners from big to small, then a hammer, screwdrivers, and a saw.
  [0.3, 0.27, 0.24, 0.21, 0.18, 0.15].forEach((length, i) =>
    kit.box({ w: 0.03, h: length, d: 0.015 }).color(0x58585a).at(left + 0.15 + i * 0.07, 1.55 - length, wallZ + 0.02),
  );
  kit.box({ w: 0.03, h: 0.32, d: 0.02 }).color(0x5a4430).at(left + 0.7, 1.18, wallZ + 0.02);
  kit.box({ w: 0.12, h: 0.04, d: 0.03 }).color(STEEL).at(left + 0.7, 1.48, wallZ + 0.02);
  [0, 1, 2].forEach((i) => {
    kit.box({ w: 0.025, h: 0.1, d: 0.02 }).color([0x6a2a22, 0x2a3a5a, 0x5a5a2a][i]!).at(left + 0.9 + i * 0.06, 1.42, wallZ + 0.02);
    kit.box({ w: 0.008, h: 0.12, d: 0.01 }).color(0x8a8a88).at(left + 0.9 + i * 0.06, 1.3, wallZ + 0.02);
  });
  kit.box({ w: 0.42, h: 0.14, d: 0.01 }).color(0x4a4a48).at(left + 1.4, 1.2, wallZ + 0.02);
  kit.box({ w: 0.12, h: 0.12, d: 0.02 }).color(0x4a3628).at(left + 1.66, 1.2, wallZ + 0.02);
}

/** A free calendar from the tyre dealer: a picture of a tyre on top, the month's grid below. */
export function buildCalendar(kit: LevelKit) {
  const { x, y, z } = CALENDAR;
  const sheet = kit.box({ w: 0.4, h: 0.62, d: 0.01 }).texture('plaster_wall', { tile: 2 }).color(0xb6b0a0).at(x, y, z);
  kit.box({ w: 0.36, h: 0.24, d: 0.012 }).color(0x2e3034).at(x, y + 0.34, z);
  kit.cylinder({ r: 0.08, h: 0.014, sides: 10 }).color(0x141414).at(x + 0.06, y + 0.46, z).mesh.rotation.x = Math.PI / 2;
  kit.box({ w: 0.36, h: 0.03, d: 0.012 }).color(0x7a3a2a).at(x, y + 0.29, z);
  [0, 1, 2, 3, 4].forEach((row) => kit.box({ w: 0.34, h: 0.004, d: 0.012 }).color(0x6a665c).at(x, y + 0.05 + row * 0.045, z));
  return sheet;
}

/** A plank shelf on two brackets on the left wall, with the radio on it. */
export function buildRadioShelf(kit: LevelKit, on: boolean): void {
  const { x, y, z } = RADIO;
  const wallX = ROOM.x0 + 0.08;
  kit.box({ w: 0.3, h: 0.03, d: 1.1 }).texture('wood_planks', { tile: 0.8 }).color(WOOD).at(wallX + 0.15, y - 0.03, z + 0.2);
  [-0.25, 0.65].forEach((dz) => kit.box({ w: 0.2, h: 0.16, d: 0.03 }).color(STEEL).at(wallX + 0.1, y - 0.19, z + dz));
  kit.box({ w: 0.14, h: 0.17, d: 0.3 }).texture('wood_planks', { tile: 0.4 }).color(0x4a3628).at(x, y, z);
  kit.box({ w: 0.01, h: 0.1, d: 0.17 }).color(0x7a7262).at(x + 0.07, y + 0.035, z - 0.05);
  const dial = kit.box({ w: 0.01, h: 0.04, d: 0.08 }).at(x + 0.07, y + 0.1, z + 0.09);
  if (on) dial.color(0xa49058).unlit();
  else dial.color(0x3a3630);
  kit.cylinder({ r: 0.006, h: 0.4, sides: 4 }).color(0x8a8a88).at(x - 0.03, y + 0.17, z + 0.12);
  // Cans and a box of fuses keep it company.
  kit.cylinder({ r: 0.045, h: 0.12, sides: 6 }).color(0x4a5a4a).at(wallX + 0.15, y, z + 0.4);
  kit.cylinder({ r: 0.045, h: 0.12, sides: 6 }).color(0x6a5a3a).at(wallX + 0.15, y, z + 0.52);
  kit.box({ w: 0.14, h: 0.08, d: 0.16 }).color(0x8a7a5a).at(wallX + 0.15, y, z + 0.7);
}

/** Oil drums in the back right corner, one with a hand pump. */
export function buildDrums(kit: LevelKit): void {
  const drums: [number, number, number][] = [
    [4.45, -5.45, 0x6a3a2c],
    [3.8, -5.5, 0x3e4a56],
    [4.48, -4.8, 0x4a5240],
    [4.5, -3.0, 0x5a4a3a],
  ];
  drums.forEach(([x, z, color]) => {
    kit.cylinder({ r: 0.29, h: 0.88, sides: 10 }).texture('rust_metal', { tile: 0.9 }).color(color).at(x, 0, z).collider();
    [0.28, 0.6].forEach((y) => kit.cylinder({ r: 0.3, h: 0.03, sides: 10 }).color(0x2a2826).at(x, y, z));
  });
  kit.cylinder({ r: 0.03, h: 0.5, sides: 5 }).color(0x8a8a86).at(4.45, 0.88, -5.45);
  kit.box({ w: 0.25, h: 0.03, d: 0.04 }).color(0x8a8a86).at(4.4, 1.33, -5.45);
}

/** Stacks of worn tyres in the front left corner and two against the right wall. */
export function buildTyres(kit: LevelKit): void {
  const stack = (x: number, z: number, count: number) =>
    Array.from({ length: count }).forEach((_, i) => {
      const tyre = kit.cylinder({ r: 0.31, h: 0.19, sides: 10 }).color(i % 2 ? 0x1c1c1c : 0x222220).at(x + (i % 2) * 0.03, i * 0.19, z);
      if (i === 0) tyre.collider();
      if (i === count - 1) kit.cylinder({ r: 0.17, h: 0.005, sides: 10 }).color(0x0a0a0a).at(x + (i % 2) * 0.03, (i + 1) * 0.19, z);
    });
  stack(-4.52, 3.4, 5);
  stack(-4.5, 2.72, 3);
  stack(-3.86, 3.42, 2);
  stack(4.58, 0, 2);
}
