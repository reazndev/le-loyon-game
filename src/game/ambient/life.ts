import { Vector3 } from 'three';
import type { Point3 } from '../../engine/audio/audioManager';
import { oneShot, tone } from '../../engine/characters/voices';
import { noiseBurst } from '../../engine/audio/generators';
import type { Placed } from '../kit/builders';
import type { LevelKit } from '../kit/levelKit';
import type { SceneContext } from '../scene';
import { flies as fliesPreset, moths as mothsPreset } from './presets';
import { particles } from './particles';
import { everyFrame, nowAndThen } from './schedule';
import { flyBuzz } from './sounds';
import { loop } from './soundscape';

/** Small animals that make a place feel inhabited: crows, flies, moths, a cat. */

const vary = (value: number, amount = 0.08) => value * (1 + (Math.random() - 0.5) * 2 * amount);

/** A crow, two or three hoarse calls. */
export function caw(ctx: SceneContext, at: Point3, volume = 0.55): void {
  const calls = 2 + Math.floor(Math.random() * 2);
  oneShot(ctx.audio, { at, volume, bus: 'ambience' }, calls * 0.5 + 0.4, (out, t) => {
    for (let i = 0; i < calls; i++) {
      const start = t + i * vary(0.42, 0.15);
      const pitch = vary(520, 0.06);
      tone(ctx.audio, out, { type: 'sawtooth', frequency: pitch, to: pitch * 0.78, start, duration: 0.26, gain: 0.12, attack: 0.02 });
      noiseBurst(ctx.audio, out, { start, duration: 0.24, type: 'bandpass', frequency: vary(1400), q: 2.5, gain: 0.3, attack: 0.02 });
    }
  });
}

/** Wings beating as a bird takes off. */
function flap(ctx: SceneContext, at: Point3): void {
  oneShot(ctx.audio, { at, volume: 0.6, bus: 'ambience' }, 1.2, (out, t) => {
    for (let i = 0; i < 6; i++) {
      noiseBurst(ctx.audio, out, { start: t + i * vary(0.11, 0.1), duration: 0.06, type: 'bandpass', frequency: vary(500), q: 0.8, gain: 0.5 - i * 0.06 });
    }
  });
}

export interface Perch {
  x: number;
  z: number;
  /** Height above the ground: a branch, a wall top, a fence post. */
  y?: number;
  yaw?: number;
}

const SCARE_DISTANCE = 5;
const FLIGHT_SECONDS = 3.5;

/** A crow as a handful of boxes, for perches near the path. */
function crowModel(kit: LevelKit): Placed {
  return kit.group((g) => {
    g.box({ w: 0.16, h: 0.15, d: 0.3 }).color(0x111214).at(0, 0.06, 0);
    g.box({ w: 0.1, h: 0.1, d: 0.11 }).color(0x0e0f10).at(0, 0.16, -0.17);
    g.box({ w: 0.03, h: 0.03, d: 0.08 }).color(0x2a2a26).at(0, 0.17, -0.25);
    g.box({ w: 0.12, h: 0.03, d: 0.16 }).color(0x111214).at(0, 0.1, 0.2);
    g.box({ w: 0.02, h: 0.07, d: 0.02 }).color(0x2a2620).at(-0.04, 0, 0);
    g.box({ w: 0.02, h: 0.07, d: 0.02 }).color(0x2a2620).at(0.04, 0, 0);
  });
}

/**
 * Crows by day: black shapes on branches, stumps, and posts that call now and then and lift off,
 * flapping and cawing, when the reporter comes close. Gone ones call from off in the fog later.
 */
export function crows(kit: LevelKit, ctx: SceneContext, perches: readonly Perch[], callEvery = 20): void {
  const birds = perches.map((perch) => ({
    placed: crowModel(kit).at(perch.x, perch.y ?? 0, perch.z).rotY(perch.yaw ?? Math.random() * 360).onGround().dynamic(),
    flight: -1,
    heading: new Vector3(),
  }));
  const player = ctx.player.position;
  everyFrame(kit, (dt) => {
    birds.forEach((bird) => {
      const object = bird.placed.object;
      if (bird.flight < 0 && Math.hypot(object.position.x - player.x, object.position.z - player.z) < SCARE_DISTANCE) {
        bird.flight = 0;
        bird.heading.set(object.position.x - player.x, 0, object.position.z - player.z).normalize();
        object.rotation.y = Math.atan2(-bird.heading.x, -bird.heading.z);
        flap(ctx, object.position);
        if (Math.random() < 0.7) caw(ctx, object.position);
      }
      if (bird.flight < 0 || !object.visible) return;
      bird.flight += dt;
      object.position.addScaledVector(bird.heading, dt * 4.5);
      object.position.y += dt * (1.2 + bird.flight * 1.6);
      object.rotation.z = Math.sin(bird.flight * 30) * 0.4;
      if (bird.flight > FLIGHT_SECONDS) object.visible = false;
    });
  });
  nowAndThen(kit, ctx, callEvery, () => {
    const sitting = birds.filter((b) => b.flight < 0);
    const from = sitting[Math.floor(Math.random() * sitting.length)]?.placed.object.position;
    caw(ctx, from ?? { x: player.x + (Math.random() - 0.5) * 50, y: player.y + 10, z: player.z + (Math.random() - 0.5) * 50 }, from ? 0.55 : 0.35);
  }, callEvery * 0.4);
}

/** Flies circling just above `at`, with their buzz. */
export function fliesOver(kit: LevelKit, ctx: SceneContext, at: Point3): void {
  particles(kit, fliesPreset()).at(at.x, at.y + 0.2, at.z);
  loop(kit, () => flyBuzz(ctx.audio, at));
}

/** Moths circling a lamp at `at`. Silent: a moth's wings are too soft to hear over anything. */
export function mothsAround(kit: LevelKit, at: Point3): void {
  particles(kit, mothsPreset()).at(at.x, at.y, at.z);
}

/** A purr: a slow rumble in breaths. */
function purr(ctx: SceneContext, at: Point3): void {
  oneShot(ctx.audio, { at, volume: 0.25, bus: 'ambience' }, 4, (out, t) => {
    [0, 1.3, 2.6].forEach((d) => noiseBurst(ctx.audio, out, { start: t + d, duration: 0.9, type: 'lowpass', frequency: 160, gain: 0.5, attack: 0.3 }));
  });
}

/**
 * A grey cat sitting on a windowsill or a chair: it breathes, flicks its tail, and turns its head
 * to watch the reporter when they come near. It purrs if they stand close. `at` is where it sits.
 */
export function cat(kit: LevelKit, ctx: SceneContext, at: Point3 & { yaw?: number }, fur = 0x5e5a56): void {
  const parts = {} as Record<'body' | 'head' | 'tail', Placed>;
  const root = kit
    .group((g) => {
      parts.body = g.group((b) => {
        b.box({ w: 0.16, h: 0.2, d: 0.26 }).color(fur).at(0, 0, 0.02);
        b.box({ w: 0.13, h: 0.1, d: 0.12 }).color(fur).at(0, 0.18, -0.06);
      });
      parts.head = g.group((h) => {
        h.box({ w: 0.11, h: 0.09, d: 0.1 }).color(fur);
        h.box({ w: 0.03, h: 0.04, d: 0.02 }).color(fur).at(-0.035, 0.09, 0);
        h.box({ w: 0.03, h: 0.04, d: 0.02 }).color(fur).at(0.035, 0.09, 0);
        // Eyes catch the torch.
        h.box({ w: 0.018, h: 0.012, d: 0.01 }).color(0x8a8a40).emissive(0x1a1a08).at(-0.025, 0.045, -0.051);
        h.box({ w: 0.018, h: 0.012, d: 0.01 }).color(0x8a8a40).emissive(0x1a1a08).at(0.025, 0.045, -0.051);
      }).at(0, 0.27, -0.08);
      parts.tail = g.group((t) => t.box({ w: 0.03, h: 0.03, d: 0.24 }).color(fur).at(0, 0, 0.12)).at(0.05, 0.02, 0.14);
    })
    .at(at.x, at.y, at.z)
    .rotY(at.yaw ?? 0)
    .dynamic();
  const { body, head, tail } = parts;
  let time = Math.random() * 10;
  let purred = false;
  const look = new Vector3();
  everyFrame(kit, (dt) => {
    time += dt;
    body.object.scale.y = 1 + Math.sin(time * 2.4) * 0.015;
    tail.object.rotation.y = Math.sin(time * 0.9) * 0.5 + (Math.sin(time * 5.3) > 0.97 ? 0.4 : 0);
    const p = ctx.player.position;
    const near = Math.hypot(p.x - at.x, p.z - at.z);
    // Turns its head toward the reporter within 4 m, slowly, then holds.
    look.set(p.x, 0, p.z);
    root.object.worldToLocal(look);
    const toward = near < 4 ? Math.max(-1.2, Math.min(1.2, Math.atan2(-look.x, -look.z))) : Math.sin(time * 0.13) * 0.4;
    head.object.rotation.y += (toward - head.object.rotation.y) * Math.min(1, dt * 2);
    if (near < 1.2 && !purred) purr(ctx, at);
    purred = near < 1.2 ? true : near > 2.5 ? false : purred;
  });
}
