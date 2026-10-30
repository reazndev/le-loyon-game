import type { Point3 } from '../../engine/audio/audioManager';
import type { LevelKit } from '../kit/levelKit';
import type { SceneContext } from '../scene';

/** Runs `work` every frame while the scene lasts, from the moment the build finishes. */
export function everyFrame(kit: LevelKit, work: (dt: number) => void): void {
  kit.use((ctx) => ctx.later('register', () => ctx.world.updates.add(work)));
}

/**
 * The wait before the next event of a process that happens on average every `mean` seconds.
 * Exponential gaps make events arrive in uneven clumps with long silences between; the floor
 * of a fifth of the mean keeps two from landing on top of each other.
 */
export function nextGap(mean: number, random: () => number = Math.random): number {
  return -Math.log(1 - random()) * mean + mean * 0.2;
}

/**
 * Calls `work` at random, on average every `mean` seconds, never while a dialogue or menu is
 * open. The first call comes after about `first` seconds.
 */
export function nowAndThen(kit: LevelKit, ctx: SceneContext, mean: number, work: () => void, first = mean): void {
  let wait = first * (0.5 + Math.random());
  everyFrame(kit, (dt) => {
    if (ctx.paused) return;
    wait -= dt;
    if (wait > 0) return;
    wait = nextGap(mean);
    work();
  });
}

/** A point `distance` meters from the player in a random direction, `y` meters above their feet. */
export function around(ctx: SceneContext, distance: number, y = 0): Point3 {
  const angle = Math.random() * Math.PI * 2;
  const p = ctx.player.position;
  return { x: p.x + Math.cos(angle) * distance, y: p.y + y, z: p.z + Math.sin(angle) * distance };
}
