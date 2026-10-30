import type { Object3D } from 'three';
import type { SoundHandle } from '../../engine/audio/audioManager';
import { crows, everyFrame, loop, nowAndThen, weather } from '../../game/ambient';
import type { LevelKit } from '../../game/kit/levelKit';
import type { SceneContext } from '../../game/scene';
import { chimneySmoke, windowLife } from '../../game/village/houses';
import { barrowSqueak } from '../../game/village/sounds';
import { walker, type Stop, type Walker } from '../../game/village/walker';
import type { StoryPhase } from '../forest_path/story';
import { doorShut, radio, tvMurmur } from '../inn/sounds';
import { tool, wheelbarrow } from '../yerly_farm/props';
import { HOUSE_1, INN, INN_DOOR, LAITERIE, mainRoad } from './layout';
import { bicycle } from './props';
import { passingCars } from './traffic';

/**
 * The village going about its afternoon, seen through the fog: an old woman back from the
 * laiterie, a farmer with his cow or his barrow, two children running home, a man cycling up
 * from the farms, the inn's regular smoking in the doorway with a neighbour, a woman sweeping
 * her step, a car now and then, smoke from the chimneys, kitchen lights coming on. Fewer people
 * come out each day. At night the lights go out one by one, and on the first two nights a
 * late figure may walk home down the church lane.
 */
export function villageLife(kit: LevelKit, ctx: SceneContext, phase: StoryPhase, panes: readonly Object3D[]): void {
  const night = phase.startsWith('night');
  const onTheRoad: Walker[] = [];
  passingCars(kit, ctx, { road: mainRoad, every: night ? 420 : 150, yieldTo: () => onTheRoad.flatMap((w) => w.bodies) });
  windowLife(kit, ctx, panes, night ? 'bedtime' : 'dusk');
  if (night) {
    if (phase !== 'night3') lateFigure(kit);
    return;
  }
  chimneys(kit, ctx);
  roofCrows(kit, ctx);
  doorsNowAndThen(kit, ctx);
  // A radio behind the kitchen window of the house past the inn.
  loop(kit, () => radio(ctx.audio, { x: 21.2, y: 1.4, z: -19 }, 0.1));
  if (phase === 'dawn') return;

  walker(kit, { look: 'shopper', route: SHOPPER, rest: 50, inHand: shoppingBag(kit) });
  walker(kit, { look: 'smoker', route: SMOKER, rest: 45, activity: 'smoke' });
  if (phase === 'day2') {
    onTheRoad.push(walker(kit, { look: 'farmer', route: TO_THE_RAMP, rest: 80, speed: 0.9, inFront: barrow(kit), stepSound: (at) => barrowSqueak(ctx.audio, at) }));
  } else {
    onTheRoad.push(walker(kit, { look: 'farmer', route: ROAD, rest: 120, speed: 0.75, leadsCow: true }));
  }
  if (phase === 'day3') return;

  onTheRoad.push(walker(kit, { look: 'cyclist', route: [...ROAD].reverse(), rest: 90, speed: 2.4, rides: roadster(kit) }));
  const neighbour = walker(kit, { look: 'neighbour', route: NEIGHBOUR, rest: 60 });
  chatter(kit, ctx, () => neighbour.standing);
  if (phase !== 'day1') return;

  walker(kit, { look: 'sweeper', route: SWEEPER, rest: 80, activity: 'sweep', inHand: broom(kit) });
  // The two run past together, the smaller one a step behind.
  walker(kit, { look: 'childA', route: CHILDREN, speed: 2.6, firstIn: 30, rest: 140, tread: 0.7 });
  walker(kit, { look: 'childB', route: CHILDREN.map((s) => ({ ...s, x: s.x + 0.7 })), speed: 2.5, firstIn: 31.2, rest: 140.4, tread: 0.6 });
}

/** The main road as stops, from the west end to the south end, both in the fog. */
const ROAD: Stop[] = mainRoad.map(([x, z]) => ({ x, z }));
const ROAD_SOUTH = ROAD[ROAD.length - 1]!;
const INN_STEP = { x: INN.x - INN.d / 2 - 0.6, z: INN_DOOR.z };
const LAITERIE_DOOR = { x: LAITERIE.x + LAITERIE.d / 2 + 0.4, z: LAITERIE.z };
const HOUSE_1_DOOR = { x: HOUSE_1.x + HOUSE_1.d / 2 + 0.2, z: HOUSE_1.z };

/** Out of the laiterie, across the square west of the fountain, and up the church lane into the fog. */
const SHOPPER: Stop[] = [
  { ...LAITERIE_DOOR, door: true },
  { x: -3.4, z: 19 },
  { x: -1.6, z: 11 },
  { x: -3.6, z: 2.5 },
  { x: -7.5, z: -5 },
  { x: -9.8, z: -12 },
  { x: -10, z: -38 },
];

/** Out of the inn for a cigarette on the step, and back in. */
const SMOKER: Stop[] = [
  { ...INN_STEP, door: true },
  { x: INN_STEP.x - 0.8, z: INN_STEP.z + 0.9, wait: 50 },
  { ...INN_STEP, door: true },
];

/** Up the road from the farms to the inn step, a word with whoever is there, and back down. */
const NEIGHBOUR: Stop[] = [
  ROAD_SOUTH,
  { x: 4.4, z: 16 },
  { x: 5.8, z: 4 },
  { x: 6.4, z: -0.6 },
  { x: INN_STEP.x - 1.4, z: INN_STEP.z + 1.4, wait: 40 },
  { x: 6.4, z: -0.6 },
  { x: 5.8, z: 4 },
  { x: 4.4, z: 16 },
  ROAD_SOUTH,
];

/** Up the road from the farms with a barrow of something for the laiterie's ramp, and back. */
const TO_THE_RAMP: Stop[] = [
  ROAD_SOUTH,
  { x: 4.6, z: 24 },
  { x: LAITERIE.x + LAITERIE.d / 2 + 3.1, z: LAITERIE.z + 3.2, wait: 8 },
  { x: 4.6, z: 24 },
  ROAD_SOUTH,
];

/** Out to sweep the step of the house with the television, and in again. */
const SWEEPER: Stop[] = [
  { ...HOUSE_1_DOOR, door: true },
  { x: HOUSE_1_DOOR.x + 0.6, z: HOUSE_1_DOOR.z + 0.4, wait: 60 },
  { ...HOUSE_1_DOOR, door: true },
];

/** In off the west road, across the square, and away between the church and the inn. */
const CHILDREN: Stop[] = [
  { x: -42, z: 9.6 },
  { x: -10, z: 10.2 },
  { x: -3, z: 5 },
  { x: 5, z: -5.5 },
  { x: 8.2, z: -10.5 },
  { x: 9, z: -17 },
  { x: 13, z: -34 },
];

/**
 * Night: someone comes down the church lane late, stops under the dead lamp and looks at the
 * reporter for a few seconds, then goes into the house with the television.
 */
function lateFigure(kit: LevelKit): void {
  if (Math.random() < 0.35) return;
  walker(kit, {
    look: 'late',
    once: true,
    firstIn: 25 + Math.random() * 50,
    stares: true,
    speed: 0.95,
    route: [
      { x: -10.2, z: -40 },
      { x: -9.4, z: -14 },
      { x: -9.8, z: -8.5, wait: 6 },
      { x: -12.6, z: -6 },
      { ...HOUSE_1_DOOR, door: true },
    ],
  });
}

/** Murmured talk at the inn step while the neighbour stands there, whether the smoker is out or someone inside the door. */
function chatter(kit: LevelKit, ctx: SceneContext, talking: () => boolean): void {
  const track = (handle: SoundHandle) => kit.use((k) => k.world.sounds.track(handle));
  let voices: SoundHandle | null = null;
  everyFrame(kit, () => {
    if (talking() && !voices) voices = track(tvMurmur(ctx.audio, { x: INN_STEP.x - 1, y: 1.6, z: INN_STEP.z + 1 }, 0.12));
    if (!talking() && voices) {
      voices.stop(1.5);
      voices = null;
    }
  });
}

/** Wood smoke from the stoves, leaning with the day's wind. */
function chimneys(kit: LevelKit, ctx: SceneContext): void {
  const wind = weather(ctx.state).wind;
  [
    { x: INN.x, z: INN.z - 4, top: 11.2 },
    { x: HOUSE_1.x - 1.5, z: HOUSE_1.z, top: 10.3 },
    { x: -22.5, z: 16.5, top: 9.9 },
    { x: LAITERIE.x, z: LAITERIE.z + 2, top: 10.3 },
    { x: -34, z: -6, top: 10.7 },
    { x: 25, z: -18, top: 9.5 },
  ].forEach((chimney, i) => chimneySmoke(kit, chimney, wind, `square-chimney-${i}`));
}

/** Crows along the eaves of the inn and the laiterie, which go up as the reporter passes under. */
function roofCrows(kit: LevelKit, ctx: SceneContext): void {
  const innEave = INN.x - INN.d / 2 - 0.8;
  const laiterieEave = LAITERIE.x + LAITERIE.d / 2 + 0.8;
  crows(kit, ctx, [
    { x: innEave, z: -6.2, y: 5.95, yaw: 90 },
    { x: innEave, z: -5.5, y: 5.95, yaw: 70 },
    { x: laiterieEave, z: 19.5, y: 5.95, yaw: -90 },
  ], 60);
}

/** Now and then a door shuts somewhere along the street, out of sight. */
function doorsNowAndThen(kit: LevelKit, ctx: SceneContext): void {
  const doors = [
    { x: -21, y: 1.2, z: 12.3 },
    { x: 21, y: 1.2, z: -19 },
    { x: -14, y: 1.2, z: 42 },
    { x: -30, y: 1.2, z: -6 },
  ];
  nowAndThen(kit, ctx, 75, () => doorShut(ctx.audio, doors[Math.floor(Math.random() * doors.length)]!, 0.3), 40);
}

/** A string shopping bag with the week's things, hanging from its handles. */
function shoppingBag(kit: LevelKit) {
  return kit
    .group((g) => {
      g.box({ w: 0.26, h: 0.26, d: 0.12 }).color(0x5a4a3a).at(0, -0.32, 0);
      g.box({ w: 0.12, h: 0.08, d: 0.07 }).color(0xb8b4a8).at(0.04, -0.08, 0);
      g.box({ w: 0.02, h: 0.1, d: 0.02 }).color(0x3a2e24).at(0, -0.06, 0);
    })
    .at(0, -0.02, 0);
}

/** The broom from the step, held halfway down the handle. */
function broom(kit: LevelKit) {
  return tool(kit, 'broom', 0).at(0, -0.85, -0.12);
}

/** A barrow pushed ahead, its handles at the hands. */
function barrow(kit: LevelKit) {
  return wheelbarrow(kit, true).at(0, 0.02, -0.95).rotY(180);
}

/** A black roadster with the saddle under the rider. */
function roadster(kit: LevelKit) {
  return bicycle(kit, { size: 1.35, frame: 0x1e1e1c }).at(0, 0, -0.16).rotY(180);
}
