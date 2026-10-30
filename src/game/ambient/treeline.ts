import type { Point3 } from '../../engine/audio/audioManager';
import { noiseBurst } from '../../engine/audio/generators';
import { oneShot } from '../../engine/characters/voices';
import type { LevelKit } from '../kit/levelKit';
import type { SceneContext } from '../scene';
import { preloadRecordings, rustle } from './recordings';
import { everyFrame } from './schedule';
import { gust } from './sway';

export interface TreelineOptions {
  /** Whether the place has gone quiet, which makes the trees busier. */
  hushed?: () => boolean;
  /** A dark shape can dart between the trees at the edge of the fog. Off where there are no trees. */
  glimpses?: boolean;
}

/** How long after a scare the treeline stays restless, in seconds. */
const AFTER_SCARE = 90;
/** Average seconds between events at a tension of 1. */
const GUST_EVERY = 70;
const STIR_EVERY = 35;

/**
 * Movement in the treeline. Gusts run through the trees, the leaves rushing and the tops leaning
 * as the wind passes; something pushes through the undergrowth at the edge of sight; and when it
 * is tense, a dark shape darts between the trunks at the edge of the fog. Calm by day, busier at
 * night, and busiest after a scare or while everything else has gone quiet.
 */
export function treeline(kit: LevelKit, ctx: SceneContext, options: TreelineOptions = {}): void {
  preloadRecordings(ctx.audio, ['bush', 'leaves']);
  const shape = options.glimpses ? darkShape(kit) : null;
  const world = kit.use((k) => k.world);
  const tension = () => {
    const night = ctx.state.time === 'night';
    const afterScare = ctx.time - world.lastScareAt < AFTER_SCARE ? 1 : 0;
    return (night ? 0.6 : 0.15) + afterScare + (options.hushed?.() ? 0.8 : 0);
  };

  let gustWait = GUST_EVERY * (0.3 + Math.random());
  let stirWait = STIR_EVERY * (0.3 + Math.random());
  let gusting: { age: number; strength: number } | null = null;
  let dart: { from: Point3; to: Point3; age: number; seconds: number } | null = null;
  everyFrame(kit, (dt) => {
    if (gusting) {
      gusting.age += dt;
      // Up over a second and a half, then dying away over three.
      const k = gusting.age < 1.5 ? gusting.age / 1.5 : Math.max(0, 1 - (gusting.age - 1.5) / 3);
      gust(gusting.strength * k);
      if (gusting.age > 4.5) gusting = null;
    }
    if (dart && shape) {
      dart.age += dt;
      const k = Math.min(1, dart.age / dart.seconds);
      shape.position.set(dart.from.x + (dart.to.x - dart.from.x) * k, ctx.player.position.y, dart.from.z + (dart.to.z - dart.from.z) * k);
      shape.visible = k < 1;
      if (k >= 1) dart = null;
    }
    if (ctx.paused) return;
    const level = tension();
    gustWait -= dt * level;
    stirWait -= dt * level;
    if (gustWait <= 0) {
      gustWait = GUST_EVERY * (0.5 + Math.random());
      gusting = { age: 0, strength: 1.5 + level };
      windRush(ctx);
    }
    if (stirWait > 0) return;
    stirWait = STIR_EVERY * (0.5 + Math.random());
    const at = edgeOfSight(ctx, 12 + Math.random() * 12);
    stir(ctx, at, level);
    if (shape && !dart && level >= 1.2 && Math.random() < 0.4) {
      dart = darting(ctx, 20 + Math.random() * 8);
      shape.rotation.y = Math.atan2(dart.to.x - dart.from.x, dart.to.z - dart.from.z);
    }
  });
}

/** A point `distance` meters away, off to one side of where the player looks, where they might just catch it. */
function edgeOfSight(ctx: SceneContext, distance: number, y = 0.5): Point3 {
  const forward = ctx.player.forward();
  const side = (Math.random() < 0.5 ? -1 : 1) * (0.5 + Math.random() * 0.8);
  const angle = Math.atan2(forward.x, forward.z) + side;
  const p = ctx.player.position;
  return { x: p.x + Math.sin(angle) * distance, y: p.y + y, z: p.z + Math.cos(angle) * distance };
}

/** Something pushing through the undergrowth: one rustle, and when it's tense, a second a few meters on. */
function stir(ctx: SceneContext, at: Point3, level: number): void {
  rustle(ctx.audio, Math.random() < 0.6 ? 'bush' : 'leaves', { at, volume: 0.55 });
  if (level < 1 || Math.random() < 0.3) return;
  const on = { x: at.x + (Math.random() - 0.5) * 6, y: at.y, z: at.z + (Math.random() - 0.5) * 6 };
  setTimeout(() => rustle(ctx.audio, 'bush', { at: on, volume: 0.6 }), 900 + Math.random() * 1500);
}

/** A gust coming through: the wind swelling and falling, and the leaves rushing from one side to the other. */
function windRush(ctx: SceneContext): void {
  const { audio } = ctx;
  oneShot(audio, { volume: 0.5, bus: 'ambience' }, 5, (out, t) => {
    noiseBurst(audio, out, { start: t, duration: 4.2, type: 'bandpass', frequency: 500, q: 0.5, gain: 0.35, attack: 1.6 });
  });
  const from = edgeOfSight(ctx, 18, 4);
  const to = edgeOfSight(ctx, 18, 4);
  [0, 0.5, 1].forEach((k, i) =>
    setTimeout(() => rustle(audio, 'leaves', { at: { x: from.x + (to.x - from.x) * k, y: from.y, z: from.z + (to.z - from.z) * k }, volume: 0.35 }), 400 + i * 900),
  );
}

/** A dark shape crossing between the trees at the edge of the fog, fast, low, and gone. */
function darting(ctx: SceneContext, distance: number): { from: Point3; to: Point3; age: number; seconds: number } {
  const middle = edgeOfSight(ctx, distance, 0);
  const forward = ctx.player.forward();
  const across = { x: forward.z, z: -forward.x };
  const half = 3 + Math.random() * 2;
  const way = Math.random() < 0.5 ? 1 : -1;
  rustle(ctx.audio, 'bush', { at: middle, volume: 0.7 });
  return {
    from: { x: middle.x - across.x * half * way, y: 0, z: middle.z - across.z * half * way },
    to: { x: middle.x + across.x * half * way, y: 0, z: middle.z + across.z * half * way },
    age: 0,
    seconds: 0.9 + Math.random() * 0.5,
  };
}

/** Something on four legs, too dark to make out: a body, a neck, and legs. Hidden until it darts. */
function darkShape(kit: LevelKit) {
  const shape = kit.group((g) => {
    g.box({ w: 0.35, h: 0.45, d: 1.1 }).color(0x060606).at(0, 0.7, 0);
    g.box({ w: 0.2, h: 0.45, d: 0.2 }).color(0x060606).at(0, 1.05, 0.55);
    [-0.12, 0.12].forEach((x) => [-0.4, 0.4].forEach((z) => g.box({ w: 0.08, h: 0.55, d: 0.08 }).color(0x060606).at(x, 0, z)));
  });
  shape.object.visible = false;
  return shape.object;
}
