import { notebookGoals } from '../../content';
import type { Condition } from '../../game/conditions';
import type { LevelKit } from '../../game/kit/levelKit';

/**
 * Story steps as conditions for the live clues of the forest, the farms, and the Gremaud house.
 * Each holds exactly while its notebook goal is the one shown: its own condition holds and no
 * earlier goal's does.
 */
function step(start: string): Condition {
  const at = notebookGoals.findIndex((goal) => goal.text.startsWith(start));
  if (at < 0) throw new Error(`No notebook goal starts with "${start}"`);
  return { all: [notebookGoals[at]!.if, ...notebookGoals.slice(0, at).map((goal) => ({ not: goal.if }))] };
}

export const steps = {
  checkIn: step('Go to the inn on the square'),
  priest: step('Go to the church and talk to the priest'),
  village: step('Talk to people around the village'),
  graves: step('Go up to the cemetery and read'),
  wait: step('Wait by the graves'),
  watchWall: step('Stay a while'),
  follow: step('Follow the figure'),
  sleep1: step('Go back to the inn and sleep in room 3'),
  register: step('Go to the church after morning mass'),
  widow: step("Visit the syndic's widow"),
  coffin: step('Ask the farmer at the Yerly farm about the coffin'),
  heifer: step("Find the farmer's lost heifer"),
  spade: step('Go to the Yerly farm and ask the farmer for a spade'),
  searchBunker: step('Go back to the barn in the forest'),
  forestByDay: step('Go into the forest past the cemetery'),
  supper2: step('Ask the innkeeper for supper'),
  dig: step("Dig up Marc's side"),
  openBox: step('Open the box'),
  refill: step('Fill the grave back in'),
  sleep2: step('Go back to the inn and sleep.'),
  larch: step('Climb the forest above the fort'),
  bread: step('Buy bread at the dairy shop'),
  computer: step("Use the computer in the inn's back room"),
  knock: step('Go to the K.P. 3 door'),
  tunnel: step('Leave through the tunnel'),
  editor: step('Call your editor'),
};

export const anyOf = (...conditions: Condition[]): Condition => ({ any: conditions });

/** The cemetery steps of nights 1 and 2. */
export const atTheCemetery = anyOf(steps.graves, steps.wait, steps.watchWall, steps.follow, steps.dig, steps.openBox, steps.refill);
/** The steps that go up into the forest past the cemetery, to the barn, the larch, or the K.P. 3 door. */
export const upTheForest = anyOf(steps.searchBunker, steps.forestByDay, steps.larch, steps.knock);
/** The steps at the Yerly farm. */
export const atTheFarm = anyOf(steps.coffin, steps.heifer, steps.spade);

/** A spot that takes in the whole scene, so a clue about what is happening right now beats the clues for places. */
export const anywhere = { x: 0, z: 0, r: Infinity };

/** Meters between the heifer and the reporter before she counts as left behind. */
export const HEIFER_LAG = 8;
export const heiferClues = {
  walkUp: "Walk right up to her and she'll follow you.",
  lagging: 'She has fallen behind. Go back for her.',
};

type Destination = 'inn' | 'church' | 'village' | 'cemetery' | 'gremaud' | 'farm' | 'forest' | 'bread';

/** Where each step goes once the player is on the square. */
const fromTheSquare: { to: Destination; if: Condition; then: string }[] = [
  { to: 'inn', if: anyOf(steps.checkIn, steps.sleep1, steps.supper2, steps.sleep2, steps.computer, steps.editor), then: 'the inn' },
  { to: 'church', if: anyOf(steps.priest, steps.register), then: 'the church' },
  { to: 'village', if: steps.village, then: 'the dairy shop or garage' },
  { to: 'cemetery', if: atTheCemetery, then: 'up to the cemetery' },
  { to: 'gremaud', if: steps.widow, then: 'the Gremaud house by the inn' },
  { to: 'farm', if: atTheFarm, then: 'the Yerly farm road' },
  { to: 'forest', if: upTheForest, then: 'the cemetery and the forest' },
  { to: 'bread', if: steps.bread, then: 'the dairy shop or the inn' },
];

/**
 * Scene-wide clues for every step whose place is through the village square, such as
 * "Take the road east to the square, then the church." `way` is the first half; the scene
 * leaves out the destinations it gives its own clues for.
 */
export function viaTheSquare(kit: LevelKit, way: string, own: Destination[] = []): void {
  fromTheSquare.filter((route) => !own.includes(route.to)).forEach((route) => kit.hint(`${way}, then ${route.then}.`, { if: route.if }));
}
