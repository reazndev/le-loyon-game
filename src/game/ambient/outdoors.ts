import type { Point3 } from '../../engine/audio/audioManager';
import type { LevelKit } from '../kit/levelKit';
import type { SceneContext } from '../scene';
import { breathVapor } from './breath';
import { particles } from './particles';
import { drizzle, fogWisps } from './presets';
import { rain } from './sounds';
import { loop } from './soundscape';
import { windSway } from './sway';
import { weather, type Weather } from './weather';
import { nightMist } from './mist';

export interface OutdoorWeather {
  /** How loud the drizzle hisses in the grass and leaves all around. */
  rain?: number;
  /** A tin roof, a porch, or a loose sheet close by that the drizzle drums on. */
  tin?: { at: Point3; volume: number };
}

/**
 * The weather in an open outdoor scene, from `weather()`: grass and tree cards in the wind,
 * mist along the ground, the reporter's breath, and from night 2 the drizzle, with its hiss
 * all around and on `tin` if there is one. Returns the weather for the scene's own layers.
 */
export function outdoorWeather(kit: LevelKit, ctx: SceneContext, options: OutdoorWeather = {}): Weather {
  const night = ctx.state.time === 'night';
  const sky = weather(ctx.state);
  windSway(kit, 0.5 + sky.wind);
  particles(kit, fogWisps(night ? { opacity: 0.3 } : {}));
  nightMist(kit, ctx);
  if (sky.breath) breathVapor(kit, ctx);
  if (sky.drizzle) {
    particles(kit, drizzle());
    loop(kit, () => rain(ctx.audio, { surface: 'leaves', volume: options.rain ?? 0.2 }));
    const tin = options.tin;
    if (tin) loop(kit, () => rain(ctx.audio, { at: tin.at, surface: 'tin', volume: tin.volume }));
  }
  return sky;
}
