import type { Point3, SoundHandle } from '../../engine/audio/audioManager';
import { crackle, wind } from '../../engine/audio/generators';
import { bark, cowbell } from '../../engine/characters/voices';
import type { Atmosphere } from '../../engine/render/atmosphere';
import type { LevelKit } from '../../game/kit/levelKit';
import type { SceneContext } from '../../game/scene';
import type { TimeOfDay } from '../../game/state';
import { drip } from '../bunker_interior/drips';
import { chimesBetween } from '../church/clock';
import { everyFrame } from '../church/everyFrame';
import { towerBell } from '../church/sounds';
import { diesel, scoped, type MovingSound } from './sounds';

/**
 * Leurs on a grey November afternoon inside the stratus, and the same village at night with
 * every shutter closed. Shared by the square, the farms, and the Gremaud house.
 */
export const villageAtmosphere: Record<TimeOfDay, Atmosphere> = {
  day: {
    fog: { color: 0x8c8f8c, near: 1, far: 20, density: 0.058, wisps: 0.5 },
    ambient: 0x666862,
    sun: { color: 0x4a4b46, direction: [0.3, 1, 0.45] },
    saturation: 0.55,
  },
  night: {
    fog: { color: 0x050607, near: 0.5, far: 13, density: 0.12, wisps: 0.3 },
    ambient: 0x0a0b0e,
    sun: { color: 0x07080b, direction: [-0.4, 1, 0.3] },
    saturation: 0.5,
  },
};

/**
 * Calls `work` at random, on average every `mean` seconds, never while a dialogue or menu is
 * open. The gaps are exponential, so events come in uneven clumps and long silences.
 */
export function nowAndThen(kit: LevelKit, ctx: SceneContext, mean: number, work: () => void, first = mean): void {
  let wait = first * (0.5 + Math.random());
  everyFrame(kit, (dt) => {
    if (ctx.paused) return;
    wait -= dt;
    if (wait > 0) return;
    wait = -Math.log(1 - Math.random()) * mean + mean * 0.2;
    work();
  });
}

/** A point `distance` meters from the listener in a random direction, at height `y`. */
function around(ctx: SceneContext, distance: number, y = 0): Point3 {
  const angle = Math.random() * Math.PI * 2;
  const p = ctx.player.position;
  return { x: p.x + Math.cos(angle) * distance, y, z: p.z + Math.sin(angle) * distance };
}

export interface VillageAmbience {
  /** Brings the layers in one by one, a few seconds apart. Only needed with `held`. */
  begin(): void;
}

export interface AmbienceOptions {
  /** The church tower, for the hour bell. Far off in the farm scenes. */
  bell: Point3;
  /** Loops that belong to this place, such as the fountain. They come in first. */
  layers?: (() => SoundHandle)[];
  /** Start silent and wait for `begin()`: the arrival's eight seconds of nothing. */
  held?: boolean;
}

/**
 * Drip from the gutters, wind, the church bell on the hour, and the far sounds of a farming
 * village: a cowbell, a dog, a tractor on some other road. At night only the drip, the dog,
 * and the bell are left, with long stretches of nothing between them.
 */
export function villageAmbience(kit: LevelKit, ctx: SceneContext, options: AmbienceOptions): VillageAmbience {
  const night = ctx.state.time === 'night';
  const track = (handle: SoundHandle) => kit.use((k) => k.world.sounds.track(handle));
  const { audio } = ctx;
  const layers: (() => SoundHandle)[] = [
    ...(options.layers ?? []),
    () => wind(audio, { volume: night ? 0.1 : 0.14 }),
    () => crackle(audio, { interval: night ? 16 : 22, volume: 0.15, distance: [6, 18] }),
  ];
  // Layers start on the scene clock, so a layer still waiting dies with the scene.
  const STAGGER = 2.6;
  let startedAt = options.held ? Number.POSITIVE_INFINITY : ctx.time;
  let started = 0;
  const on = () => started === layers.length;
  everyFrame(kit, () => {
    const due = options.held ? Math.floor((ctx.time - startedAt) / STAGGER) + 1 : layers.length;
    while (started < Math.min(due, layers.length)) track(layers[started++]!());
  });

  const when = (mean: number, work: () => void, first?: number) => nowAndThen(kit, ctx, mean, () => on() && work(), first);
  when(1.4, () => drip(audio, around(ctx, 3 + Math.random() * 6, 2.4), 0.25));
  when(night ? 110 : 70, () => {
    const at = around(ctx, 45, 0.5);
    [0, 0.5, 1.1].slice(0, 1 + Math.floor(Math.random() * 3)).forEach((d) => setTimeout(() => bark(audio, { at, volume: 0.35 }), d * 1000));
  }, night ? 50 : 25);
  if (!night) {
    when(28, () => cowbell(audio, { at: around(ctx, 40, 0.8), volume: 0.25 }), 12);
    tractorsOnOtherRoads(kit, ctx, on);
  }

  let heard = ctx.time;
  everyFrame(kit, () => {
    if (chimesBetween(heard, ctx.time).includes('hour')) towerBell(audio, options.bell, night ? 11 : 5);
    heard = ctx.time;
  });
  return { begin: () => (startedAt = Math.min(startedAt, ctx.time)) };
}

/** Now and then a tractor goes by on some other road past the houses, 45 m off, and fades out. */
function tractorsOnOtherRoads(kit: LevelKit, ctx: SceneContext, on: () => boolean): void {
  const SECONDS = 34;
  let tractor: { engine: MovingSound; from: Point3; to: Point3; t: number } | null = null;
  nowAndThen(kit, ctx, 160, () => {
    if (tractor || !on()) return;
    const angle = Math.random() * Math.PI * 2;
    const p = ctx.player.position;
    const [cx, cz, dx, dz] = [p.x + Math.cos(angle) * 45, p.z + Math.sin(angle) * 45, -Math.sin(angle) * 40, Math.cos(angle) * 40];
    const from = { x: cx - dx, y: 0.8, z: cz - dz };
    const engine = scoped(kit, diesel(ctx.audio, from, { volume: 0.5, rate: 22, bus: 'ambience' }));
    tractor = { engine, from, to: { x: cx + dx, y: 0.8, z: cz + dz }, t: 0 };
  }, 60);
  everyFrame(kit, (dt) => {
    if (!tractor) return;
    tractor.t += dt / SECONDS;
    const { from, to, t } = tractor;
    tractor.engine.moveTo({ x: from.x + (to.x - from.x) * t, y: 0.8, z: from.z + (to.z - from.z) * t });
    if (t < 1) return;
    tractor.engine.stop(3);
    tractor = null;
  });
}
