import { MathUtils, Vector3 } from 'three';
import { angleDelta, headingOf } from '../../engine/characters/motion';
import type { Vec2 } from '../../engine/physics/collision';
import type { PointLight } from '../../engine/render/lighting';
import { everyFrame, nowAndThen } from '../../game/ambient';
import type { LevelKit } from '../../game/kit/levelKit';
import type { SceneContext } from '../../game/scene';
import type { Trail } from '../forest_path/trail';
import { smallCar } from './props';
import { diesel, scoped, type MovingSound } from './sounds';

export interface TrafficOptions {
  /** The road, from one end to the other. Cars drive it either way, from well beyond its ends. */
  road: Trail;
  /** Mean seconds between cars. */
  every: number;
  /** Meters per second: about 30 km/h through a village. */
  speed?: number;
  /** Others on the road the car slows for, as it does for the player. */
  yieldTo?: () => readonly Vec2[];
}

/** How far ahead a driver brakes for someone standing in the road. */
const BRAKE_AT = 7;
const HEADLIGHT = { color: 0xd8d0b0, intensity: 2.2, range: 9 };
/** How far past each end of the road a car starts and stops, out of sight in the fog. */
const RUN_OUT = 30;
const KEEP_RIGHT = 1.3;

/** The trail carried on straight past both ends by `length` meters. */
function extended(trail: Trail, length: number): Trail {
  const out = (from: readonly [number, number], to: readonly [number, number]): [number, number] => {
    const d = Math.hypot(to[0] - from[0], to[1] - from[1]);
    return [to[0] + ((to[0] - from[0]) / d) * length, to[1] + ((to[1] - from[1]) / d) * length];
  };
  return [out(trail[1]!, trail[0]!), ...trail, out(trail[trail.length - 2]!, trail[trail.length - 1]!)];
}

/**
 * Now and then a car comes through on the road: headlights first, two smudges in the fog, then
 * the engine, then the car itself, and away round the bend. It slows and waits behind the
 * player, or anyone in `yieldTo`, standing in the road, and goes on when the way is clear. One
 * car at a time.
 */
export function passingCars(kit: LevelKit, ctx: SceneContext, options: TrafficOptions): void {
  const car = kit
    .group((holder) => {
      // The car's front faces +Z; turned round, the holder faces -Z like everything that moves.
      const body = holder.group((g) => {
        smallCar(g, 0x6a6e72, { parked: false });
        [-0.48, 0.48].forEach((x) => {
          g.box({ w: 0.28, h: 0.16, d: 0.02 }).color(0xf0e6c0).unlit().at(x, 0.51, 1.725);
          g.glow(1.6, 0xd8cc9a).at(x, 0.59, 2);
        });
        [-0.55, 0.55].forEach((x) => g.glow(0.5, 0x8a1810).at(x, 0.61, -1.8));
      });
      body.rotY(180);
    })
    .dynamic();
  car.object.visible = false;
  const road = extended(options.road, RUN_OUT);
  const lengths = road.slice(1).map(([x, z], i) => Math.hypot(x - road[i]![0], z - road[i]![1]));
  const total = lengths.reduce((sum, l) => sum + l, 0);
  const cruise = options.speed ?? 8;
  const lights = kit.use((k) => k.world.lights);
  let trip: { along: number; speed: number; backwards: boolean; engine: MovingSound; light: PointLight } | null = null;

  const pointAt = (along: number, backwards: boolean) => {
    let s = backwards ? total - along : along;
    for (let i = 0; i < lengths.length; i++) {
      if (s <= lengths[i]! || i === lengths.length - 1) {
        const [ax, az] = road[i]!;
        const [bx, bz] = road[i + 1]!;
        const k = Math.min(1, s / lengths[i]!);
        const heading = backwards ? headingOf(ax - bx, az - bz) : headingOf(bx - ax, bz - az);
        // On the right of the crown, so people walking the middle of the road pass beside it.
        return { x: ax + (bx - ax) * k + Math.cos(heading) * KEEP_RIGHT, z: az + (bz - az) * k - Math.sin(heading) * KEEP_RIGHT, heading };
      }
      s -= lengths[i]!;
    }
    return { x: 0, z: 0, heading: 0 };
  };

  nowAndThen(kit, ctx, options.every, () => {
    if (trip) return;
    const backwards = Math.random() < 0.5;
    const start = pointAt(0, backwards);
    const engine = scoped(kit, diesel(ctx.audio, { x: start.x, y: 0.6, z: start.z }, { volume: 0.4, rate: 36, bus: 'ambience' }));
    engine.throttle(0.4);
    const light = lights.addPoint(new Vector3(start.x, 0.8, start.z), HEADLIGHT);
    car.object.rotation.y = start.heading;
    trip = { along: 0, speed: cruise, backwards, engine, light };
    car.object.visible = true;
  });

  everyFrame(kit, (dt) => {
    if (!trip) return;
    const here = pointAt(trip.along, trip.backwards);
    const inTheRoad = [ctx.player.position, ...(options.yieldTo?.() ?? [])].some((p) => {
      const ahead = -Math.sin(here.heading) * (p.x - here.x) - Math.cos(here.heading) * (p.z - here.z);
      const across = Math.abs(Math.cos(here.heading) * (p.x - here.x) - Math.sin(here.heading) * (p.z - here.z));
      return ahead > 0 && ahead < BRAKE_AT && across < 1.6;
    });
    trip.speed = MathUtils.damp(trip.speed, inTheRoad ? 0 : cruise, inTheRoad ? 3 : 0.8, dt);
    trip.engine.throttle(inTheRoad ? 0 : trip.speed / cruise);
    trip.along += trip.speed * dt;
    const next = pointAt(trip.along, trip.backwards);
    car.object.position.set(next.x, 0, next.z);
    car.object.rotation.y += angleDelta(car.object.rotation.y, next.heading) * Math.min(1, dt * 3);
    trip.engine.moveTo({ x: next.x, y: 0.6, z: next.z });
    // The light falls on the road a few meters ahead of the car.
    trip.light.position.set(next.x - Math.sin(car.object.rotation.y) * 4, 0.8, next.z - Math.cos(car.object.rotation.y) * 4);
    if (trip.along < total) return;
    trip.engine.stop(2);
    lights.removePoint(trip.light);
    car.object.visible = false;
    trip = null;
  });
}
