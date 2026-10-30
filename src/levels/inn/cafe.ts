import type { LevelKit } from '../../game/kit/levelKit';
import type { SceneContext } from '../../game/scene';
import { playNode } from '../forest_path/play';
import { cafeLit, type InnDressing } from './dressing';
import { bottles, cafeTable, chair, placeSetting } from './furniture';
import { fogWindow, floorAndCeiling, pendantLamp, skirting, wall, type Finish } from './interior';
import { CAFE, COUNTER, FRONT_DOOR, KITCHEN_DOOR, STAIRS, STUBLI_DOOR, SUPPER_TABLE, TABLES } from './layout';

/** The café on the ground floor: six tables, the counter, the television on its bracket. */

export const PANELLED: Finish = {
  texture: 'wallpaper_inn',
  tile: 1.4,
  color: 0xb8a888,
  dado: { texture: 'wood_planks', color: 0x6a5038, h: 1.05, tile: 1 },
};

const WINDOW = { w: 1.15, h: 1.05, y: 1.0 };

export function buildCafe(kit: LevelKit, ctx: SceneContext, dressing: InnDressing, justAte: boolean): void {
  const { x0, x1, z0, z1, h } = CAFE;
  const night = !cafeLit(dressing);

  wall(kit, [x0, z0], [x1, z0], h, PANELLED, [{ at: (STAIRS.x0 + STAIRS.x1) / 2 - x0, w: STAIRS.x1 - STAIRS.x0, h: 2.5 }]);
  wall(kit, [x0, z1], [x1, z1], h, PANELLED, [
    { at: FRONT_DOOR.x - x0, w: FRONT_DOOR.w, h: FRONT_DOOR.h },
    { at: -3.3 - x0, w: WINDOW.w, h: WINDOW.h, y: WINDOW.y },
    { at: -0.1 - x0, w: WINDOW.w, h: WINDOW.h, y: WINDOW.y },
  ]);
  wall(kit, [x0, z1], [x0, z0], h, PANELLED, [
    { at: z1 - STUBLI_DOOR.z, w: STUBLI_DOOR.w, h: STUBLI_DOOR.h },
    { at: z1 + 2.2, w: 1.0, h: WINDOW.h, y: WINDOW.y },
  ]);
  wall(kit, [x1, z1], [x1, z0], h, PANELLED, [{ at: z1 - 1.8, w: 1.0, h: WINDOW.h, y: WINDOW.y }]);
  [
    [[x0, z0 + 0.09], [x1, z0 + 0.09]],
    [[x0, z1 - 0.09], [x1, z1 - 0.09]],
  ].forEach(([a, b]) => skirting(kit, a as [number, number], b as [number, number]));

  // The square lies south; the street lamp's smear shows in the front windows at night.
  const nightOutside = dressing.night;
  [-3.3, -0.1].forEach((x) => fogWindow(kit, { x, z: z1, facing: 0, ...WINDOW, night: nightOutside, lamp: true }));
  fogWindow(kit, { x: x0, z: -2.2, facing: -90, w: 1.0, h: WINDOW.h, y: WINDOW.y, night: nightOutside });
  fogWindow(kit, { x: x1, z: 1.8, facing: 90, w: 1.0, h: WINDOW.h, y: WINDOW.y, night: nightOutside });

  floorAndCeiling(kit, CAFE, { texture: 'wood_floor', tile: 1.3, color: 0x8a7a68 }, { texture: 'plaster_wall', tile: 2.2, color: 0x8a8070 });
  // Smoke-dark beams across the ceiling.
  for (let x = x0 + 1.2; x < x1; x += 2.2) kit.box({ w: 0.22, h: 0.2, d: z1 - z0 }).texture('wood_planks', { tile: 1.2 }).color(0x3e2e22).at(x, h - 0.2, 0);

  TABLES.forEach((t) => cafeTable(kit, t.x, t.z, { chairsUp: dressing.night && !(justAte && t === SUPPER_TABLE) }));
  if (dressing.supper) placeSetting(kit, SUPPER_TABLE.x, SUPPER_TABLE.z - 0.12, dressing.supper);
  if (justAte) placeSetting(kit, SUPPER_TABLE.x, SUPPER_TABLE.z - 0.12, 'coffee');

  counter(kit, dressing);
  kitchenDoor(kit, ctx, dressing);
  decor(kit, dressing);

  // Lamps over the tables. At night and on the third evening only the kitchen door glows.
  [
    { x: -3.4, z: -0.9 },
    { x: -0.6, z: -0.3 },
    { x: 2.3, z: 0.9 },
    { x: 2.6, z: -2.6 },
  ].forEach((p) => pendantLamp(kit, { x: p.x, y: h, z: p.z }, { on: !night, intensity: 1.35, range: 5.5, drop: 0.7 }));
  if (dressing.endingMorning) kit.light({ color: 0x9aa0a4, intensity: 0.8, range: 7 }).at(0, 2, 2.5);
}

function counter(kit: LevelKit, dressing: InnDressing): void {
  const w = CAFE.x1 - COUNTER.x0;
  const x = (COUNTER.x0 + CAFE.x1) / 2;
  kit.box({ w, h: COUNTER.h - 0.05, d: COUNTER.d }).texture('wood_planks', { tile: 0.9 }).color(0x5a4030).at(x, 0, COUNTER.z).collider();
  kit.box({ w: w + 0.06, h: 0.05, d: COUNTER.d + 0.1 }).texture('wood_planks', { tile: 1.2 }).color(0x8a6a4a).at(x, COUNTER.h - 0.05, COUNTER.z);
  // The way behind the counter is Monique's.
  kit.barrier({ w: 0.3, d: 1.0 }).at(COUNTER.x0 - 0.15, 0, CAFE.z0 + 0.5);

  // The back counter, the coffee machine, the glasses, the bottles on the wall shelf.
  const back = CAFE.z0 + 0.3;
  kit.box({ w: w - 0.9, h: 0.9, d: 0.5 }).texture('wood_planks', { tile: 0.9 }).color(0x4a3628).at(x - 0.45, 0, back).collider();
  kit.box({ w: 0.45, h: 0.42, d: 0.38 }).texture('rust_metal', { tile: 0.4 }).color(0xb8b4ac).at(COUNTER.x0 + 0.7, 0.9, back);
  kit.box({ w: 0.3, h: 0.06, d: 0.1 }).color(0x2a2a2a).at(COUNTER.x0 + 0.7, 1.12, back + 0.2);
  kit.box({ w: 0.12, h: 0.08, d: 0.08 }).color(0x1a1a1a).at(COUNTER.x0 + 0.62, 1.0, back + 0.22);
  kit.box({ w: 0.6, h: 0.03, d: 0.3 }).color(0x6a5a48).at(COUNTER.x0 + 1.6, 1.55, CAFE.z0 + 0.17);
  kit.box({ w: 2.2, h: 0.03, d: 0.22 }).color(0x6a5a48).at(COUNTER.x0 + 2.0, 1.85, CAFE.z0 + 0.13);
  bottles(kit, COUNTER.x0 + 1.0, 1.88, CAFE.z0 + 0.13, 16);
  for (let i = 0; i < 6; i++) kit.cylinder({ r: 0.035, h: 0.11, sides: 6 }).color(0xb8c0b8).at(COUNTER.x0 + 1.35 + i * 0.1, 1.58, CAFE.z0 + 0.17);
  // A row of bar stools.
  [1.4, 2.4].forEach((sx) => {
    kit.cylinder({ r: 0.04, h: 0.72, sides: 6 }).color(0x2a2420).at(sx, 0, COUNTER.z + 0.6);
    kit.cylinder({ r: 0.19, h: 0.06, sides: 8 }).texture('wood_planks', { tile: 0.4 }).color(0x6a4e36).at(sx, 0.72, COUNTER.z + 0.6);
  });
  if (!dressing.night) {
    // The day's newspaper, folded, and the saucer for the till.
    kit.box({ w: 0.32, h: 0.01, d: 0.24 }).color(0xb8b4a4).at(COUNTER.x0 + 0.4, COUNTER.h, COUNTER.z + 0.05).rotY(12);
    kit.cylinder({ r: 0.07, h: 0.01, sides: 8 }).color(0xd8d2c4).at(3.4, COUNTER.h, COUNTER.z + 0.1);
  }
}

/** Monique's kitchen and rooms lie behind this door. Never opened; at night a line of light under it. */
function kitchenDoor(kit: LevelKit, ctx: SceneContext, dressing: InnDressing): void {
  const z = CAFE.z0 + 0.1;
  kit.box({ w: KITCHEN_DOOR.w, h: KITCHEN_DOOR.h, d: 0.05 }).texture('door_wood', { tile: [KITCHEN_DOOR.w, KITCHEN_DOOR.h] }).color(0x9a8a78).at(KITCHEN_DOOR.x, 0, z);
  kit.box({ w: 0.05, h: 0.05, d: 0.05 }).color(0xb8a060).at(KITCHEN_DOOR.x - 0.3, 1.0, z + 0.04);
  const lit = !cafeLit(dressing);
  if (!lit) return;
  kit.box({ w: KITCHEN_DOOR.w - 0.06, h: 0.025, d: 0.01 }).color(0xffc070).unlit().at(KITCHEN_DOOR.x, 0, z + 0.03);
  kit.glow(0.9, 0x5a3818).at(KITCHEN_DOOR.x, 0.05, z + 0.15);
  kit.light({ color: 0xc88a50, intensity: 0.7, range: 3.4 }).at(KITCHEN_DOOR.x, 0.3, z + 0.6);
  kit
    .hotspot({
      prompt: 'Knock',
      radius: 0.7,
      onInteract: () => void (dressing.night ? playNode(ctx, 'monique_night') : ctx.say('A television behind the kitchen door. Monique has gone through for the evening.')),
    })
    .at(KITCHEN_DOOR.x - 1.2, 0, COUNTER.z + 0.7);
}

function decor(kit: LevelKit, dressing: InnDressing): void {
  const lit = cafeLit(dressing);
  // The television on its bracket in the corner, the local channel with the sound off.
  kit.box({ w: 0.06, h: 0.06, d: 0.5 }).color(0x2a2a2a).at(CAFE.x1 - 0.25, 2.05, -0.6);
  kit.box({ w: 0.5, h: 0.42, d: 0.48 }).color(0x3a3834).at(CAFE.x1 - 0.5, 2.0, -0.6).rotY(-90 + 25);
  kit.box({ w: 0.38, h: 0.3, d: 0.01 }).color(lit ? 0x5a7088 : 0x0c0e10).unlit().at(CAFE.x1 - 0.76, 2.06, -0.48).rotY(-90 + 25);
  if (lit) kit.glow(0.5, 0x1c2a38).at(CAFE.x1 - 0.85, 2.2, -0.44);

  // The dairy cooperative's calendar, the clock, a mounted chamois horn, the coat rack.
  kit.box({ w: 0.36, h: 0.5, d: 0.01 }).texture('tiles_white', { tile: 0.5 }).color(0xd8d0bc).at(CAFE.x1 - 0.09, 1.3, 2.9).rotY(90);
  kit.box({ w: 0.36, h: 0.16, d: 0.012 }).color(0x4a6a4a).at(CAFE.x1 - 0.09, 1.66, 2.9).rotY(90);
  kit.cylinder({ r: 0.17, h: 0.05, sides: 12 }).color(0x5a4430).at(CAFE.x0 + 0.1, 2.05, 0.6).rotY(90);
  kit.cylinder({ r: 0.14, h: 0.06, sides: 12 }).color(0xd8d0bc).at(CAFE.x0 + 0.11, 2.07, 0.6);
  kit.box({ w: 0.4, h: 0.3, d: 0.05 }).texture('wood_planks', { tile: 0.4 }).color(0x4a3628).at(-2.8, 1.75, CAFE.z0 + 0.1);
  kit.cylinder({ r: 0.025, h: 0.25, sides: 5 }).color(0x1a1612).at(-2.9, 1.95, CAFE.z0 + 0.17);
  kit.cylinder({ r: 0.025, h: 0.25, sides: 5 }).color(0x1a1612).at(-2.7, 1.95, CAFE.z0 + 0.17);

  const rack = { x: CAFE.x1 - 0.35, z: CAFE.z1 - 0.4 };
  kit.cylinder({ r: 0.03, h: 1.8, sides: 6 }).color(0x3a2a20).at(rack.x, 0, rack.z);
  kit.box({ w: 0.36, h: 0.65, d: 0.16 }).color(0x4a4e44).at(rack.x - 0.1, 1.05, rack.z);
  if (dressing.eveningTwo) {
    // Bernard's shovel, behind the coat rack. Monique isn't blind.
    kit.box({ w: 0.035, h: 1.2, d: 0.035 }).texture('wood_planks', { tile: 0.3 }).color(0x8a6a44).at(rack.x + 0.12, 0.25, rack.z + 0.1).rotY(10);
    kit.box({ w: 0.2, h: 0.28, d: 0.02 }).texture('rust_metal', { tile: 0.3 }).color(0x6a6a64).at(rack.x + 0.12, 0, rack.z + 0.1);
  }
  // A spare chair by the stübli door, and the guest book on a stand.
  chair(kit, CAFE.x0 + 0.4, 1.4, -90);
  kit.box({ w: 0.3, h: 0.95, d: 0.25 }).texture('wood_planks', { tile: 0.5 }).color(0x5a4030).at(1.2, 0, CAFE.z1 - 0.35).collider();
  kit.box({ w: 0.3, h: 0.03, d: 0.22 }).color(0x6a2a24).at(1.2, 0.95, CAFE.z1 - 0.35);
}
