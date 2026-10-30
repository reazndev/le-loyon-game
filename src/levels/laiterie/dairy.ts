import { CylinderGeometry } from 'three';
import type { LevelKit } from '../../game/kit/levelKit';
import type { SceneContext } from '../../game/scene';
import { MILK_COUNTER, ROOM, TANK } from './layout';

/** The dairy side: the cooling tank, the milk counter with its weighing bucket, and the cans. */

const STEEL = 0x767a7a;
const DULL_STEEL = 0x5c605e;

/** A steel milk can, 40 liters. Upside down, it stands on its neck to drain. */
function milkCan(kit: LevelKit, x: number, y: number, z: number, upsideDown = false): void {
  const parts: [r: number, h: number][] = [
    [0.17, 0.46],
    [0.13, 0.07],
    [0.09, 0.1],
    [0.11, 0.03],
  ];
  const stack = upsideDown ? parts.slice(0, 3).reverse() : parts;
  stack.reduce((height, [r, h], i) => {
    const part = kit.cylinder({ r, h, sides: 8 }).color(i % 2 ? DULL_STEEL : STEEL).at(x, y + height, z);
    if (i === 0 && y === 0) part.collider();
    return height + h;
  }, 0);
}

export function buildDairy(kit: LevelKit, ctx: SceneContext): void {
  const look = (prompt: string, line: string, x: number, z: number, radius = 0.4) => kit.hotspot({ prompt, radius, onInteract: () => ctx.say(line) }).at(x, 0, z);

  // The cooling tank on its legs, the stirrer motor on the lid, and the cooler box on the wall.
  const legY = 0.32;
  [0, 120, 240].forEach((deg) => {
    const a = (deg * Math.PI) / 180;
    kit.cylinder({ r: 0.03, h: legY, sides: 4 }).color(DULL_STEEL).at(TANK.x + Math.cos(a) * 0.45, 0, TANK.z + Math.sin(a) * 0.45);
  });
  kit.cylinder({ r: TANK.r, h: 1.2, sides: 12, cell: 0.4 }).color(STEEL).at(TANK.x, legY, TANK.z).collider();
  kit.cylinder({ r: TANK.r * 0.92, h: 0.05, sides: 12 }).color(DULL_STEEL).at(TANK.x, legY + 1.2, TANK.z);
  kit.cylinder({ r: 0.28, h: 0.04, sides: 10 }).color(0x8a8e8c).at(TANK.x + 0.1, legY + 1.25, TANK.z + 0.1);
  kit.box({ w: 0.2, h: 0.22, d: 0.2 }).color(0x4a5248).at(TANK.x - 0.2, legY + 1.25, TANK.z - 0.15);
  kit.box({ w: 0.5, h: 0.35, d: 0.12 }).color(0x5e6658).at(TANK.x + 0.95, 1.35, ROOM.z0 + 0.14);
  const pilot = ctx.state.time === 'night' ? 0xa03018 : 0x40a040;
  kit.box({ w: 0.03, h: 0.03, d: 0.02 }).color(pilot).unlit().at(TANK.x + 1.1, 1.55, ROOM.z0 + 0.21);
  kit.glow(0.12, pilot).at(TANK.x + 1.1, 1.565, ROOM.z0 + 0.24);
  // The pipe from the weighing bucket down and across to the tank.
  kit.box({ w: 1.0, h: 0.05, d: 0.05 }).color(DULL_STEEL).at(MILK_COUNTER.x - 0.75, 1.05, MILK_COUNTER.z - 0.75);
  look('Look at the tank', 'The cooling tank hums to itself. The steel is cold through my sleeve.', TANK.x + 0.4, TANK.z + 0.4, TANK.r);

  // The milk counter: a steel top on a tiled base, the bucket on its scale, the ledger.
  const c = MILK_COUNTER;
  kit.box({ w: c.w, h: c.h - 0.04, d: c.d }).texture('tiles_white', { tile: 0.6 }).color(0x8e9088).at(c.x, 0, c.z).collider();
  kit.box({ w: c.w + 0.06, h: 0.04, d: c.d + 0.06 }).color(STEEL).at(c.x, c.h - 0.04, c.z);
  const bucketZ = c.z - 0.5;
  kit.cylinder({ r: 0.26, h: 0.05, sides: 8 }).color(DULL_STEEL).at(c.x, c.h, bucketZ);
  kit.cylinder({ r: 0.24, h: 0.42, sides: 10 }).color(STEEL).at(c.x, c.h + 0.05, bucketZ);
  // The scale's dial faces the farmers.
  kit.mesh(new CylinderGeometry(0.11, 0.11, 0.03, 12).rotateZ(Math.PI / 2)).color(0xd8d4c4).at(c.x + 0.3, c.h + 0.17, bucketZ);
  kit.box({ w: 0.008, h: 0.09, d: 0.008 }).color(0x1a1a1a).at(c.x + 0.32, c.h + 0.13, bucketZ);
  kit.box({ w: 0.24, h: 0.03, d: 0.32 }).color(0x4a2a24).at(c.x, c.h, c.z + 0.35);
  kit.box({ w: 0.22, h: 0.006, d: 0.3 }).color(0xc8c2ae).at(c.x, c.h + 0.03, c.z + 0.35);
  kit.box({ w: 0.15, h: 0.01, d: 0.008 }).color(0x2a2a2a).at(c.x + 0.05, c.h + 0.036, c.z + 0.3).rotY(30);
  look('Look at the milk counter', 'A scale and a ledger. Names and litres in pencil, at six in the morning and six at night.', c.x + 0.2, c.z + 0.2, 0.5);

  // Two full cans a farmer left by the counter, and the washed ones draining on a bench.
  milkCan(kit, c.x + 0.62, 0, c.z - 0.3);
  milkCan(kit, c.x + 0.66, 0, c.z + 0.1);
  const benchX = ROOM.x0 + 0.4;
  kit.box({ w: 0.48, h: 0.32, d: 1.9 }).texture('wood_planks', { tile: 0.8 }).color(0x6a5a46).at(benchX, 0, -0.65).collider();
  [-1.35, -0.88, -0.41, 0.06].forEach((z) => milkCan(kit, benchX, 0.32, z, true));
  milkCan(kit, ROOM.x0 + 0.35, 0, 2.05);
  milkCan(kit, ROOM.x0 + 0.42, 0, 2.5);
  look('Look at the milk cans', "Milk cans, washed and turned upside down to drain. A farm's name is painted on each lid.", benchX + 0.3, -0.65, 0.6);

  // The deep sink and its tap, a hose coiled under it.
  kit.box({ w: 0.8, h: 0.82, d: 0.5 }).color(DULL_STEEL).at(-1.25, 0, ROOM.z0 + 0.33).collider();
  kit.box({ w: 0.7, h: 0.02, d: 0.4 }).color(0x3a3c3a).at(-1.25, 0.82, ROOM.z0 + 0.33);
  kit.cylinder({ r: 0.02, h: 0.3, sides: 4 }).color(STEEL).at(-1.25, 0.84, ROOM.z0 + 0.12);
  kit.box({ w: 0.04, h: 0.03, d: 0.16 }).color(STEEL).at(-1.25, 1.11, ROOM.z0 + 0.2);
  kit.cylinder({ r: 0.2, h: 0.1, sides: 8 }).color(0x2e3a2c).at(-0.5, 0, ROOM.z0 + 0.35);
}
