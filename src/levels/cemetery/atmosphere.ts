import type { Atmosphere } from '../../engine/render/atmosphere';
import type { LevelKit } from '../../game/kit/levelKit';
import type { TimeOfDay } from '../../game/state';
import type { SceneContext } from '../../game/scene';
import { breathVapor, drizzle, fogWisps, hourBells, loop, particles, weather, windSway } from '../../game/ambient';
import { rain } from '../../game/ambient/sounds';

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
    fog: { color: 0x040506, near: 0.4, far: 12, density: 0.14, wisps: 0.35 },
    ambient: 0x08090c,
    sun: { color: 0x07080c, direction: [-0.4, 1, 0.3] },
    saturation: 0.48,
  },
};

/**
 * The hill's air: very soft wind, stronger as the week goes on, mist low over the grass, and the
 * church bell from below. By day small sounds stay far off; at night they come closer, the
 * reporter's breath shows, and from night 2 a drizzle falls. `village` is the direction of the
 * church from the scene.
 */
export function hillAmbience(kit: LevelKit, ctx: SceneContext, village: { x: number; z: number }): void {
  const night = ctx.state.time === 'night';
  const sky = weather(ctx.state);
  kit.ambience('wind', { volume: (night ? 0.12 : 0.18) + sky.wind * 0.2 });
  kit.ambience('crackle', night ? { interval: 9, volume: 0.3, distance: [5, 15] } : { interval: 14, volume: 0.22 });
  windSway(kit, 0.5 + sky.wind);
  particles(kit, fogWisps(night ? { opacity: 0.3 } : {}));
  hourBells(kit, ctx, village, night ? 0.35 : 0.45);
  if (sky.breath) breathVapor(kit, ctx);
  if (!sky.drizzle) return;
  particles(kit, drizzle());
  loop(kit, () => rain(ctx.audio, { surface: 'leaves', volume: 0.28 }));
}
