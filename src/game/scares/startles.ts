import type { Point3 } from '../../engine/audio/audioManager';
import { playFootstep } from '../../engine/audio/footsteps';
import { animalCall } from '../ambient/recordings';
import { ratsScatter, wingFlaps } from '../ambient/sounds';
import type { SceneContext } from '../scene';
import type { Beat, Zone } from './beats';
import { playSound } from './sounds';

/**
 * Loud scares with a cause in the world. The player walks up to something and it goes off right
 * beside them: crows bursting out of a tree, an owl screeching from a branch overhead, a deer
 * crashing away through the undergrowth.
 */
export type StartleKind = 'crows' | 'pigeons' | 'owl' | 'deer' | 'rats';

const startles: Record<StartleKind, (ctx: SceneContext, at: Point3) => void> = {
  crows: ({ audio }, at) => {
    wingFlaps(audio, at, 9, 2.2);
    animalCall(audio, 'crow', { at, volume: 2, bus: 'sfx' });
    setTimeout(() => animalCall(audio, 'crow', { at: { ...at, y: at.y + 4 }, volume: 1.4, bus: 'sfx' }), 450);
  },
  pigeons: ({ audio }, at) => wingFlaps(audio, at, 14, 2.6),
  owl: ({ audio }, at) => {
    animalCall(audio, 'owl', { at, volume: 2.4, bus: 'sfx' });
    wingFlaps(audio, at, 1, 1.4);
  },
  deer: ({ audio }, at) => {
    playSound(audio, 'sfx_branch', { at, volume: 1.8 });
    animalCall(audio, 'deer', { at, volume: 2.2, bus: 'sfx' });
    // It crashes off away from the player.
    for (let i = 0; i < 10; i++) setTimeout(() => playFootstep(audio, 'grass', { at: { x: at.x + i * 0.9, y: at.y, z: at.z - i * 0.9 }, level: 1.4 }), 150 + i * 120);
  },
  rats: ({ audio }, at) => ratsScatter(audio, at, 2),
};

/**
 * A startle that fires once per game the first time the player walks into `zone`. The noise
 * comes from `from`, which should be the tree, bush, or rafter it starts in.
 */
export function startle(id: string, kind: StartleKind, zone: Zone, from: Point3): Beat {
  return { id: `startle_${id}`, when: { enter: zone }, do: [{ run: (ctx) => startles[kind](ctx, from) }], set: `startle_${id}` };
}
