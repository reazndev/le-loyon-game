import type { Point3 } from '../../engine/audio/audioManager';
import { playFootstep } from '../../engine/audio/footsteps';
import type { Critters, Runner } from '../ambient/critters';
import { animalCall, rustle } from '../ambient/recordings';
import { ratsScatter, wingFlaps } from '../ambient/sounds';
import type { SceneContext } from '../scene';
import type { Beat, Zone } from './beats';
import { playSound } from './sounds';

/**
 * Loud scares with a cause in the world. The player walks up to something and it goes off right
 * beside them: crows bursting out of a tree, an owl swooping low out of a branch or lifting off
 * one and flapping away into the trees, a deer crashing away through the undergrowth. The animal is seen as well as heard.
 */
export type StartleKind = 'crows' | 'pigeons' | 'owl' | 'owlFlight' | 'deer' | 'fox' | 'hare' | 'rats' | 'crack' | 'creak';

/** Closer than this, a loud startle also flashes and shakes the frame. */
const JOLT_DISTANCE = 7;
const LOUD = new Set<StartleKind>(['crows', 'pigeons', 'owl', 'owlFlight', 'deer', 'crack']);

/** A point `distance` meters on from `at`, straight away from the player. */
function awayFrom(ctx: SceneContext, at: Point3, distance: number): Point3 {
  const p = ctx.player.position;
  const angle = Math.atan2(at.x - p.x, at.z - p.z) + (Math.random() - 0.5) * 0.8;
  return { x: at.x + Math.sin(angle) * distance, y: at.y, z: at.z + Math.cos(angle) * distance };
}

/** A runner crashing off: the snap where it starts, then hooves or paws going away. */
function bolt(ctx: SceneContext, critters: Critters, kind: Runner, at: Point3): void {
  const { distance, seconds, level } = { deer: { distance: 16, seconds: 1.7, level: 1.4 }, fox: { distance: 12, seconds: 1.3, level: 0.8 }, hare: { distance: 10, seconds: 0.9, level: 0.5 } }[kind];
  const to = awayFrom(ctx, at, distance);
  critters.bolt(kind, at, to, seconds);
  if (kind !== 'hare') playSound(ctx.audio, 'sfx_branch', { at, volume: level + 0.4 });
  rustle(ctx.audio, 'bush', { at, volume: 1, bus: 'sfx' });
  const steps = Math.round(seconds / 0.13);
  for (let i = 0; i < steps; i++) {
    const k = i / steps;
    const step = { x: at.x + (to.x - at.x) * k, y: at.y, z: at.z + (to.z - at.z) * k };
    setTimeout(() => playFootstep(ctx.audio, 'grass', { at: step, level }), 120 + i * 130);
  }
}

const startles: Record<StartleKind, (ctx: SceneContext, critters: Critters, at: Point3) => void> = {
  crows: ({ audio }, critters, at) => {
    critters.burst(at, 6);
    wingFlaps(audio, at, 9, 2.2);
    animalCall(audio, 'crow', { at, volume: 2, bus: 'sfx' });
    setTimeout(() => animalCall(audio, 'crow', { at: { ...at, y: at.y + 4 }, volume: 1.4, bus: 'sfx' }), 450);
  },
  pigeons: ({ audio }, critters, at) => {
    critters.burst(at, 8);
    wingFlaps(audio, at, 14, 2.6);
  },
  owl: (ctx, critters, at) => {
    critters.swoop(at, awayFrom(ctx, { ...at, x: 2 * ctx.player.position.x - at.x, z: 2 * ctx.player.position.z - at.z }, 6));
    animalCall(ctx.audio, 'owl', { at, volume: 2.4, bus: 'sfx' });
    wingFlaps(ctx.audio, at, 1, 1.6);
  },
  owlFlight: (ctx, critters, at) => {
    critters.flyOff(at);
    rustle(ctx.audio, 'leaves', { at, volume: 1.2, bus: 'sfx' });
    wingFlaps(ctx.audio, at, 1, 2);
    setTimeout(() => animalCall(ctx.audio, 'owl', { at: awayFrom(ctx, at, 12), volume: 1.6, bus: 'sfx' }), 1200);
  },
  deer: (ctx, critters, at) => {
    bolt(ctx, critters, 'deer', at);
    animalCall(ctx.audio, 'deer', { at, volume: 2.2, bus: 'sfx' });
  },
  fox: (ctx, critters, at) => {
    bolt(ctx, critters, 'fox', at);
    setTimeout(() => animalCall(ctx.audio, 'fox', { at, volume: 1.6, bus: 'sfx' }), 700);
  },
  hare: (ctx, critters, at) => bolt(ctx, critters, 'hare', at),
  rats: ({ audio }, critters, at) => {
    critters.scurry(at);
    ratsScatter(audio, at, 2);
  },
  crack: ({ audio }, _, at) => playSound(audio, 'sfx_branch', { at, volume: 2.2 }),
  creak: ({ audio }, _, at) => playSound(audio, 'sfx_floorboard', { at, volume: 2 }),
};

/** Sets a startle off at `at` now: its sound, its animal, and a jolt when it is loud and close. */
export function startleAt(ctx: SceneContext, critters: Critters, kind: StartleKind, at: Point3): void {
  startles[kind](ctx, critters, at);
  const p = ctx.player.position;
  if (LOUD.has(kind) && Math.hypot(at.x - p.x, at.z - p.z) < JOLT_DISTANCE) ctx.jolt();
}

/**
 * A startle that fires once per game the first time the player walks into `zone`. The noise
 * comes from `from`, which should be the tree, bush, or rafter it starts in.
 */
export function startle(id: string, kind: StartleKind, zone: Zone, from: Point3): Beat {
  return { id: `startle_${id}`, when: { enter: zone }, do: [{ startle: kind, from }], set: `startle_${id}` };
}
