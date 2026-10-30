import { drips, dustMotes, loop, miceInTheWalls, particles } from '../../game/ambient';
import type { LevelKit } from '../../game/kit/levelKit';
import type { SceneContext } from '../../game/scene';
import { ventHum } from '../forest_path/sounds';
import { RADIO } from './clutter';
import { radioStatic } from './sounds';

/**
 * What moves and sounds in Marc's room when nobody does: dust in the candle and the torch, the
 * radio he left on, mice behind the concrete, the draw of air from the tunnel, and water
 * dripping from the pipe's crown.
 */
export function roomAmbience(kit: LevelKit, ctx: SceneContext, candle: { x: number; y: number; z: number }, tunnel: { x0: number; x1: number; r: number }): void {
  particles(kit, dustMotes({ count: 40, box: [2.2, 1.3, 1.8], opacity: 0.45, size: 0.015, seed: 'kp3-candle' })).at(candle.x, candle.y + 0.5, candle.z);
  particles(kit, dustMotes({ count: 35, box: [5, 2, 5], follow: true, opacity: 0.35, size: 0.012, seed: 'kp3-torch' }));

  loop(kit, () => radioStatic(ctx.audio, RADIO));
  loop(kit, () => ventHum(ctx.audio, { x: tunnel.x0, y: 1.1, z: 0 }, 0.1));
  miceInTheWalls(kit, ctx, [
    { x: 6, y: 0.2, z: 1.6 },
    { x: 0, y: 0.3, z: -1.6 },
    { x: 3.2, y: 0.1, z: 2 },
  ], 45);

  const top = tunnel.r * 2 - 0.08;
  drips(
    kit,
    ctx,
    [9.5, 17, 28, 41].map((x, i) => ({ x, z: i % 2 ? 0.12 : -0.1, top, bottom: 0.07 })),
    3.1,
    0.22,
  );
}
