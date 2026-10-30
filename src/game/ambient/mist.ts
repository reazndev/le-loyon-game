import type { LevelKit } from '../kit/levelKit';
import type { SceneContext } from '../scene';
import { particles, type ParticleSpec } from './particles';

/** A path as `[x, z]` points, as the forest scenes lay them out. */
type Path = readonly (readonly [number, number])[];

/** Soft pale points that follow the camera and take the fog's color, a little lifted. */
const MIST = { follow: true, shape: 'soft', color: 0xffffff, fogTint: 3.6, mist: true } satisfies Partial<ParticleSpec>;

/**
 * Mist you can see at night. Dark fog only shows as darkness, so these are pale banks of points
 * that the torch lights as it sweeps through them: a thick layer along the ground and larger banks
 * hanging at head height. They take the fog's color lifted, so with the torch off they are still
 * just there in the dark.
 */
export function nightMist(kit: LevelKit, ctx: SceneContext): void {
  if (ctx.state.time !== 'night') return;
  particles(kit, {
    ...MIST,
    count: 220,
    box: [24, 1.5, 24],
    offset: [0, -1.1, 0],
    velocity: [0.12, 0, 0.05],
    sway: [0.8, 0.12, 0.8],
    speed: 0.15,
    size: 2.6,
    opacity: 0.42,
    seed: 'night-mist-ground',
  });
  particles(kit, {
    ...MIST,
    count: 70,
    box: [26, 3, 26],
    offset: [0, 0.3, 0],
    velocity: [0.08, 0.01, -0.04],
    sway: [1.2, 0.3, 1.2],
    speed: 0.1,
    size: 4.5,
    opacity: 0.2,
    seed: 'night-mist-banks',
  });
}

/**
 * Mist hanging beside a path at night: still banks on both sides every `every` meters, low over
 * the verges, so the way ahead runs between walls of it. `ground` gives the height of the land.
 */
export function mistAlong(kit: LevelKit, ctx: SceneContext, path: Path, ground: (x: number, z: number) => number = () => 0, every = 9): void {
  if (ctx.state.time !== 'night') return;
  let along = 0;
  let side = 1;
  for (let i = 1; i < path.length; i++) {
    const [ax, az] = path[i - 1]!;
    const [bx, bz] = path[i]!;
    const length = Math.hypot(bx - ax, bz - az);
    for (; along < length; along += every) {
      const t = along / length;
      // Off to one side and then the other, about two and a half meters from the middle of the path.
      const nx = -(bz - az) / length;
      const nz = (bx - ax) / length;
      const x = ax + (bx - ax) * t + nx * 2.6 * side;
      const z = az + (bz - az) * t + nz * 2.6 * side;
      side = -side;
      particles(kit, {
        count: 14,
        box: [4.5, 1.2, 4.5],
        velocity: [0.05, 0, 0.02],
        sway: [0.6, 0.15, 0.6],
        speed: 0.12,
        size: 2.8,
        shape: 'soft',
        color: 0xffffff,
        fogTint: 3,
        mist: true,
        opacity: 0.35,
        seed: `path-mist-${i}-${Math.round(along)}`,
      }).at(x, ground(x, z) + 0.7, z);
    }
    along -= length;
  }
}
