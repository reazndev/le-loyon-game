import type { Point3 } from '../../engine/audio/audioManager';
import { breathVapor, distantTraffic, drizzle, fogWisps, loop, particles, weather, windSway } from '../../game/ambient';
import { rain } from '../../game/ambient/sounds';
import type { LevelKit } from '../../game/kit/levelKit';
import type { SceneContext } from '../../game/scene';

export interface FarmWeather {
  /** A tin roof or sheet the drizzle drums on. */
  tin: Point3;
  /** A road out of sight, two far points, for a car or a tractor now and then. */
  road: [Point3, Point3];
}

/**
 * The weather over an open farm, from `weather()`: mist along the ground, the grass and the
 * trees in the wind, the reporter's breath at night, and from night 2 the drizzle, hissing in the
 * grass and drumming on the tin. The village ambience brings the wind, the drip, and the bell.
 */
export function farmWeather(kit: LevelKit, ctx: SceneContext, { tin, road }: FarmWeather): void {
  const night = ctx.state.time === 'night';
  const sky = weather(ctx.state);
  windSway(kit, 0.5 + sky.wind);
  particles(kit, fogWisps(night ? { opacity: 0.3 } : {}));
  if (sky.breath) breathVapor(kit, ctx);
  if (sky.drizzle) {
    particles(kit, drizzle());
    loop(kit, () => rain(ctx.audio, { surface: 'leaves', volume: 0.22 }));
    loop(kit, () => rain(ctx.audio, { at: tin, surface: 'tin', volume: 0.35 }));
  }
  distantTraffic(kit, ctx, road, night ? 320 : 200);
}
