import type { Point3 } from '../../engine/audio/audioManager';
import { distantTraffic, outdoorWeather } from '../../game/ambient';
import type { LevelKit } from '../../game/kit/levelKit';
import type { SceneContext } from '../../game/scene';

export interface FarmWeather {
  /** A tin roof or sheet the drizzle drums on. */
  tin: Point3;
  /** A road out of sight, two far points, for a car or a tractor now and then. */
  road: [Point3, Point3];
}

/**
 * The weather over an open farm: `outdoorWeather` with the drizzle drumming on the farm's tin,
 * and a car or a tractor now and then on a far road. The village ambience brings the wind, the
 * drip, and the bell.
 */
export function farmWeather(kit: LevelKit, ctx: SceneContext, { tin, road }: FarmWeather): void {
  outdoorWeather(kit, ctx, { rain: 0.22, tin: { at: tin, volume: 0.35 } });
  distantTraffic(kit, ctx, road, ctx.state.time === 'night' ? 320 : 200);
}
