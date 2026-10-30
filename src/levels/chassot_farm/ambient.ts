import { crows, everyFrame, fliesOver, nowAndThen, sway, type Perch } from '../../game/ambient';
import type { LevelKit } from '../../game/kit/levelKit';
import type { SceneContext } from '../../game/scene';
import { houseCreak } from '../inn/sounds';
import { woodpile } from '../village_square/houses';
import { milkCan } from '../village_square/props';
import { farmWeather } from '../yerly_farm/outdoors';
import { chain, hayWagon, kennel, looseSheet, plough, roundBale, tool, wheelbarrow } from '../yerly_farm/props';
import { chainRattle } from '../yerly_farm/sounds';
import { GARDEN } from './garden';
import { wildlife } from '../../game/ambient/wildlife';

/**
 * Two years of nobody at the Chassot farm: the empty kennel with its chain in the nettles, milk
 * cans where the lorry stopped coming, a plough and a wagon left where they stood, a bale gone
 * grey, the mother's apron still on the line. Round by the garden it changes: a barrow of fresh
 * earth and a compost heap with flies over it. Crows sit on the bare rafters by day. At night
 * the house creaks inside now and then, and once, by the kennel, the chain moves.
 */

export interface ChassotPlan {
  house: { x: number; z: number; w: number; d: number };
  /** The barn's east wall, where the loose sheet hangs. */
  barnEast: number;
}

export function chassotAmbient(kit: LevelKit, ctx: SceneContext, { house, barnEast }: ChassotPlan): void {
  wildlife(kit, ctx, 'field');
  const night = ctx.state.time === 'night';
  // Against the front wall right of the door, where the hedge doesn't hide it.
  const kennelAt = { x: house.x + 1.7, z: house.z + house.d / 2 + 0.53 };
  const perches = kit.batch((still) => clutter(still, house, kennelAt));
  const nail = { x: barnEast + 0.06, y: 2.75, z: house.z - house.d / 2 - 2.8 };
  looseSheet(kit, ctx, nail, 90);
  washingLine(kit);
  farmWeather(kit, ctx, {
    tin: { x: nail.x, y: 2, z: nail.z },
    // The road down the valley, beyond the hedge and the village road.
    road: [{ x: -120, y: -5, z: 80 }, { x: 140, y: -5, z: 60 }],
  });

  if (!night) {
    crows(kit, ctx, perches);
    fliesOver(kit, ctx, { ...COMPOST, y: 0.55 });
    return;
  }
  nowAndThen(kit, ctx, 80, () => {
    const p = ctx.player.position;
    if (Math.hypot(p.x - house.x, p.z - house.z) < 14) houseCreak(ctx.audio, { x: house.x + (Math.random() - 0.5) * house.w * 0.6, y: 3.5, z: house.z }, 0.35);
  }, 30);
  chainOnce(kit, ctx, { x: kennelAt.x - 0.2, z: kennelAt.z + 1 });
}

const COMPOST = { x: GARDEN.x + GARDEN.w / 2 + 2.1, z: GARDEN.z + 0.9 };

/** The still clutter round the house, in one batch. Returns the crows' perches. */
function clutter(still: LevelKit, house: ChassotPlan['house'], kennelAt: { x: number; z: number }): Perch[] {
  const front = house.z + house.d / 2;
  const west = house.x - house.w / 2;
  // The kennel by the door, its chain run out across the path, a bowl turned over.
  kennel(still).at(kennelAt.x, 0, kennelAt.z).rotY(-8);
  chain(still, { x: kennelAt.x + 0.1, z: kennelAt.z + 0.47 }, { x: kennelAt.x - 0.4, z: kennelAt.z + 1.5 });
  still.cylinder({ r: 0.11, h: 0.05, sides: 7 }).texture('rust_metal', { tile: 0.4 }).color(0x6a5a4a).at(kennelAt.x + 0.6, 0, kennelAt.z + 0.75);
  // Two milk cans by the door for a collection that stopped in 1996, one knocked over.
  milkCan(still, 30).at(house.x + 4.3, 0, front + 0.35);
  milkCan(still).at(house.x + 3.9, 0.17, front + 0.6).object.rotation.set(0.3, 0, Math.PI / 2);
  // The woodpile along the west wall, the last she had cut, gone grey under the ivy.
  woodpile(still, 2.4, 0.9).at(west - 0.35, 0, house.z + 1.6).rotY(-90);
  // The plough in the nettles by the road, and a wagon on three wheels behind the barn.
  plough(still).at(9.5, 0, 0.3).rotY(30);
  still.barrier({ w: 0.9, d: 2.2 }).at(9.5, 0, 0.3).rotY(30);
  hayWagon(still, true).at(west - 2.6, 0, house.z - house.d / 2 - 7).rotY(8);
  still.barrier({ w: 1.6, d: 3.2 }).at(west - 2.6, 0, house.z - house.d / 2 - 7).rotY(8);
  // A bale from the last summer, its wrap grey and split, sunk into the grass.
  roundBale(still, 0x7e8274).at(18.5, -0.18, -0.5).rotY(70);
  // Tools against the barn by its side door.
  tool(still, 'rake', 0.4, 0x6a5e4c).at(5.4, 0, -17.6).rotY(90);
  tool(still, 'fork', 0.35, 0x6a5e4c).at(5.35, 0, -18.3).rotY(84);

  // By the garden, the one place kept: earth in the barrow, a compost heap boarded on three sides.
  wheelbarrow(still, true).at(GARDEN.x + GARDEN.w / 2 + 1.3, 0, GARDEN.z + 3).rotY(200);
  still.barrier({ w: 0.8, d: 1.4 }).at(GARDEN.x + GARDEN.w / 2 + 1.3, 0, GARDEN.z + 3).rotY(200);
  [
    [0, -0.6, 1.3, 0],
    [-0.65, 0, 1.2, 90],
    [0.65, 0, 1.2, 90],
  ].forEach(([dx, dz, w, yaw]) => still.box({ w: w!, h: 0.5, d: 0.04 }).texture('wood_planks', { tile: 1 }).color(0x5e5446).at(COMPOST.x + dx!, 0, COMPOST.z + dz!).rotY(yaw!));
  still.gable({ w: 1.2, d: 1.1, h: 0.3 }).texture('grave_dirt', { tile: 1 }).color(0x4a3c2c).at(COMPOST.x, 0.2, COMPOST.z);
  still.box({ w: 1.2, h: 0.2, d: 1.1 }).texture('grave_dirt', { tile: 1 }).color(0x4a3c2c).at(COMPOST.x, 0, COMPOST.z);
  still.barrier({ w: 1.4, d: 1.3 }).at(COMPOST.x, 0, COMPOST.z);

  return [
    { x: house.x + 2, z: house.z - house.d / 2 - 8.6, y: 6.25, yaw: 90 },
    { x: house.x - 2, z: house.z - house.d / 2 - 8.6, y: 6.25, yaw: 250 },
    { x: 9.4, z: 3.4, y: 1 },
    { x: 15, z: -3.5, y: 1.45, yaw: 130 },
  ];
}

/**
 * The line east of the house, between two posts. Her apron is still on it, two winters on,
 * and a rag; a peg lies in the grass under it.
 */
function washingLine(kit: LevelKit): void {
  const [x0, x1, z, top] = [7.6, 10.8, -4.5, 1.8];
  kit.batch((still) => {
    [x0, x1].forEach((x, i) => {
      const post = still.box({ w: 0.09, h: top + 0.1, d: 0.09 }).texture('bark_spruce', { tile: 0.5 }).color(0x56504a).at(x, 0, z).collider();
      post.object.rotation.z = i ? -0.06 : 0.04;
    });
    still.box({ w: x1 - x0, h: 0.02, d: 0.02 }).color(0x4a4640).at((x0 + x1) / 2, top - 0.05, z);
    still.box({ w: 0.02, h: 0.02, d: 0.07 }).color(0x8a7a5a).at(9.6, 0.02, z + 0.3).rotY(40);
  });
  const hanging = (x: number, degrees: number, build: (g: LevelKit) => void) =>
    sway(kit, kit.group((outer) => outer.batch(build)).at(x, top - 0.05, z).dynamic(), { axis: 'x', degrees, speed: 0.18 });
  hanging(8.6, 5, (g) => {
    // Pegged by its waistband: the skirt hangs, the bib folded over the line, a tie loose.
    g.box({ w: 0.56, h: 0.6, d: 0.015 }).color(0x5a6070).at(0, -0.66, 0);
    g.box({ w: 0.32, h: 0.24, d: 0.015 }).color(0x525868).at(0, -0.3, 0.012);
    g.box({ w: 0.03, h: 0.5, d: 0.01 }).color(0x525868).at(0.3, -0.56, 0).object.rotation.z = 0.12;
    [-0.2, 0.2].forEach((dx) => g.box({ w: 0.02, h: 0.07, d: 0.025 }).color(0x8a7a5a).at(dx, -0.04, 0));
  });
  hanging(10, 8, (g) => {
    g.box({ w: 0.3, h: 0.34, d: 0.015 }).color(0x7a766a).at(0, -0.36, 0);
    g.box({ w: 0.02, h: 0.07, d: 0.025 }).color(0x8a7a5a).at(0, -0.04, 0);
  });
}

/** At night the chain by the empty kennel moves once, a moment after the reporter comes close. */
function chainOnce(kit: LevelKit, ctx: SceneContext, at: { x: number; z: number }): void {
  let wait = Number.POSITIVE_INFINITY;
  everyFrame(kit, (dt) => {
    const p = ctx.player.position;
    if (wait === Number.POSITIVE_INFINITY && Math.hypot(p.x - at.x, p.z - at.z) < 4.5) wait = 1.8;
    if (wait < 0) return;
    wait -= dt;
    if (wait < 0) chainRattle(ctx.audio, { x: at.x, y: 0.1, z: at.z }, 0.3);
  });
}
