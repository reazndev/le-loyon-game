import { ExtrudeGeometry, Shape } from 'three';
import { dialogues } from '../../content';
import type { Placed } from '../../game/kit/builders';
import type { LevelKit } from '../../game/kit/levelKit';
import type { SceneContext } from '../../game/scene';
import { everyFrame } from '../church/everyFrame';
import { showTitleCard } from '../home/titleCard';
import { pointAlong, type Trail } from '../forest_path/trail';
import type { VillageAmbience } from './atmosphere';
import { BUS_STOP } from './layout';
import { wheel } from './props';
import { diesel, postHorn, scoped, type MovingSound } from './sounds';

/**
 * The PostBus: the yellow Saurer that brings the reporter on day 1 and can take them home.
 * On arrival it stands at the stop with the driver outside, then turns round the fountain and
 * goes back down the valley, and after its engine fades the village is silent for eight seconds.
 */

const LENGTH = 9.4;
const SPEED = 5.5;
/** Where the bus stands at the stop, facing east, door to the south. */
export const STAND = { x: BUS_STOP.x - 2.4, z: 10 };
const DRIVER = { x: BUS_STOP.x + 2, z: 11.5 };
/** Round the fountain and back west along the north lane, then down the valley. */
const LOOP: Trail = [
  [STAND.x, STAND.z],
  [-3, 10],
  [2.6, 7.4],
  [5.2, 2],
  [4.2, -4],
  [0, -7],
  [-4.6, -4.6],
  [-5.6, 1],
  [-6.4, 6.6],
  [-14, 7],
  [-90, 7],
];
const ARRIVE: Trail = [
  [-90, 10],
  [-26, 10],
  [STAND.x, STAND.z],
];
/** Behind the shelter, where the headlights pass as the bus comes down from the fountain. Yannick, looking at the newcomer. */
const WATCHER = { x: BUS_STOP.x - 2.6, z: BUS_STOP.z + 2.2 };
/** Seconds of nothing after the engine is gone, before the village sounds come back. */
const SILENCE = 8;

const WIDTH = 2.4;
const WHEEL = { r: 0.5, front: LENGTH / 2 - 1.9, rear: -LENGTH / 2 + 2.1 };
/** The windscreen leans back from the dashboard to the roof. */
const RAKE = { from: 1.2, to: 2.75, back: 0.35 };

/** The body seen from the side, front to the right: wheel arches, a raked front, a rounded rear. */
function sideProfile(): Shape {
  const half = LENGTH / 2;
  const sill = 0.35;
  const arch = (z: number) => shape.lineTo(z - WHEEL.r - 0.08, sill).absarc(z, WHEEL.r, WHEEL.r + 0.08, Math.PI, 0, true);
  const shape = new Shape().moveTo(-half, sill + 0.1);
  arch(WHEEL.rear);
  arch(WHEEL.front);
  return shape
    .lineTo(half - 0.1, sill)
    .lineTo(half, sill + 0.1)
    .lineTo(half, RAKE.from)
    .lineTo(half - RAKE.back, RAKE.to)
    .lineTo(-half + 0.2, RAKE.to)
    .lineTo(-half, RAKE.to - 0.2)
    .closePath();
}

function busModel(kit: LevelKit): Placed {
  const yellow = 0xc9a12e;
  const glass = 0x24292b;
  const rake = Math.atan2(RAKE.back, RAKE.to - RAKE.from);
  return kit.group((g) => {
    const body = new ExtrudeGeometry(sideProfile(), { depth: WIDTH, bevelEnabled: false, curveSegments: 4 }).rotateY(-Math.PI / 2).translate(WIDTH / 2, 0, 0);
    g.mesh(body).color(yellow);
    // A flat roof a little narrower than the body, so the top edge reads as bevelled.
    g.box({ w: WIDTH - 0.3, h: 0.1, d: LENGTH - 1.2 }).color(0xb8b4a8).at(0, RAKE.to, -0.4);
    // The window band down both sides, the stripe under it, and the back window.
    [-1, 1].forEach((side) => g.box({ w: 0.02, h: 0.85, d: LENGTH - 1.6 }).color(glass).at(side * (WIDTH / 2 + 0.01), 1.45, -0.4));
    g.box({ w: WIDTH + 0.02, h: 0.12, d: LENGTH - 0.3 }).color(0x8a2a24).at(0, 1.08, -0.1);
    g.box({ w: 2.0, h: 0.7, d: 0.02 }).color(glass).at(0, 1.6, -LENGTH / 2 - 0.01);
    // The windscreen and the destination board above it, on the raked front.
    const front = g.group((f) => {
      f.box({ w: WIDTH - 0.2, h: 1.1, d: 0.02 }).color(0x2a3033).at(0, 0.08, 0.01);
      f.box({ w: 1.5, h: 0.24, d: 0.03 }).color(0x1a1a14).at(0, 1.25, 0.02);
      f.box({ w: 0.9, h: 0.08, d: 0.035 }).color(0xd8a840).unlit().at(0, 1.33, 0.02);
    });
    front.at(0, RAKE.from, LENGTH / 2);
    front.object.rotation.x = -rake;
    // The front door on the right, folded shut.
    g.box({ w: 0.03, h: 2.1, d: 1.0 }).color(0x3a3e40).at(WIDTH / 2 + 0.02, 0.45, LENGTH / 2 - 0.75);
    g.box({ w: WIDTH + 0.04, h: 0.32, d: 0.1 }).color(0x1c1c1c).at(0, 0.3, LENGTH / 2 + 0.03);
    [-0.85, 0.85].forEach((x) => g.box({ w: 0.26, h: 0.18, d: 0.03 }).color(0xe8e2c8).unlit().at(x, 0.72, LENGTH / 2 + 0.03));
    [-0.85, 0.85].forEach((x) => g.box({ w: 0.2, h: 0.14, d: 0.03 }).color(0x7a1a14).unlit().at(x, 0.72, -LENGTH / 2 - 0.03));
    g.glow(1.6, 0xfff0c8).at(0, 0.8, LENGTH / 2 + 0.6);
    [-1, 1].forEach((side) =>
      [WHEEL.front, WHEEL.rear].forEach((z) => {
        wheel(g, WHEEL.r, 0.3).at(side * (WIDTH / 2 - 0.12), WHEEL.r, z);
        wheel(g, 0.22, 0.04, 0x6a6a64).at(side * (WIDTH / 2 + 0.02), WHEEL.r, z);
      }),
    );
  });
}

const trailLength = (trail: Trail): number =>
  trail.slice(1).reduce((sum, [x, z], i) => sum + Math.hypot(x - trail[i]![0], z - trail[i]![1]), 0);

/** Moves the bus along a trail, its nose toward a point ahead, so it turns in an arc at corners. */
class Drive {
  private along = 0;
  private readonly total: number;

  constructor(
    private readonly trail: Trail,
    private readonly speed: number,
  ) {
    this.total = trailLength(trail);
  }

  get done(): boolean {
    return this.along >= this.total;
  }

  step(dt: number, bus: Placed): { x: number; z: number } {
    // Pull away and stop gently over the first and last six meters.
    const ease = Math.min(1, 0.25 + this.along / 6, 0.15 + (this.total - this.along) / 6);
    this.along = Math.min(this.total, this.along + this.speed * ease * dt);
    const p = pointAlong(this.trail, this.along);
    const front = pointAlong(this.trail, this.along + 3);
    const back = pointAlong(this.trail, Math.max(0, this.along - 3));
    bus.object.position.set(p.x, 0, p.z);
    if (Math.hypot(front.x - back.x, front.z - back.z) > 0.5) bus.object.rotation.y = Math.atan2(front.x - back.x, front.z - back.z);
    return p;
  }
}

/**
 * Day 1, 16:20: the bus at the stop, the driver's two lines, then the bus leaves and the
 * silence. Calls `ambience.begin()` when the silence ends.
 */
export function arrival(kit: LevelKit, ctx: SceneContext, ambience: VillageAmbience): void {
  const bus = busModel(kit).at(STAND.x, 0, STAND.z).rotY(90);
  const driver = kit.npc('driver').at(DRIVER.x, 0, DRIVER.z).faceYaw(180);
  const engine = scoped(kit, diesel(ctx.audio, { x: STAND.x, y: 0.8, z: STAND.z }, { volume: 0.55 }));
  let drive: Drive | null = null;
  let quietSince: number | null = null;
  let spoken = false;
  const caught = inTheHeadlights(kit);

  const leave = async () => {
    await driver.character.walkTo(DRIVER.x - 0.6, STAND.z + 1.4);
    driver.object.visible = false;
    postHorn(ctx.audio, { x: STAND.x + 4, y: 1.5, z: STAND.z });
    engine.throttle(0.8);
    drive = new Drive(LOOP, SPEED);
  };

  everyFrame(kit, (dt) => {
    if (!spoken && ctx.time > 1.2) {
      spoken = true;
      void ctx.dialogue(dialogues.driver_arrival).then(leave);
    }
    if (!drive) return;
    if (!drive.done) {
      const p = drive.step(dt, bus);
      engine.moveTo({ x: p.x, y: 0.8, z: p.z });
      caught(bus, dt);
      // Past the last houses the fog has it; the engine carries on down the valley for a long time.
      if (p.x < -40 && quietSince === null) {
        bus.object.visible = false;
        engine.stop(14);
        quietSince = ctx.time + 14;
      }
    }
    if (quietSince !== null && ctx.time > quietSince + SILENCE) {
      quietSince = Number.POSITIVE_INFINITY;
      ambience.begin();
    }
  });
}

/**
 * Someone standing behind the bus shelter, there only while the bus's lights sweep over them and
 * gone a second later. Returns the per-frame check, given the moving bus.
 */
function inTheHeadlights(kit: LevelKit): (bus: Placed, dt: number) => void {
  const figure = kit
    .group((g) => {
      g.box({ w: 0.5, h: 1.3, d: 0.3 }).color(0x34322e).at(0, 0.2, 0);
      g.cylinder({ r: 0.11, h: 0.26, sides: 6 }).color(0x2a2826).at(0, 1.5, 0);
    })
    .at(WATCHER.x, 0, WATCHER.z)
    .dynamic();
  figure.object.visible = false;
  const glare = kit.light({ color: 0xfff0c8, intensity: 0, range: 3.5 }).at(WATCHER.x + 0.8, 1.2, WATCHER.z - 1.2);
  let lit = -1;
  return (bus, dt) => {
    if (lit < 0) {
      const { x, z } = bus.object.position;
      const heading = bus.object.rotation.y;
      const toward = Math.atan2(WATCHER.x - x, WATCHER.z - z);
      const off = Math.abs(Math.atan2(Math.sin(toward - heading), Math.cos(toward - heading)));
      if (off > 0.2 || Math.hypot(WATCHER.x - x, WATCHER.z - z) > 22) return;
      lit = 0;
      figure.object.visible = true;
    }
    if (lit > 1.1) return;
    lit += dt;
    const on = lit <= 1.1;
    figure.object.visible = on;
    if (glare.light) glare.light.intensity = on ? 1.6 : 0;
  };
}

/**
 * The leave ending: the bus comes up out of the fog to the stop, the driver asks once, and the
 * screen stays black while it pulls away.
 * Returns the call that starts it; the frame work is registered now, while the scene builds.
 */
export function departure(kit: LevelKit, ctx: SceneContext): () => Promise<void> {
  const bus = busModel(kit).at(ARRIVE[0]![0], 0, ARRIVE[0]![1]).rotY(90);
  bus.object.visible = false;
  let run: { drive: Drive; engine: MovingSound; arrived: () => void } | null = null;
  everyFrame(kit, (dt) => {
    if (!run) return;
    const p = run.drive.step(dt, bus);
    run.engine.moveTo({ x: p.x, y: 0.8, z: p.z });
    if (!run.drive.done) return;
    run.engine.throttle(0);
    run.arrived();
    run = null;
  });
  return async () => {
    bus.object.visible = true;
    const engine = scoped(kit, diesel(ctx.audio, { x: ARRIVE[0]![0], y: 0.8, z: ARRIVE[0]![1] }, { volume: 0.55 }));
    engine.throttle(0.6);
    await new Promise<void>((arrived) => (run = { drive: new Drive(ARRIVE, SPEED * 2), engine, arrived }));
    await ctx.dialogue(dialogues.driver_departure);
    // The reporter gets on. The doors fold shut and the engine pulls away down the valley.
    showTitleCard(ctx, []);
    engine.throttle(0.8);
    engine.stop(9);
  };
}
