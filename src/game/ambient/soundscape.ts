import type { Point3, SoundHandle } from '../../engine/audio/audioManager';
import { bark } from '../../engine/characters/voices';
import type { LevelKit } from '../kit/levelKit';
import type { SceneContext } from '../scene';
import { hoursRung, START_HOUR, strokesFor } from './bells';
import { around, everyFrame, nowAndThen } from './schedule';
import { distantBell, leafRustle, mouseScratch, passingEngine, trunkCreak } from './sounds';

/** Scene-level sound layers built from `sounds.ts`. Everything here stops with the scene. */

/** Starts a looping sound now and stops it when the scene ends. */
export function loop(kit: LevelKit, start: () => SoundHandle): SoundHandle {
  return kit.use((ctx) => ctx.world.sounds.track(start()));
}

/**
 * The church bell ringing the hours from far off, for every outdoor scene. `toward` is the
 * direction of the village from the scene, as a rough point; the bell plays 120 m that way.
 */
export function hourBells(kit: LevelKit, ctx: SceneContext, toward: { x: number; z: number }, volume = 0.5): void {
  const length = Math.hypot(toward.x, toward.z) || 1;
  const startHour = START_HOUR[ctx.state.time];
  let rung = 0;
  everyFrame(kit, () => {
    const due = hoursRung(ctx.time);
    if (due <= rung) return;
    rung = due;
    const p = ctx.player.position;
    distantBell(ctx.audio, { x: p.x + (toward.x / length) * 120, y: p.y + 10, z: p.z + (toward.z / length) * 120 }, strokesFor(startHour, due), volume);
  });
}

/**
 * Wind in trees: the shared wind, the leaves' hiss over it, and by `strength` now and then a
 * trunk groaning somewhere close. 0.3 is a still day, 1 a storm coming.
 */
export function windInTrees(kit: LevelKit, ctx: SceneContext, strength: number): void {
  kit.ambience('wind', { volume: 0.15 + strength * 0.25 });
  loop(kit, () => leafRustle(ctx.audio, strength));
  if (strength < 0.25) return;
  nowAndThen(kit, ctx, 40 / strength, () => trunkCreak(ctx.audio, around(ctx, 5 + Math.random() * 10, 3 + Math.random() * 5), 0.25 + strength * 0.25), 12);
}

/** A dog barking a few times somewhere far off, on average every `every` seconds. */
export function distantDog(kit: LevelKit, ctx: SceneContext, every = 90): void {
  nowAndThen(kit, ctx, every, () => {
    const at = around(ctx, 60 + Math.random() * 60, -2);
    const barks = 2 + Math.floor(Math.random() * 4);
    for (let i = 0; i < barks; i++) setTimeout(() => bark(ctx.audio, { at, volume: 0.5, bus: 'ambience' }), i * (450 + Math.random() * 300));
  });
}

/**
 * A car, now and then a tractor, passing on a road the player never sees. `road` is two far
 * points the road runs between; each pass goes one way or the other.
 */
export function distantTraffic(kit: LevelKit, ctx: SceneContext, road: [Point3, Point3], every = 120): void {
  nowAndThen(kit, ctx, every, () => {
    const [a, b] = Math.random() < 0.5 ? road : [road[1], road[0]];
    passingEngine(ctx.audio, a, b, { kind: Math.random() < 0.25 ? 'tractor' : 'car', volume: 0.45 });
  }, every * 0.4);
}

/** Mice in the walls: scratching at one of `spots`, chosen at random, every so often. */
export function miceInTheWalls(kit: LevelKit, ctx: SceneContext, spots: readonly Point3[], every = 35): void {
  nowAndThen(kit, ctx, every, () => mouseScratch(ctx.audio, spots[Math.floor(Math.random() * spots.length)]!), every * 0.5);
}
