import type { LevelKit } from '../../game/kit/levelKit';
import type { SceneContext } from '../../game/scene';
import { crows, fallingLeaves, loop, outdoorWeather, particles } from '../../game/ambient';
import { radio, tvMurmur } from '../inn/sounds';
import { DOOR } from './house';
import { wildlife } from '../../game/ambient/wildlife';

/**
 * The doorstep's own layers over the village's: mist on the lawn, drizzle from night 2 with rain
 * on the porch roof, leaves off the apple tree and two crows on the garden wall by day, and the
 * house heard through its front wall: Odile's radio by day, and at night, with every window
 * dark, a television turned very low upstairs.
 */
export function doorstepAmbient(kit: LevelKit, ctx: SceneContext, apple: { x: number; z: number }, gate: { x: number; z: number }): void {
  wildlife(kit, ctx, 'village');
  const night = ctx.state.time === 'night';
  outdoorWeather(kit, ctx, { rain: 0.18, tin: { at: { x: DOOR.x, y: 2.6, z: DOOR.z }, volume: 0.22 } });
  if (night) {
    loop(kit, () => tvMurmur(ctx.audio, { x: DOOR.x + 2.4, y: 3.6, z: DOOR.z - 2.4 }, 0.1));
    return;
  }
  loop(kit, () => radio(ctx.audio, { x: DOOR.x + 1.6, y: 1.3, z: DOOR.z - 2.2 }, 0.14));
  particles(kit, fallingLeaves({ follow: false, box: [4.5, 4.6, 4.5], count: 10, seed: 'gremaud-apple-leaves' })).at(apple.x, 2.35, apple.z);
  crows(kit, ctx, [
    { x: gate.x + 5.8, z: gate.z, y: 0.55, yaw: 150 },
    { x: gate.x - 6.6, z: gate.z, y: 0.55, yaw: 220 },
  ], 45);
}
