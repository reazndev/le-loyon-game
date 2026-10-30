import type { LevelKit } from '../../game/kit/levelKit';

const WALL_HEIGHT = 2.6;
const WALL_THICKNESS = 0.5;

/** A straight stone wall from (x1, z1) to (x2, z2), standing on y = 0. */
export function wall(kit: LevelKit, x1: number, z1: number, x2: number, z2: number, height = WALL_HEIGHT): void {
  const length = Math.hypot(x2 - x1, z2 - z1);
  kit
    .box({ w: length, h: height, d: WALL_THICKNESS })
    .texture('church_stone', { tile: 2.6 })
    .at((x1 + x2) / 2, 0, (z1 + z2) / 2)
    .rotY((Math.atan2(-(z2 - z1), x2 - x1) * 180) / Math.PI)
    .collider();
  // A cap of slightly wider stones breaks up the top edge.
  kit
    .box({ w: length + 0.1, h: 0.14, d: WALL_THICKNESS + 0.12 })
    .texture('church_stone', { tile: 1.2 })
    .color(0xb0aca2)
    .at((x1 + x2) / 2, height, (z1 + z2) / 2)
    .rotY((Math.atan2(-(z2 - z1), x2 - x1) * 180) / Math.PI);
}

/** An opening in a wall along X, with a lintel over it. */
export function doorway(kit: LevelKit, x1: number, x2: number, z: number, gap: number): void {
  const mid = (x1 + x2) / 2;
  wall(kit, x1, z, mid - gap / 2, z);
  wall(kit, mid + gap / 2, z, x2, z);
  kit
    .box({ w: gap + 0.4, h: 0.45, d: WALL_THICKNESS + 0.06 })
    .texture('church_stone', { tile: 1.2 })
    .color(0xa09c94)
    .at(mid, 2.05, z);
}

/** A cast-iron street lamp. When lit, its bulb glows and flickers. */
export function streetLamp(kit: LevelKit, x: number, z: number, lit: boolean): void {
  kit.cylinder({ r: 0.16, h: 0.5, sides: 6 }).texture('rust_metal', { tile: 0.5 }).color(0x605c58).at(x, 0, z).collider();
  kit.cylinder({ r: 0.06, h: 3.1, sides: 6 }).texture('rust_metal', { tile: 0.5 }).color(0x5a5652).at(x, 0, z);
  kit.box({ w: 0.42, h: 0.08, d: 0.42 }).texture('rust_metal').color(0x4a4744).at(x, 3.5, z);
  const glass = kit.box({ w: 0.3, h: 0.4, d: 0.3 }).at(x, 3.1, z);
  if (!lit) {
    glass.color(0x4e4c46);
    return;
  }
  glass.unlit().color(0xffcf86);
  kit.glow(1.6).at(x, 3.3, z);
  kit.light({ color: 0xffc070, intensity: 2.6, range: 9 }).flicker(0.18).at(x, 2.95, z);
}

export function crate(kit: LevelKit, x: number, z: number, yaw: number, size = 0.8): void {
  kit.box({ w: size, h: size, d: size }).texture('wood_planks', { tile: size }).at(x, 0, z).rotY(yaw).collider();
}

/** A round stone well with a low rim. */
export function well(kit: LevelKit, x: number, z: number): void {
  kit.cylinder({ r: 0.9, h: 0.75, sides: 10 }).texture('moss_rock', { tile: 1.5 }).at(x, 0, z).collider();
  kit.cylinder({ r: 0.7, h: 0.01, sides: 10 }).color(0x050505).unlit().at(x, 0.7, z);
  kit.box({ w: 0.1, h: 1.7, d: 0.1 }).texture('wood_planks').at(x - 0.85, 0, z);
  kit.box({ w: 0.1, h: 1.7, d: 0.1 }).texture('wood_planks').at(x + 0.85, 0, z);
  kit.box({ w: 1.9, h: 0.1, d: 0.1 }).texture('wood_planks').at(x, 1.7, z);
}

export function bench(kit: LevelKit, x: number, z: number, yaw: number): void {
  kit.group((g) => {
    g.box({ w: 1.6, h: 0.08, d: 0.45 }).texture('wood_planks', { tile: 1 }).at(0, 0.42, 0);
    g.box({ w: 0.12, h: 0.42, d: 0.4 }).texture('church_stone').at(-0.65, 0, 0);
    g.box({ w: 0.12, h: 0.42, d: 0.4 }).texture('church_stone').at(0.65, 0, 0);
    g.barrier({ w: 1.6, d: 0.45 });
  })
    .at(x, 0, z)
    .rotY(yaw);
}
