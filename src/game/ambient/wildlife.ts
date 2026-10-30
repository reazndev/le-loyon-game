import type { Point3 } from '../../engine/audio/audioManager';
import { playFootstep } from '../../engine/audio/footsteps';
import type { LevelKit } from '../kit/levelKit';
import { playSound } from '../scares/sounds';
import type { SceneContext } from '../scene';
import { animalCall, preloadRecordings, rustle, type Animal } from './recordings';
import { around, everyFrame, nowAndThen } from './schedule';
import { suddenLife } from './suddenLife';
import { treeline } from './treeline';
import { wingFlaps } from './sounds';

/** What lives around a scene. The village has crows and owls; the forest has everything. */
export type Habitat = 'village' | 'field' | 'cemetery' | 'forest';

interface Caller {
  animal: Animal;
  /** Average seconds between calls. */
  every: number;
  /** How far off, in meters, and how high. */
  distance: [number, number];
  height: number;
  volume: number;
}

const DAY: Record<Habitat, Caller[]> = {
  village: [
    { animal: 'crow', every: 35, distance: [25, 60], height: 8, volume: 0.45 },
    { animal: 'buzzard', every: 140, distance: [90, 140], height: 50, volume: 0.35 },
  ],
  field: [
    { animal: 'crow', every: 30, distance: [30, 70], height: 6, volume: 0.5 },
    { animal: 'buzzard', every: 70, distance: [70, 120], height: 45, volume: 0.45 },
  ],
  cemetery: [{ animal: 'crow', every: 30, distance: [20, 50], height: 9, volume: 0.5 }],
  forest: [
    { animal: 'raven', every: 80, distance: [50, 100], height: 20, volume: 0.45 },
    { animal: 'crow', every: 60, distance: [40, 80], height: 15, volume: 0.35 },
    { animal: 'buzzard', every: 110, distance: [80, 120], height: 40, volume: 0.35 },
    { animal: 'deer', every: 150, distance: [50, 90], height: 0, volume: 0.45 },
  ],
};

const NIGHT: Record<Habitat, Caller[]> = {
  village: [
    { animal: 'owl', every: 70, distance: [50, 90], height: 10, volume: 0.4 },
    { animal: 'fox', every: 240, distance: [80, 140], height: 0, volume: 0.35 },
  ],
  field: [
    { animal: 'owl', every: 60, distance: [40, 80], height: 8, volume: 0.45 },
    { animal: 'fox', every: 150, distance: [60, 120], height: 0, volume: 0.45 },
    { animal: 'deer', every: 180, distance: [60, 100], height: 0, volume: 0.4 },
  ],
  cemetery: [
    { animal: 'owl', every: 50, distance: [30, 60], height: 10, volume: 0.5 },
    { animal: 'fox', every: 200, distance: [70, 120], height: 0, volume: 0.4 },
  ],
  forest: [
    { animal: 'owl', every: 40, distance: [25, 60], height: 12, volume: 0.55 },
    { animal: 'deer', every: 110, distance: [40, 80], height: 0, volume: 0.5 },
    { animal: 'fox', every: 160, distance: [60, 110], height: 0, volume: 0.45 },
  ],
};

/** Seconds the whole place can fall silent at once, at night, as if everything is listening. */
const HUSH = [35, 70] as const;

/**
 * The animals of an outdoor scene: real calls from all around at their own pace, and from time to
 * time something heavy moving through the undergrowth nearby. At night the calls sometimes all
 * stop together for a while, which is worse than any of them.
 */
export function wildlife(kit: LevelKit, ctx: SceneContext, habitat: Habitat): void {
  const night = ctx.state.time === 'night';
  const callers = (night ? NIGHT : DAY)[habitat];
  preloadRecordings(ctx.audio, [...new Set(callers.map((caller) => caller.animal)), 'bush']);
  let hushedUntil = 0;
  const quiet = () => ctx.time < hushedUntil;
  treeline(kit, ctx, { hushed: quiet, glimpses: habitat !== 'village' });
  suddenLife(kit, ctx, habitat);

  callers.forEach((caller) =>
    nowAndThen(kit, ctx, caller.every, () => {
      if (quiet()) return;
      const [near, far] = caller.distance;
      animalCall(ctx.audio, caller.animal, { at: around(ctx, near + Math.random() * (far - near), caller.height), volume: caller.volume });
    }),
  );

  if (habitat !== 'village') nowAndThen(kit, ctx, night ? 100 : 160, () => !quiet() && passingAnimal(ctx), 50);
  if (habitat === 'forest' || habitat === 'cemetery') nowAndThen(kit, ctx, 120, () => !quiet() && wingFlaps(ctx.audio, around(ctx, 15 + Math.random() * 20, 8), 1 + Math.floor(Math.random() * 3), 0.35), 60);
  if (!night) return;

  // The silence breaks with a twig, close behind.
  let breakAt: number | null = null;
  nowAndThen(kit, ctx, 200, () => {
    hushedUntil = ctx.time + HUSH[0] + Math.random() * (HUSH[1] - HUSH[0]);
    breakAt = hushedUntil;
  }, 150);
  everyFrame(kit, () => {
    if (breakAt === null || ctx.time < breakAt) return;
    breakAt = null;
    playSound(ctx.audio, 'sfx_branch', { at: around(ctx, 7 + Math.random() * 4, 0.3), volume: 0.6 });
  });
}

/**
 * Something on four legs crossing nearby through the undergrowth: steps in pairs moving along a
 * line past the player. Half the time it stops when it's closest, waits, and bolts.
 */
function passingAnimal(ctx: SceneContext): void {
  const p = ctx.player.position;
  const angle = Math.random() * Math.PI * 2;
  const side = 10 + Math.random() * 8;
  const centre = { x: p.x + Math.cos(angle) * side, z: p.z + Math.sin(angle) * side };
  const along = { x: -Math.sin(angle), z: Math.cos(angle) };
  const span = 14;
  const stops = Math.random() < 0.5;
  const at = (k: number): Point3 => ({ x: centre.x + along.x * span * (k - 0.5), y: p.y, z: centre.z + along.z * span * (k - 0.5) });
  const steps = 22;
  let time = 0;
  for (let i = 0; i < steps; i++) {
    const k = i / steps;
    if (stops && i === steps / 2) {
      // It has heard the player. Nothing, then a snapped twig, and it is off.
      time += 3.5 + Math.random() * 2;
      const snap = time;
      setTimeout(() => playSound(ctx.audio, 'sfx_branch', { at: at(k), volume: 0.7 }), snap * 1000);
    }
    const bolting = stops && i >= steps / 2;
    time += bolting ? 0.11 : 0.28 + Math.random() * 0.08;
    // A front foot then a back foot, close together, and now and then the bushes it pushes through.
    [0, bolting ? 0.05 : 0.09].forEach((offset) =>
      setTimeout(() => playFootstep(ctx.audio, 'grass', { at: at(k), level: bolting ? 0.9 : 0.5 }), (time + offset) * 1000),
    );
    if (i % 4 === 2) setTimeout(() => rustle(ctx.audio, 'bush', { at: at(k), volume: bolting ? 0.7 : 0.4 }), time * 1000);
  }
}
