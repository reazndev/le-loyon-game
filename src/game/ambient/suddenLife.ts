import type { Point3 } from '../../engine/audio/audioManager';
import type { LevelKit } from '../kit/levelKit';
import type { SceneContext } from '../scene';
import { startleAt, type StartleKind } from '../scares/startles';
import { critters } from './critters';
import { eyesInBeam } from './eyes';
import { preloadRecordings } from './recordings';
import { nowAndThen } from './schedule';
import { touches } from './touches';
import { edgeOfSight } from './treeline';
import type { Habitat } from './wildlife';

export type Setting = Habitat | 'indoors';

/** Where a startle goes off, relative to the player. */
type Spot = 'tree' | 'ground' | 'floor' | 'overhead' | 'behind';

interface Startler {
  kind: StartleKind;
  spot: Spot;
  /** Average seconds between them at night; by day they come at half the rate. */
  every: number;
  /** `false` for night only. */
  day?: false;
}

const TABLE: Record<Setting, Startler[]> = {
  forest: [
    { kind: 'crows', spot: 'tree', every: 50 },
    { kind: 'deer', spot: 'ground', every: 80 },
    { kind: 'fox', spot: 'ground', every: 110, day: false },
    { kind: 'hare', spot: 'ground', every: 70 },
    { kind: 'owl', spot: 'overhead', every: 120, day: false },
    { kind: 'owlFlight', spot: 'tree', every: 60 },
    { kind: 'crack', spot: 'behind', every: 55, day: false },
  ],
  field: [
    { kind: 'crows', spot: 'tree', every: 70 },
    { kind: 'hare', spot: 'ground', every: 70 },
    { kind: 'fox', spot: 'ground', every: 120, day: false },
    { kind: 'owl', spot: 'overhead', every: 160, day: false },
  ],
  cemetery: [
    { kind: 'crows', spot: 'tree', every: 60 },
    { kind: 'fox', spot: 'ground', every: 110, day: false },
    { kind: 'hare', spot: 'ground', every: 120 },
    { kind: 'owl', spot: 'overhead', every: 110, day: false },
    { kind: 'crack', spot: 'behind', every: 80, day: false },
  ],
  village: [
    { kind: 'pigeons', spot: 'tree', every: 100 },
    { kind: 'fox', spot: 'ground', every: 160, day: false },
    { kind: 'owl', spot: 'overhead', every: 200, day: false },
  ],
  indoors: [
    { kind: 'rats', spot: 'floor', every: 80 },
    { kind: 'creak', spot: 'behind', every: 90 },
  ],
};

/** Two startles never land within this many seconds of each other. */
const SPACING = 20;

function spotFor(ctx: SceneContext, spot: Spot): Point3 {
  const p = ctx.player.position;
  const forward = ctx.player.forward();
  switch (spot) {
    case 'tree':
      return edgeOfSight(ctx, 5 + Math.random() * 5, 3 + Math.random() * 4);
    case 'ground':
      return edgeOfSight(ctx, 7 + Math.random() * 6, 0);
    case 'floor':
      return edgeOfSight(ctx, 2 + Math.random() * 2, 0);
    case 'overhead':
      return { x: p.x - forward.x * 12, y: p.y + 7, z: p.z - forward.z * 12 };
    case 'behind':
      return { x: p.x - forward.x * 4 + (Math.random() - 0.5) * 4, y: p.y + 0.5, z: p.z - forward.z * 4 + (Math.random() - 0.5) * 4 };
  }
}

/** Average seconds between branches brushing the reporter's face in the forest. */
const TOUCH_EVERY = 90;

/**
 * Sudden movement and noise on a clock: crows bursting out of the trees, a deer or a hare bolting
 * across, an owl swooping low, a branch cracking close behind; indoors, rats along the floor and
 * the boards groaning. Busier at night. Outside the village, eyes shine in the torch beam at
 * night, and in the forest branches brush the reporter's face. Placed startles in the levels
 * come on top of these.
 */
export function suddenLife(kit: LevelKit, ctx: SceneContext, setting: Setting): void {
  const night = ctx.state.time === 'night';
  const pool = kit.use(critters);
  const startlers = TABLE[setting].filter((startler) => night || startler.day !== false);
  preloadRecordings(ctx.audio, ['bush', 'crow', 'owl', 'deer', 'fox']);
  if (setting !== 'indoors' && setting !== 'village') eyesInBeam(kit, ctx);
  if (setting === 'forest') touches(kit, ctx, TOUCH_EVERY);
  let last = Number.NEGATIVE_INFINITY;
  startlers.forEach(({ kind, spot, every }) =>
    nowAndThen(kit, ctx, night ? every : every * 2, () => {
      if (ctx.time - last < SPACING) return;
      last = ctx.time;
      startleAt(ctx, pool, kind, spotFor(ctx, spot));
    }),
  );
}
