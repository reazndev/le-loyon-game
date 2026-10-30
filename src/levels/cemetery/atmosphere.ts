import type { Atmosphere } from '../../engine/render/atmosphere';
import type { LevelKit } from '../../game/kit/levelKit';
import type { TimeOfDay } from '../../game/state';

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

/** Very soft wind over the hill. By day small sounds stay far off; at night they come closer. */
export function hillAmbience(kit: LevelKit, time: TimeOfDay): void {
  kit.ambience('wind', { volume: time === 'night' ? 0.16 : 0.26 });
  kit.ambience('crackle', time === 'night' ? { interval: 9, volume: 0.3, distance: [5, 15] } : { interval: 14, volume: 0.22 });
}
