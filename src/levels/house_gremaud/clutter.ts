import type { LevelKit } from '../../game/kit/levelKit';
import { puddle } from '../village_square/props';
import { DOOR } from './house';

/**
 * What stands about Odile's doorstep: a mat, an umbrella stand, rubber boots by the scraper, a
 * broom against the porch, two pots of dead geraniums, the letterbox by the gate with the paper
 * still in it, and a puddle in the path. Still, for the batch; nothing here blocks the player.
 */
export function doorstepClutter(kit: LevelKit, gate: { x: number; z: number }, day: boolean): void {
  const step = { y: 0.2, z: DOOR.z + 0.35 };
  kit.box({ w: 0.75, h: 0.015, d: 0.42 }).texture('wood_planks', { tile: 0.3 }).color(0x4a3e30).at(DOOR.x, step.y, step.z);
  umbrellaStand(kit).at(DOOR.x + 0.82, step.y, DOOR.z + 0.2);
  boots(kit).at(DOOR.x - 0.85, step.y, step.z + 0.05).rotY(-10);
  broom(kit).at(DOOR.x - 0.62, step.y, DOOR.z + 0.12);
  [
    [DOOR.x - 1.55, step.z + 0.1],
    [DOOR.x + 1.3, step.z + 0.2],
  ].forEach(([x, z]) => flowerPot(kit).at(x!, 0, z!));
  letterbox(kit).at(gate.x + 1.15, 0, gate.z + 0.45);
  puddle(kit, 0.9, 0.6, day).at(gate.x + 0.1, 0.04, gate.z - 2.6);
}

/** A tin umbrella stand with a black umbrella and a walking stick in it. */
function umbrellaStand(kit: LevelKit) {
  return kit.group((g) => {
    g.cylinder({ r: 0.11, h: 0.5, sides: 8 }).texture('rust_metal', { tile: 0.5 }).color(0x5a5a50);
    g.box({ w: 0.05, h: 0.75, d: 0.05 }).color(0x161616).at(0.03, 0.2, 0.02);
    g.box({ w: 0.03, h: 0.03, d: 0.1 }).color(0x3a2a20).at(0.03, 0.95, 0.05);
    g.box({ w: 0.025, h: 0.72, d: 0.025 }).color(0x5a4430).at(-0.04, 0.2, -0.03);
  });
}

/** A pair of green rubber boots, one standing, one fallen over. */
function boots(kit: LevelKit) {
  const green = 0x2e3a2c;
  return kit.group((g) => {
    g.box({ w: 0.11, h: 0.34, d: 0.12 }).color(green).at(0, 0, 0);
    g.box({ w: 0.11, h: 0.09, d: 0.17 }).color(green).at(0, 0, -0.1);
    g.box({ w: 0.11, h: 0.11, d: 0.34 }).color(green).at(0.16, 0, 0.06).rotY(20);
    g.box({ w: 0.1, h: 0.08, d: 0.12 }).color(0x3e3428).at(0.17, 0.1, -0.06);
  });
}

/** A birch broom leaning on the porch wall. */
function broom(kit: LevelKit) {
  const placed = kit.group((g) => {
    g.box({ w: 0.03, h: 1.2, d: 0.03 }).color(0x7a6448).at(0, 0.3, 0);
    g.box({ w: 0.2, h: 0.32, d: 0.12 }).texture('bark_birch', { tile: 0.3 }).color(0x6a5a40);
  });
  placed.object.rotation.x = -0.12;
  return placed;
}

/** A terracotta pot of geraniums dead from the first frost. */
function flowerPot(kit: LevelKit) {
  return kit.group((g) => {
    g.cylinder({ r: 0.14, h: 0.22, sides: 8 }).color(0x6a4434);
    g.cylinder({ r: 0.12, h: 0.02, sides: 8 }).color(0x2e2620).at(0, 0.2, 0);
    [
      [-0.04, 0.02, 0.18],
      [0.05, -0.03, 0.12],
      [0, 0.05, 0.22],
    ].forEach(([x, z, h]) => g.box({ w: 0.015, h: h!, d: 0.015 }).color(0x4a4232).at(x!, 0.22, z!));
    g.box({ w: 0.12, h: 0.04, d: 0.1 }).color(0x5a4a34).at(0.02, 0.3, 0);
  });
}

/** The letterbox on its post by the gate, with the syndic's name and La Liberté sticking out. */
function letterbox(kit: LevelKit) {
  return kit.group((g) => {
    g.box({ w: 0.07, h: 0.95, d: 0.07 }).color(0x3a3a38);
    g.box({ w: 0.36, h: 0.3, d: 0.28 }).color(0x4e5a50).at(0, 0.95, 0);
    g.box({ w: 0.24, h: 0.025, d: 0.01 }).color(0x1a1a18).at(0, 1.16, 0.145);
    g.box({ w: 0.16, h: 0.05, d: 0.01 }).color(0xc8c4b4).at(0, 1.05, 0.145);
    // The morning paper, folded and pushed in half way.
    g.box({ w: 0.2, h: 0.03, d: 0.12 }).color(0xb8b4a4).at(0.02, 1.155, 0.17).rotY(8);
  });
}
