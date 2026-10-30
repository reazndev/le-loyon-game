import type { Atmosphere } from '../../engine/render/atmosphere';
import type { LevelKit } from '../../game/kit/levelKit';
import type { TimeOfDay } from '../../game/state';
import type { SceneContext } from '../../game/scene';
import { hourBells, outdoorWeather, weather } from '../../game/ambient';
import { wildlife } from '../../game/ambient/wildlife';

/**
 * The hill above the village, shared by the cemetery and the path up to it. By day it is grey and
 * wet. At night the fog is thick enough that only the stones nearest the torch are clear.
 */
export const hillAtmosphere: Record<TimeOfDay, Atmosphere> = {
  day: {
    fog: { color: 0x8f928f, near: 1, far: 17, density: 0.085, wisps: 0.55 },
    ambient: 0x62645f,
    sun: { color: 0x4c4d48, direction: [0.25, 1, 0.5] },
    saturation: 0.5,
  },
  night: {
    fog: { color: 0x07090e, near: 0.3, far: 12, density: 0.26, wisps: 0.65 },
    ambient: 0x04060b,
    sun: { color: 0x07080c, direction: [-0.4, 1, 0.3] },
    saturation: 0.6,
  },
};

/**
 * The hill's air: very soft wind, stronger as the week goes on, mist low over the grass, and the
 * church bell from below. By day small sounds stay far off; at night they come closer, the
 * reporter's breath shows, and from night 2 a drizzle falls. `village` is the direction of the
 * church from the scene; `bells` false keeps the hour and the animals out of a silence a beat builds.
 */
export function hillAmbience(kit: LevelKit, ctx: SceneContext, village: { x: number; z: number }, bells = true): void {
  const night = ctx.state.time === 'night';
  const sky = weather(ctx.state);
  kit.ambience('wind', { volume: (night ? 0.12 : 0.18) + sky.wind * 0.2 });
  kit.ambience('crackle', night ? { interval: 9, volume: 0.3, distance: [5, 15] } : { interval: 14, volume: 0.22 });
  outdoorWeather(kit, ctx, { rain: 0.28 });
  if (!bells) return;
  hourBells(kit, ctx, village, night ? 0.35 : 0.45);
  wildlife(kit, ctx, 'cemetery');
}
