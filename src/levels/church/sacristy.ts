import type { LevelKit } from '../../game/kit/levelKit';
import type { SceneContext } from '../../game/scene';
import { playNode } from '../forest_path/play';
import { OFFICE, RAISED, REGISTER_CUPBOARD, SACRISTY, WALL } from './layout';
import { readRegisters } from './registers';

/** The sacristy with the register cupboard (P2), and the parish office next door. */

const SPINES = [0x4a2420, 0x222a3a, 0x263a2a, 0x263a2a, 0x4a2420, 0x18171a, 0x222a3a, 0x263a2a, 0x4a2420, 0x263a2a];

/** The cupboard stays locked on day 1; from day 2 the key is in the lock. */
const cupboardOpen = (ctx: SceneContext) => ctx.state.count('day') >= 2;

export function buildSacristy(kit: LevelKit, ctx: SceneContext, night: boolean): void {
  const floor = RAISED;
  const north = SACRISTY.z0 + WALL / 2;
  const west = SACRISTY.x0 + WALL / 2;

  // Tall vestment cupboard on the west wall, the sink on the north wall.
  kit.box({ w: 1.6, h: 2.25, d: 0.62 }).texture('pew_wood', { tile: 1.2 }).color(0x6e5e50).at(west + 0.31, floor, -18.6).rotY(90).collider();
  kit.box({ w: 0.02, h: 2.0, d: 0.02 }).color(0x2a2420).at(west + 0.63, floor + 0.1, -18.6);
  kit.box({ w: 0.8, h: 0.82, d: 0.5 }).texture('pew_wood', { tile: 1 }).color(0x726456).at(-1.3, floor, north + 0.25).collider();
  kit.box({ w: 0.6, h: 0.12, d: 0.4 }).color(0xb8b6ae).at(-1.3, floor + 0.82, north + 0.25);
  kit.box({ w: 0.04, h: 0.2, d: 0.04 }).color(0x8a8a86).at(-1.3, floor + 0.94, north + 0.06);
  kit.box({ w: 0.5, h: 0.6, d: 0.02 }).color(0x5e6466).at(-1.3, floor + 1.35, north + 0.01);

  registerCupboard(kit, ctx, floor);

  // The table: an oil lamp and a modern desk lamp, which is on.
  const table = { x: 0.7, z: -18.9 };
  kit.box({ w: 1.4, h: 0.05, d: 0.8 }).texture('pew_wood', { tile: 1 }).color(0x7a6a5a).at(table.x, floor + 0.74, table.z);
  [
    [-0.62, -0.32],
    [0.62, -0.32],
    [-0.62, 0.32],
    [0.62, 0.32],
  ].forEach(([dx, dz]) => kit.box({ w: 0.06, h: 0.74, d: 0.06 }).color(0x5a4c40).at(table.x + dx!, floor, table.z + dz!));
  kit.barrier({ w: 1.4, d: 0.8 }).at(table.x, 0, table.z);
  kit.cylinder({ r: 0.06, h: 0.04, sides: 6 }).color(0x8c7a4c).at(table.x - 0.4, floor + 0.79, table.z);
  kit.cylinder({ r: 0.045, h: 0.2, sides: 6 }).color(0xb0a888).at(table.x - 0.4, floor + 0.83, table.z);
  kit.cylinder({ r: 0.07, h: 0.03, sides: 6 }).color(0x2e3a2c).at(table.x + 0.45, floor + 0.79, table.z - 0.2);
  kit.box({ w: 0.02, h: 0.34, d: 0.02 }).color(0x2a2a28).at(table.x + 0.45, floor + 0.82, table.z - 0.2);
  kit.cylinder({ r: 0.1, h: 0.12, sides: 6 }).color(0x2e4a34).at(table.x + 0.45, floor + 1.1, table.z - 0.12);
  kit.box({ w: 0.08, h: 0.02, d: 0.08 }).color(0xffe8b8).unlit().at(table.x + 0.45, floor + 1.09, table.z - 0.12);
  kit.light({ color: 0xffd8a0, intensity: night ? 1.3 : 0.9, range: 3.5 }).at(table.x + 0.45, floor + 1.0, table.z - 0.12);
  kit.box({ w: 0.3, h: 0.02, d: 0.22 }).color(0xb8b0a0).at(table.x + 0.05, floor + 0.79, table.z + 0.1).rotY(12);

  office(kit, ctx, floor);
}

/** P2. Glass-fronted shelves of bound registers; three volumes open. */
function registerCupboard(kit: LevelKit, ctx: SceneContext, floor: number): void {
  const { x, z } = REGISTER_CUPBOARD;
  const open = cupboardOpen(ctx);
  const w = 1.7;
  kit.box({ w, h: 2.1, d: 0.06 }).texture('pew_wood', { tile: 1.2 }).color(0x5e4e42).at(x, floor, z - 0.22);
  [-1, 1].forEach((side) => kit.box({ w: 0.06, h: 2.1, d: 0.5 }).texture('pew_wood', { tile: 1 }).color(0x66564a).at(x + side * (w / 2), floor, z));
  kit.box({ w: w + 0.1, h: 0.12, d: 0.56 }).texture('pew_wood', { tile: 1 }).color(0x56483c).at(x, floor + 2.1, z);
  kit.barrier({ w: w + 0.1, d: 0.5 }).at(x, 0, z);
  [0.1, 0.62, 1.14, 1.66].forEach((y, shelf) => {
    kit.box({ w, h: 0.03, d: 0.44 }).color(0x5a4a3e).at(x, floor + y, z);
    let cursor = x - w / 2 + 0.08;
    let i = shelf * 3;
    while (cursor < x + w / 2 - 0.1) {
      const thick = 0.05 + ((i * 7) % 5) * 0.012;
      kit.box({ w: thick, h: 0.36 + ((i * 3) % 4) * 0.03, d: 0.3 }).color(SPINES[i % SPINES.length]!).at(cursor + thick / 2, floor + y + 0.03, z - 0.02);
      cursor += thick + 0.008;
      i++;
    }
  });
  // Two doors: shut with the key out on day 1, swung open with the key in the lock from day 2.
  [-1, 1].forEach((side) => {
    const door = kit.box({ w: w / 2, h: 2.0, d: 0.04 }).texture('pew_wood', { tile: 1 }).color(0x6a5a4c);
    if (open) door.at(x + side * (w / 2 + 0.02), floor + 0.05, z + 0.25 + w / 4).rotY(side * 80);
    else door.at(x + (side * w) / 4, floor + 0.05, z + 0.26);
  });
  if (open) kit.box({ w: 0.03, h: 0.08, d: 0.04 }).color(0xb09a58).at(x + w / 2 + 0.06, floor + 1.1, z + 0.3);

  kit
    .hotspot({
      prompt: () => (cupboardOpen(ctx) ? 'Read the registers' : 'Look at the cupboard'),
      radius: 0.6,
      onInteract: () => (cupboardOpen(ctx) ? readRegisters(ctx) : ctx.say('Locked. The abbé said after morning mass.')),
    })
    .at(x, 0, z + 0.6);
}

/** The parish office: desk, the beige computer and its modem, the filing cabinet with the photo. */
function office(kit: LevelKit, ctx: SceneContext, floor: number): void {
  const north = OFFICE.z0 + WALL / 2;
  const desk = { x: 5.5, z: north + 0.38 };
  kit.box({ w: 1.5, h: 0.04, d: 0.72 }).texture('pew_wood', { tile: 1 }).color(0x7e7060).at(desk.x, floor + 0.72, desk.z);
  kit.box({ w: 0.45, h: 0.72, d: 0.68 }).texture('pew_wood', { tile: 1 }).color(0x706252).at(desk.x + 0.5, floor, desk.z);
  kit.box({ w: 0.05, h: 0.72, d: 0.68 }).color(0x5a4e42).at(desk.x - 0.72, floor, desk.z);
  kit.barrier({ w: 1.5, d: 0.72 }).at(desk.x, 0, desk.z);
  const top = floor + 0.76;
  // The case lies flat under the monitor, as they did in 1998.
  kit.box({ w: 0.44, h: 0.13, d: 0.4 }).color(0xb4ac98).at(desk.x - 0.05, top, desk.z - 0.06);
  kit.box({ w: 0.38, h: 0.34, d: 0.36 }).color(0xbab29e).at(desk.x - 0.05, top + 0.13, desk.z - 0.08);
  kit.box({ w: 0.3, h: 0.23, d: 0.02 }).color(0x222826).at(desk.x - 0.05, top + 0.19, desk.z + 0.105);
  kit.box({ w: 0.07, h: 0.07, d: 0.01 }).color(0xd8c850).at(desk.x + 0.09, top + 0.38, desk.z + 0.105);
  kit.box({ w: 0.42, h: 0.03, d: 0.15 }).color(0xb0a894).at(desk.x - 0.05, top, desk.z + 0.25);
  kit.box({ w: 0.2, h: 0.05, d: 0.15 }).color(0xa8a08c).at(desk.x + 0.38, top, desk.z - 0.05);
  [0, 1, 2].forEach((i) => kit.box({ w: 0.012, h: 0.01, d: 0.01 }).color(0x3a2a20).at(desk.x + 0.32 + i * 0.03, top + 0.03, desk.z + 0.03));
  kit.box({ w: 0.24, h: 0.02, d: 0.3 }).color(0xc8c2b2).at(desk.x - 0.55, top, desk.z + 0.05).rotY(-8);
  kit.box({ w: 0.5, h: 0.45, d: 0.5 }).texture('pew_wood', { tile: 1 }).color(0x5a4e44).at(desk.x - 0.1, floor, desk.z + 0.75);

  // A plain cross over the desk and the parish calendar beside the window.
  kit.box({ w: 0.04, h: 0.36, d: 0.03 }).color(0x4a3c30).at(desk.x - 0.05, floor + 1.55, north + 0.02);
  kit.box({ w: 0.2, h: 0.04, d: 0.03 }).color(0x4a3c30).at(desk.x - 0.05, floor + 1.8, north + 0.02);
  kit.box({ w: 0.3, h: 0.42, d: 0.01 }).color(0xb6b0a2).at(desk.x + 0.75, floor + 1.25, north + 0.01);
  kit.box({ w: 0.26, h: 0.14, d: 0.01 }).color(0x5a6a5a).at(desk.x + 0.75, floor + 1.48, north + 0.016);

  const cabinet = { x: OFFICE.x1 - WALL / 2 - 0.32, z: -17.95 };
  kit.box({ w: 0.6, h: 1.3, d: 0.5 }).texture('rust_metal', { tile: 0.8 }).color(0x7a7c78).at(cabinet.x, floor, cabinet.z).rotY(90).collider();
  [0.25, 0.65, 1.05].forEach((y) => kit.box({ w: 0.14, h: 0.03, d: 0.02 }).color(0x4a4a48).at(cabinet.x - 0.26, floor + y, cabinet.z).rotY(90));
  kit.box({ w: 0.2, h: 0.16, d: 0.02 }).color(0x5a4a3a).at(cabinet.x, floor + 1.3, cabinet.z).rotY(75);
  kit.box({ w: 0.16, h: 0.12, d: 0.01 }).color(0x8a8678).at(cabinet.x - 0.012, floor + 1.32, cabinet.z).rotY(75);

  kit.hotspot({ prompt: 'Look at the computer', radius: 0.35, onInteract: () => playNode(ctx, 'office_computer') }).at(desk.x - 0.05, 0, desk.z);
  kit.hotspot({ prompt: 'Look at the papers', radius: 0.3, onInteract: () => playNode(ctx, 'office_desk') }).at(desk.x - 0.55, 0, desk.z + 0.05);
  kit.hotspot({ prompt: 'Look at the photo', radius: 0.35, onInteract: () => playNode(ctx, 'office_photo') }).at(cabinet.x, 0, cabinet.z);
}
