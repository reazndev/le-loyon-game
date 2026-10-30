import type { ParticleSpec } from './particles';

/**
 * Particle fields tuned for the game's look. Each takes overrides, so a scene can make the rain
 * heavier or the dust thinner without restating the rest. Fields that `follow` the camera need
 * no position; place the others with `.at()`.
 */

type Preset = (overrides?: Partial<ParticleSpec>) => ParticleSpec;

const preset =
  (base: ParticleSpec): Preset =>
  (overrides = {}) => ({ ...base, ...overrides });

/** Low banks of mist drifting along the ground around the player. Takes the fog's own color. */
export const fogWisps = preset({
  count: 28,
  box: [20, 1.2, 20],
  follow: true,
  offset: [0, -1.25, 0],
  velocity: [0.18, 0, 0.07],
  sway: [0.6, 0.15, 0.6],
  speed: 0.2,
  size: 2.6,
  shape: 'soft',
  color: 0xffffff,
  fogTint: 1.14,
  opacity: 0.22,
  seed: 'fog-wisps',
});

/** Dead leaves coming down through the trees by day. */
export const fallingLeaves = preset({
  count: 70,
  box: [16, 8, 16],
  follow: true,
  offset: [0, 2, 0],
  velocity: [0.25, -0.55, 0.1],
  sway: [0.55, 0.12, 0.55],
  speed: 1.2,
  size: 0.07,
  shape: 'leaf',
  color: 0x7a5e38,
  seed: 'leaves',
});

/** Fine rain at night. It shows mostly where the torch catches it. */
export const drizzle = preset({
  count: 450,
  box: [12, 9, 12],
  follow: true,
  offset: [0, 1.5, 0],
  velocity: [0.6, -6.5, 0.25],
  size: 0.22,
  shape: 'streak',
  color: 0x9aa2a6,
  opacity: 0.6,
  seed: 'drizzle',
});

/** Dust hanging in a room, visible only where a window, a lamp, or the torch lights it. */
export const dustMotes = preset({
  count: 70,
  box: [3, 2, 3],
  velocity: [0.02, -0.012, 0.01],
  sway: [0.15, 0.1, 0.15],
  speed: 0.25,
  size: 0.02,
  shape: 'dot',
  color: 0xe0d6c4,
  opacity: 0.8,
  seed: 'dust',
});

/** Moths circling a lamp. Place at the bulb. */
export const moths = preset({
  count: 4,
  box: [0, 0.35, 0],
  orbit: 0.45,
  sway: [0.06, 0.06, 0.06],
  speed: 2.4,
  size: 0.035,
  shape: 'dot',
  color: 0xcfc6ae,
  seed: 'moths',
});

/** Flies circling over something left out. Place just above it. */
export const flies = preset({
  count: 5,
  box: [0, 0.25, 0],
  orbit: 0.32,
  sway: [0.05, 0.04, 0.05],
  speed: 4,
  size: 0.018,
  shape: 'dot',
  color: 0x18181a,
  seed: 'flies',
});
