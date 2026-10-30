import type { Object3D } from 'three';
import type { Point3 } from '../../engine/audio/audioManager';
import type { KitContext } from '../kit/builders';
import { LevelKit } from '../kit/levelKit';
import { crowModel } from './life';

/** Animals that bolt across the ground. */
export type Runner = 'deer' | 'fox' | 'hare';

type Motion = 'run' | 'fly' | 'swoop';

interface Move {
  object: Object3D;
  from: Point3;
  to: Point3;
  age: number;
  seconds: number;
  motion: Motion;
  /** How high a swoop dips toward the player, how fast a runner's stride bobs, or how fast a flyer's wings beat. */
  amount: number;
}

const BIRDS = 8;
/** How fast wings beat in flight, as the rate of their wobble: a crow's quick flutter, an owl's slow strokes. */
const CROW_WINGBEAT = 32;
const OWL_WINGBEAT = 11;
const RATS = 3;

const pools = new WeakMap<KitContext, Critters>();

/** The scene's animal pool, built once per scene the first time a system asks for it. */
export function critters(ctx: KitContext): Critters {
  const pool = pools.get(ctx) ?? new Critters(ctx);
  pools.set(ctx, pool);
  return pool;
}

/**
 * Hidden animal shapes for sudden movement: birds bursting out of a tree, a deer or a fox bolting
 * across, an owl swooping over, rats running along the floor. Each is shown only while it moves.
 */
export class Critters {
  private readonly birds: Object3D[];
  private readonly runners: Record<Runner, Object3D>;
  private readonly rats: Object3D[];
  private readonly owl: Object3D;
  private moves: Move[] = [];

  constructor(private readonly ctx: KitContext) {
    const kit = new LevelKit(ctx, ctx.world.scene);
    const hidden = (object: Object3D) => ((object.visible = false), object);
    const shape = (build: (g: LevelKit) => void) => hidden(kit.group((outer) => outer.batch(build)).dynamic().object);
    const legs = (g: LevelKit, color: number, w: number, h: number, x: number, z: number) =>
      [-x, x].forEach((lx) => [-z, z].forEach((lz) => g.box({ w, h, d: w }).color(color).at(lx, h / 2, lz)));

    this.birds = Array.from({ length: BIRDS }, () => hidden(crowModel(kit).dynamic().object));
    this.rats = Array.from({ length: RATS }, () =>
      shape((g) => {
        g.box({ w: 0.07, h: 0.06, d: 0.17 }).color(0x1c1a17).at(0, 0.04, 0);
        g.box({ w: 0.012, h: 0.012, d: 0.16 }).color(0x3a302a).at(0, 0.03, 0.16);
      }),
    );
    // Every model faces -Z, so turning one toward where it goes is the same for all.
    this.runners = {
      deer: shape((g) => {
        g.box({ w: 0.36, h: 0.45, d: 1.1 }).color(0x241a12).at(0, 0.95, 0);
        g.box({ w: 0.16, h: 0.5, d: 0.18 }).color(0x241a12).at(0, 1.3, -0.5);
        g.box({ w: 0.15, h: 0.15, d: 0.3 }).color(0x1e160f).at(0, 1.55, -0.62);
        g.box({ w: 0.12, h: 0.1, d: 0.06 }).color(0x8a8270).at(0, 1.0, 0.56);
        legs(g, 0x1a130d, 0.07, 0.78, 0.12, 0.42);
      }),
      fox: shape((g) => {
        g.box({ w: 0.2, h: 0.22, d: 0.6 }).color(0x4a2a12).at(0, 0.38, 0);
        g.box({ w: 0.16, h: 0.15, d: 0.22 }).color(0x4a2a12).at(0, 0.48, -0.36);
        g.box({ w: 0.12, h: 0.12, d: 0.45 }).color(0x3e2410).at(0, 0.36, 0.48);
        legs(g, 0x140c06, 0.05, 0.3, 0.07, 0.22);
      }),
      hare: shape((g) => {
        g.box({ w: 0.17, h: 0.18, d: 0.34 }).color(0x3a3126).at(0, 0.17, 0);
        g.box({ w: 0.12, h: 0.12, d: 0.14 }).color(0x3a3126).at(0, 0.27, -0.18);
        g.box({ w: 0.03, h: 0.16, d: 0.05 }).color(0x3a3126).at(-0.03, 0.4, -0.16);
        g.box({ w: 0.03, h: 0.16, d: 0.05 }).color(0x3a3126).at(0.03, 0.4, -0.16);
      }),
    };
    this.owl = shape((g) => {
      g.box({ w: 0.26, h: 0.24, d: 0.4 }).color(0x2c251c).at(0, 0, 0);
      g.box({ w: 1.2, h: 0.03, d: 0.32 }).color(0x352c21).at(0, 0.04, 0.02);
      g.box({ w: 0.2, h: 0.18, d: 0.16 }).color(0x2c251c).at(0, 0.06, -0.24);
    });
    ctx.later('register', () => ctx.world.updates.add((dt) => this.update(dt)));
  }

  /** Birds bursting out of a tree at `from`, away from the player, climbing as they go. */
  burst(from: Point3, count = 5): void {
    const player = this.ctx.scene.player.position;
    const away = Math.atan2(from.x - player.x, from.z - player.z);
    this.birds
      .filter((bird) => !bird.visible)
      .slice(0, count)
      .forEach((bird) => {
        const heading = away + (Math.random() - 0.5) * 1.6;
        const reach = 20 + Math.random() * 10;
        const start = { x: from.x + (Math.random() - 0.5), y: from.y + (Math.random() - 0.5), z: from.z + (Math.random() - 0.5) };
        const to = { x: start.x + Math.sin(heading) * reach, y: start.y + 10 + Math.random() * 6, z: start.z + Math.cos(heading) * reach };
        this.move(bird, start, to, 2.6 + Math.random() * 1.2, 'fly', CROW_WINGBEAT);
      });
  }

  /** A runner crossing from `from` to `to` along the ground in `seconds`. */
  bolt(kind: Runner, from: Point3, to: Point3, seconds: number): void {
    const runner = this.runners[kind];
    if (!runner.visible) this.move(runner, from, to, seconds, 'run', kind === 'hare' ? 16 : 11);
  }

  /** Rats running a few meters along the floor from `from`, away from the player. */
  scurry(from: Point3): void {
    const player = this.ctx.scene.player.position;
    const away = Math.atan2(from.x - player.x, from.z - player.z);
    this.rats.forEach((rat, i) => {
      const heading = away + (Math.random() - 0.5) * 1.4;
      const start = { x: from.x + (Math.random() - 0.5) * 0.6, y: from.y, z: from.z + (Math.random() - 0.5) * 0.6 };
      const to = { x: start.x + Math.sin(heading) * 3, y: from.y, z: start.z + Math.cos(heading) * 3 };
      this.move(rat, start, to, 0.7 + i * 0.15, 'run', 30);
    });
  }

  /** The owl lifting off a branch at `from` and flying off into the trees, away from the player, on slow beats. */
  flyOff(from: Point3): void {
    if (this.owl.visible) return;
    const player = this.ctx.scene.player.position;
    const heading = Math.atan2(from.x - player.x, from.z - player.z) + (Math.random() - 0.5) * 1.2;
    const reach = 22 + Math.random() * 8;
    const to = { x: from.x + Math.sin(heading) * reach, y: from.y + 3 + Math.random() * 3, z: from.z + Math.cos(heading) * reach };
    this.move(this.owl, from, to, 3.2, 'fly', OWL_WINGBEAT);
  }

  /** The owl dropping from `from`, low over the player's head, and up again toward `to`. */
  swoop(from: Point3, to: Point3): void {
    const eye = this.ctx.scene.player.position.y + 2.2;
    const middle = (from.y + to.y) / 2;
    if (!this.owl.visible) this.move(this.owl, from, to, 1.4, 'swoop', Math.max(0, middle - eye));
  }

  private move(object: Object3D, from: Point3, to: Point3, seconds: number, motion: Motion, amount: number): void {
    object.rotation.set(0, Math.atan2(-(to.x - from.x), -(to.z - from.z)), 0);
    object.visible = true;
    this.moves.push({ object, from, to, age: 0, seconds, motion, amount });
    this.place(this.moves.at(-1)!);
  }

  private update(dt: number): void {
    this.moves.forEach((move) => {
      move.age += dt;
      this.place(move);
    });
    this.moves.filter((move) => move.age >= move.seconds).forEach((move) => (move.object.visible = false));
    this.moves = this.moves.filter((move) => move.age < move.seconds);
  }

  private place(move: Move): void {
    const { object, from, to, age, seconds, motion, amount } = move;
    const k = Math.min(1, age / seconds);
    const x = from.x + (to.x - from.x) * k;
    const z = from.z + (to.z - from.z) * k;
    if (motion === 'run') {
      const ground = this.ctx.world.ground.sample(x, z).height;
      object.position.set(x, ground + Math.abs(Math.sin(age * amount)) * 0.12, z);
      object.rotation.x = Math.sin(age * amount) * 0.12;
    } else if (motion === 'fly') {
      // Slow off the branch, then climbing faster.
      object.position.set(x, from.y + (to.y - from.y) * k * k, z);
      object.rotation.z = Math.sin(age * amount) * 0.5;
    } else {
      object.position.set(x, from.y + (to.y - from.y) * k - Math.sin(Math.PI * k) * amount, z);
      object.rotation.z = Math.sin(age * 9) * 0.25;
    }
  }
}
