import type { SoundHandle } from '../../engine/audio/audioManager';
import type { AudioManager } from '../../engine/audio/audioManager';
import type { LevelKit } from '../../game/kit/levelKit';

/**
 * Building blocks shared by the village interiors: the inn, the laiterie, the garage, and the
 * Gremaud kitchen. Walls with openings cut in them, floors and ceilings,
 * hanging lamps, and looping sounds that stop with the scene.
 */

export const WALL = 0.16;

/** How a wall is dressed: its texture and tint, and an optional wainscot along the bottom. */
export interface Finish {
  texture: string;
  tile?: number;
  color?: number;
  dado?: { texture: string; color: number; h: number; tile?: number };
}

/** An opening in a wall: `at` meters from the wall's start to its middle, `y` above the wall's foot. */
export interface Gap {
  at: number;
  w: number;
  h: number;
  y?: number;
}

/** A rectangle in plan with its floor height and ceiling height above that floor. */
export interface Room {
  x0: number;
  x1: number;
  z0: number;
  z1: number;
  h: number;
  /** Floor height. Default 0. */
  y?: number;
}

/**
 * A wall from one point to another, standing on `base`, with openings cut in it. Walls collide
 * at every height, because collision is flat: keep upstairs walls clear of downstairs rooms.
 */
export function wall(kit: LevelKit, from: [number, number], to: [number, number], h: number, finish: Finish, gaps: Gap[] = [], base = 0): void {
  const [x1, z1] = from;
  const [x2, z2] = to;
  const length = Math.hypot(x2 - x1, z2 - z1);
  const yaw = (Math.atan2(-(z2 - z1), x2 - x1) * 180) / Math.PI;
  const point = (along: number) => [x1 + ((x2 - x1) * along) / length, z1 + ((z2 - z1) * along) / length] as const;
  const piece = (a: number, b: number, y0: number, y1: number) => {
    if (b - a < 0.01 || y1 - y0 < 0.01) return;
    const [x, z] = point((a + b) / 2);
    const slab = kit.box({ w: b - a, h: y1 - y0, d: WALL, cell: 0.8 }).texture(finish.texture, { tile: finish.tile ?? 1.6 }).at(x, base + y0, z).rotY(yaw);
    if (finish.color !== undefined) slab.color(finish.color);
    if (y0 === 0) slab.collider();
    const dado = finish.dado;
    if (!dado || y0 > 0) return;
    kit
      .box({ w: b - a, h: Math.min(dado.h, y1), d: WALL + 0.03, cell: 0.8 })
      .texture(dado.texture, { tile: dado.tile ?? 1.2 })
      .color(dado.color)
      .at(x, base, z)
      .rotY(yaw);
  };
  let start = 0;
  [...gaps]
    .sort((a, b) => a.at - b.at)
    .forEach((gap) => {
      const a = gap.at - gap.w / 2;
      const b = gap.at + gap.w / 2;
      piece(start, a, 0, h);
      piece(a, b, 0, gap.y ?? 0);
      piece(a, b, (gap.y ?? 0) + gap.h, h);
      start = b;
    });
  piece(start, length, 0, h);
}

/** A floor the player walks on and a ceiling over it. */
export function floorAndCeiling(
  kit: LevelKit,
  room: Room,
  floor: { texture: string; tile?: number; color?: number; surface?: 'wood' | 'stone' },
  ceiling: { texture: string; tile?: number; color?: number },
): void {
  const w = room.x1 - room.x0;
  const d = room.z1 - room.z0;
  const x = (room.x0 + room.x1) / 2;
  const z = (room.z0 + room.z1) / 2;
  const y = room.y ?? 0;
  const ground = kit.box({ w, h: 0.05, d, cell: 0.6 }).texture(floor.texture, { tile: floor.tile ?? 1.4 }).at(x, y - 0.05, z).walkable(floor.surface ?? 'wood');
  if (floor.color !== undefined) ground.color(floor.color);
  const top = kit.ceiling({ w, d, cell: 0.9 }).texture(ceiling.texture, { tile: ceiling.tile ?? 2 }).at(x, y + room.h, z);
  if (ceiling.color !== undefined) top.color(ceiling.color);
}

/** Wood strips along the foot of a wall from one point to another. */
export function skirting(kit: LevelKit, from: [number, number], to: [number, number], base = 0, color = 0x4a3a2c): void {
  const [x1, z1] = from;
  const [x2, z2] = to;
  const yaw = (Math.atan2(-(z2 - z1), x2 - x1) * 180) / Math.PI;
  kit.box({ w: Math.hypot(x2 - x1, z2 - z1), h: 0.1, d: 0.03 }).color(color).at((x1 + x2) / 2, base, (z1 + z2) / 2).rotY(yaw);
}

/** A bulb under a shade on a cord, its glow, and the light it gives. Returns the light builder. */
export function pendantLamp(
  kit: LevelKit,
  at: { x: number; y: number; z: number },
  options: { color?: number; intensity?: number; range?: number; on?: boolean; flicker?: number; drop?: number } = {},
) {
  const { color = 0xffc77a, intensity = 1.6, range = 6, on = true, flicker = 0.04, drop = 0.6 } = options;
  kit.cylinder({ r: 0.008, h: drop, sides: 4 }).color(0x1a1a1a).at(at.x, at.y - drop, at.z);
  kit.cylinder({ r: 0.17, h: 0.14, sides: 8 }).texture('rust_metal', { tile: 0.4 }).color(0x4e5a48).doubleSided().at(at.x, at.y - drop - 0.12, at.z);
  const bulb = kit.cylinder({ r: 0.05, h: 0.08, sides: 6 }).at(at.x, at.y - drop - 0.17, at.z);
  if (!on) {
    bulb.color(0x3a3630);
    return null;
  }
  bulb.color(0xffe2a8).unlit();
  kit.glow(0.7, 0x8a6430).at(at.x, at.y - drop - 0.14, at.z);
  return kit.light({ color, intensity, range }).flicker(flicker).at(at.x, at.y - drop - 0.3, at.z);
}

/** Starts a looping sound and stops it when the scene unloads. */
export function loopSound(kit: LevelKit, start: (audio: AudioManager) => SoundHandle): SoundHandle {
  return kit.use((ctx) => ctx.world.sounds.track(start(ctx.audio)));
}
