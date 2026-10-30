import { Vector3 } from 'three';
import type { Point3 } from '../../engine/audio/audioManager';
import { bark, growl } from '../../engine/characters/voices';
import { everyFrame } from '../../game/ambient';
import type { Placed } from '../../game/kit/builders';
import type { LevelKit } from '../../game/kit/levelKit';
import type { SceneContext } from '../../game/scene';
import { dogStep, restingDog } from './attention';
import { chainRattle } from './sounds';

/**
 * Bernard's dog, old, black and tan, chained by its kennel. By day it lies at the end of the
 * chain with its chin on its paws; when the reporter comes near it lifts its head and follows
 * them with it, growls once under its breath the first time, and lays its head down again when
 * they have gone. At night it lies in the kennel door, only its head out: it barks when the
 * reporter arrives, once, and then watches without a sound. Once in the game, at night, a
 * reporter who comes right up to the kennel gets the whole dog: it lunges to the end of its chain.
 */

const BLACK = 0x1c1a18;
/** How close the reporter comes before it lunges, how far the chain lets it, and how long it holds there barking. */
const LUNGE_FROM = 2.6;
const CHAIN = 1.4;
const LUNGE_HOLD = 1.6;
const LUNGE_FLAG = 'yerly_dog_lunge';
const TAN = 0x6a4a2e;

export interface DogOptions extends Point3 {
  yaw: number;
  night: boolean;
}

export function chainedDog(kit: LevelKit, ctx: SceneContext, at: DogOptions): void {
  const parts = {} as Record<'head', Placed>;
  const root = kit
    .group((g) => {
      g.group((outer) =>
        outer.batch((b) => {
          b.box({ w: 0.28, h: 0.22, d: 0.58 }).color(BLACK).at(0, 0, 0);
          b.box({ w: 0.32, h: 0.2, d: 0.2 }).color(BLACK).at(0, 0, -0.24);
          b.box({ w: 0.16, h: 0.12, d: 0.06 }).color(0x8a8478).at(0, 0.06, 0.29);
          [-0.08, 0.08].forEach((x) => b.box({ w: 0.07, h: 0.06, d: 0.24 }).color(TAN).at(x, 0, 0.36));
          b.box({ w: 0.05, h: 0.05, d: 0.3 }).color(BLACK).at(0.14, 0.02, -0.42).rotY(-35);
        }),
      );
      // The head pivots at the neck, so lifting it raises the muzzle off the paws.
      parts.head = g
        .group((outer) =>
          outer.batch((h) => {
            h.box({ w: 0.18, h: 0.16, d: 0.18 }).color(BLACK).at(0, -0.08, 0.06);
            h.box({ w: 0.1, h: 0.08, d: 0.13 }).color(TAN).at(0, -0.1, 0.2);
            h.box({ w: 0.04, h: 0.03, d: 0.03 }).color(0x0a0a0a).at(0, -0.04, 0.27);
            [-0.07, 0.07].forEach((x) => h.box({ w: 0.05, h: 0.08, d: 0.03 }).color(BLACK).at(x, 0.04, 0.02).object.rotation.z = x * 4);
            // Eyes that catch the torch.
            [-0.045, 0.045].forEach((x) => h.box({ w: 0.025, h: 0.015, d: 0.01 }).color(0x8a7a50).emissive(0x141008).at(x, -0.02, 0.155));
          }),
        )
        .at(0, 0.22, 0.26);
    })
    .at(at.x, at.y, at.z)
    .rotY(at.yaw)
    .dynamic();
  kit.barrier({ r: 0.4 }).at(at.x, 0, at.z);

  const head = parts.head.object;
  // Turn first, then nod, so a head turned to the side still lifts instead of rolling.
  head.rotation.order = 'YXZ';
  const voice = { x: at.x, y: at.y + 0.3, z: at.z };
  const look = new Vector3();
  let dog = restingDog;
  let lift = 0;
  const lunge = at.night && !ctx.state.hasFlag(LUNGE_FLAG) ? lunger(ctx, root, at) : null;
  everyFrame(kit, (dt) => {
    const p = ctx.player.position;
    const distance = Math.hypot(p.x - at.x, p.z - at.z);
    const step = dogStep(dog, distance, dt, at.night ? 16 : 8);
    dog = step.dog;
    if (step.first) speak(ctx, voice, at.night);
    lunge?.(dt, distance);
    lift += ((dog.up ? 1 : 0) - lift) * Math.min(1, dt * (dog.up ? 3 : 0.8));
    look.set(p.x, 0, p.z);
    root.object.worldToLocal(look);
    const toward = dog.up ? Math.max(-1.1, Math.min(1.1, Math.atan2(look.x, look.z))) : 0;
    head.rotation.y += (toward - head.rotation.y) * Math.min(1, dt * 2.5);
    head.rotation.x = 0.55 - lift * 0.7;
    head.position.y = 0.16 + lift * 0.12;
  });
}

/**
 * The lunge: out of the kennel door in a fifth of a second, stopped short by the chain half a
 * meter from the reporter, barking, then back in slowly. Runs each frame with the distance.
 */
function lunger(ctx: SceneContext, root: Placed, home: Point3): (dt: number, distance: number) => void {
  const object = root.object;
  const rest = object.rotation.y;
  let t = -1;
  let reach = 0;
  const heading = new Vector3();
  return (dt, distance) => {
    if (t < 0) {
      if (distance > LUNGE_FROM || ctx.paused) return;
      t = 0;
      reach = Math.min(CHAIN, distance - 0.6);
      heading.set(ctx.player.position.x - home.x, 0, ctx.player.position.z - home.z).normalize();
      ctx.state.setFlag(LUNGE_FLAG);
      const at = { x: home.x + heading.x * reach, y: home.y + 0.4, z: home.z + heading.z * reach };
      [0, 0.35, 0.8, 1.3].forEach((delay) => setTimeout(() => bark(ctx.audio, { at, volume: 1.4 }), delay * 1000));
      chainRattle(ctx.audio, at, 1);
      setTimeout(() => chainRattle(ctx.audio, at, 0.6), 1900);
      ctx.jolt();
    }
    if (t > LUNGE_HOLD + 2) return;
    t += dt;
    const out = t < 0.22 ? t / 0.22 : t < LUNGE_HOLD ? 1 : Math.max(0, 1 - (t - LUNGE_HOLD) / 2);
    object.position.set(home.x + heading.x * reach * out, home.y, home.z + heading.z * reach * out);
    object.rotation.y = out > 0.05 ? Math.atan2(heading.x, heading.z) : rest;
  };
}

/** The one sound it makes: a growl by day, at night three barks and the chain. */
function speak(ctx: SceneContext, at: Point3, night: boolean): void {
  if (!night) {
    growl(ctx.audio, { at, volume: 0.35, bus: 'ambience' });
    return;
  }
  [0, 0.55, 1.2].forEach((delay) => setTimeout(() => bark(ctx.audio, { at, volume: 0.75, bus: 'ambience' }), delay * 1000));
  setTimeout(() => chainRattle(ctx.audio, at, 0.35), 1600);
}
