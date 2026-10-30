import { Vector3 } from 'three';
import { crows, everyFrame, fliesOver, loop, nowAndThen, sway, type Perch } from '../../game/ambient';
import type { LevelKit } from '../../game/kit/levelKit';
import type { NpcBuilder } from '../../game/kit/npc';
import type { SceneContext } from '../../game/scene';
import { radio } from '../inn/sounds';
import { tyres } from '../village_square/props';
import { cowsLooking, nearFor } from './attention';
import { chainedDog } from './dog';
import { BARN, MANURE, STALL } from './layout';
import { farmWeather } from './outdoors';
import { bucket, chain, harrow, hayWagon, ironSheet, kennel, roundBale, squareBales, tool, wheelbarrow } from './props';
import { chainRattle } from './sounds';

/**
 * What makes the Yerly yard a working farm in November: tools against the stable wall, the
 * barrow by the dung heap with the fork in it, bales under a sheet of iron, the hay wagon, the
 * harrow nobody has put away, Bernard's dog on its chain, a washing line. By day crows on the
 * bales, flies over the heap, a radio in the stable for the cows; at night a chain in the stable.
 */

/** Where the stable wall stands, the face of the cowshed toward the yard. */
const STABLE = BARN.z + BARN.d / 2;
/** Small bales under a sheet of iron beside the stall, the tin the drizzle drums on. */
const BALES = { x: 17.2, z: 1.4 };
const KENNEL = { x: -0.4, z: -1.5 };

export function yerlyAmbient(kit: LevelKit, ctx: SceneContext, cows: NpcBuilder[]): void {
  const night = ctx.state.time === 'night';
  const perches = kit.batch(clutter);
  chainedDog(kit, ctx, night ? { x: KENNEL.x, y: 0, z: KENNEL.z + 0.3, yaw: 0, night } : { x: KENNEL.x + 0.5, y: 0, z: KENNEL.z + 1.6, yaw: 20, night });
  washingLine(kit, night);
  cowsWatch(kit, ctx, cows);
  farmWeather(kit, ctx, {
    tin: { x: BALES.x, y: 1.2, z: BALES.z },
    // The cantonal road along the valley, south of the farm, beyond the orchard.
    road: [{ x: -120, y: -10, z: 120 }, { x: 140, y: -10, z: 90 }],
  });

  // Inside the stable, through the half door.
  const stable = { x: BARN.x + 0.4, y: 1.2, z: STABLE - 2 };
  if (night) {
    nowAndThen(kit, ctx, 45, () => chainRattle(ctx.audio, { ...stable, x: stable.x + (Math.random() - 0.5) * 8 }, 0.2), 20);
    return;
  }
  loop(kit, () => radio(ctx.audio, stable, 0.12));
  crows(kit, ctx, perches);
  fliesOver(kit, ctx, { x: MANURE.x + 0.6, y: 1.1, z: MANURE.z });
}

/** The still clutter of the yard, in one batch. Returns the crows' perches. */
function clutter(still: LevelKit): Perch[] {
  // Against the stable wall: a dung fork and a broom by the half door, buckets the other side.
  tool(still, 'dungFork', 0.4).at(BARN.x - 1.1, 0, STABLE + 0.42).rotY(4);
  tool(still, 'broom', 0.32).at(BARN.x - 0.75, 0, STABLE + 0.34).rotY(-8);
  tool(still, 'shovel', 0.3, 0x7a6a50).at(BARN.x - 3.6, 0, STABLE + 0.32).rotY(6);
  bucket(still).at(BARN.x + 1.55, 0, STABLE + 0.3);
  bucket(still, 0x7a7c76).at(BARN.x + 1.9, 0, STABLE + 0.42);
  bucket(still).at(BARN.x + 1.72, 0.3, STABLE + 0.35).rotY(40);

  // The dung heap: the fork left standing in it, the barrow by the wall, ready for the morning.
  tool(still, 'dungFork', 0, 0x7a6a50).at(MANURE.x - 1.1, 0.75, MANURE.z + 0.4).object.rotation.set(0.25, 0.4, -0.2);
  wheelbarrow(still).at(MANURE.x + 3.4, 0, MANURE.z + 0.2).rotY(195);
  still.barrier({ w: 0.8, d: 1.4 }).at(MANURE.x + 3.4, 0, MANURE.z + 0.1);

  // Bales beside the stall under a sheet of iron weighed down with a tyre.
  squareBales(still).at(BALES.x, 0, BALES.z).rotY(-4);
  ironSheet(still, 2.9, 1.1).at(BALES.x, 0.86, BALES.z);
  tyres(still, 1).at(BALES.x - 0.6, 0.87, BALES.z + 0.1);
  still.barrier({ w: 3, d: 0.7 }).at(BALES.x, 0, BALES.z);
  // Round bales in white plastic on the way in, wrapped this summer.
  roundBale(still).at(23.6, 0, 2.6).rotY(80);
  roundBale(still, 0xb0b2a8).at(25.1, 0, 3.4).rotY(95);

  // The hay wagon between the shed and the henhouse, and the harrow left in the grass by the gate.
  hayWagon(still).at(-12.6, 0, 2.6).rotY(-80);
  still.barrier({ w: 3.2, d: 1.5 }).at(-12.6, 0, 2.6).rotY(-80);
  harrow(still).at(-17, 0, 3.6).rotY(-20);

  // Bernard's dog's kennel by the house door, the chain to where the dog lies.
  kennel(still).at(KENNEL.x, 0, KENNEL.z);
  chain(still, { x: KENNEL.x + 0.2, z: KENNEL.z + 0.5 }, { x: KENNEL.x + 0.5, z: KENNEL.z + 1.9 });

  return [
    { x: 23.6, z: 2.6, y: 1.3 },
    { x: 25.1, z: 3.4, y: 1.3, yaw: 200 },
    { x: -12.6, z: 3.8, y: 1.52 },
    { x: BALES.x + 1, z: BALES.z, y: 0.9 },
  ];
}

/**
 * A line in the orchard between two posts, Bernard's work clothes on it by day: an overall and
 * a shirt, moving a little. At night the line is empty but for the pegs.
 */
function washingLine(kit: LevelKit, night: boolean): void {
  const [x0, x1, z, top] = [-2.6, 2.4, 11.6, 1.85];
  kit.batch((still) => {
    [x0, x1].forEach((x) => still.box({ w: 0.09, h: top + 0.1, d: 0.09 }).texture('bark_spruce', { tile: 0.5 }).color(0x6a5e50).at(x, 0, z).collider());
    still.box({ w: x1 - x0, h: 0.025, d: 0.025 }).color(0x4a4840).at((x0 + x1) / 2, top - 0.03, z);
    [-1.6, -1.2, 0.3, 0.6, 1.5].forEach((dx) => still.box({ w: 0.02, h: 0.06, d: 0.02 }).color(0x9a8a6a).at(dx, top - 0.06, z));
  });
  if (night) return;
  const hanging = (x: number, build: (g: LevelKit) => void, degrees: number) =>
    sway(kit, kit.group((outer) => outer.batch(build)).at(x, top - 0.03, z).dynamic(), { axis: 'x', degrees, speed: 0.22 });
  // The overall, blue gone grey, hung by its shoulders.
  hanging(-1.4, (g) => {
    g.box({ w: 0.5, h: 0.6, d: 0.02 }).color(0x3e4a5c).at(0, -0.6, 0);
    [-0.13, 0.13].forEach((x) => g.box({ w: 0.21, h: 0.62, d: 0.02 }).color(0x3a4658).at(x, -1.2, 0));
  }, 4);
  hanging(0.45, (g) => {
    g.box({ w: 0.46, h: 0.55, d: 0.02 }).color(0x8a8270).at(0, -0.55, 0);
    [-1, 1].forEach((side) => g.box({ w: 0.14, h: 0.4, d: 0.02 }).color(0x847c6a).at(side * 0.3, -0.42, 0));
    g.box({ w: 0.36, h: 0.3, d: 0.02 }).color(0x6a2e28).at(1.05, -0.3, 0);
  }, 6);
}

/**
 * The cows in the stall turn their heads to the reporter, one after another, the longer they
 * stand at the rail, and keep looking a moment after they go.
 */
function cowsWatch(kit: LevelKit, ctx: SceneContext, cows: NpcBuilder[]): void {
  const eye = new Vector3();
  const delays = [0.6, 2.5, 5];
  let near = 0;
  everyFrame(kit, (dt) => {
    const p = ctx.player.position;
    near = nearFor(near, Math.hypot(p.x - STALL.x, p.z - STALL.z), dt, 8);
    eye.set(p.x, p.y + 1.5, p.z);
    cowsLooking(near, delays).forEach((looking, i) => (cows[i]!.character.lookAt = looking ? eye : null));
  });
}
