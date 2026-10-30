import type { Condition } from '../../game/conditions';
import type { LevelKit } from '../../game/kit/levelKit';
import type { SceneContext } from '../../game/scene';
import type { StoryPhase } from '../forest_path/story';
import { SIGHTING, SIGHTING_FROM, type Figure } from './beats';
import { holeOpen } from './dig';
import type { DigSite } from './digSite';
import { BACK_GATE, BACK_Z, chassotGrave, GRAVE_FOOT, graveByDoc, GROUNDS, inside, readingSpot, SHED } from './layout';
import type { NightTwoRound } from './watchman';

/** The next step is in the forest past the back gate: the fort by day 2, the larch on day 3, the K.P. 3 door on night 3. */
export const forestAhead: Condition = {
  any: [
    { count: [['day', '==', 2], ['night', '==', 0]], notFlag: 'found_hidden_door' },
    { count: [['day', '==', 3], ['night', '==', 0]], notFlag: 'found_forest_grave', not: { flag: 'editor_called', item: 'food_parcel' } },
    { count: [['night', '==', 3]], notFlag: 'entered_hidden_room' },
  ],
};

const ALL_READ: Condition = { flag: ['read_grave_menoud', 'read_grave_gremaud', 'read_grave_chassot'] };
const near = (spot: { x: number; z: number }, r: number) => ({ x: spot.x, z: spot.z, r });

export interface Live {
  figure: () => Figure;
  site: DigSite;
  round: NightTwoRound | null;
}

/** The clue under the goal line: where the three graves are, when to wait, and how to get through the watchman's rounds. */
export function hints(kit: LevelKit, ctx: SceneContext, phase: StoryPhase, live: Live): void {
  if (phase === 'night1') nightOne(kit, live);
  else if (phase === 'night2') nightTwo(kit, ctx, live);
  else if (phase === 'day1') kit.hint('Nothing up here yet. The front gate leads back down to the village.');
  else if (phase === 'day2') kit.hint('Not by daylight. Come back tonight with a spade.', { if: { notFlag: 'opened_coffin' }, near: near(GRAVE_FOOT, 3) });
  kit.hint('The forest path starts at the back gate, left of the middle path.', { if: forestAhead });
}

function nightOne(kit: LevelKit, { figure }: Live): void {
  const followed: Condition = { flag: 'first_sighting', notFlag: ['found_bunker', 'skipped_follow'] };
  const waiting: Condition = { all: [ALL_READ, { notFlag: ['first_sighting', 'skipped_follow', 'found_bunker'] }] };

  kit.hint('Look at the back wall, behind the Chassot plot. Walk toward it.', { when: () => figure() === 'standing' });
  kit.hint('It went toward the back gate. Watch the gate.', { when: () => figure() === 'leaving' });
  kit.hint('Keep going straight into the trees.', { if: followed, near: near({ x: BACK_GATE.x, z: BACK_Z - 3 }, 4) });
  kit.hint('Go out the back gate, left of the middle path, and follow.', { if: followed });
  kit.hint('Leave by the front gate and go down the path to the village.', { if: { any: [{ flag: 'found_bunker' }, { flag: 'skipped_follow' }] } });

  // The figure only comes for a reporter standing well back from the wall.
  kit.hint('Too close to the wall. Step back toward the middle path and wait.', {
    if: { all: [waiting, { flag: 'met_raymond' }] },
    near: near(SIGHTING, SIGHTING_FROM),
    when: () => figure() === 'absent',
  });
  kit.hint('Stand on the middle path, face the back left corner, and wait.', { if: { all: [waiting, { flag: 'met_raymond' }] } });
  kit.hint("Don't leave yet. Stand among the graves for a minute and keep still.", { if: { all: [waiting, { notFlag: 'met_raymond' }] } });

  const menoud = graveByDoc('grave_menoud');
  const gremaud = graveByDoc('grave_gremaud');
  kit.hint("The stone with the red lantern is Daniel Menoud's.", { if: { notFlag: 'read_grave_menoud' }, near: near(readingSpot(menoud), 2.5) });
  kit.hint("The low flat stone with white flowers is Gremaud's.", { if: { notFlag: 'read_grave_gremaud' }, near: near(readingSpot(gremaud), 2.5) });
  kit.hint("The big family stone in the corner is the Chassots'.", { if: { notFlag: 'read_grave_chassot' }, near: near(readingSpot(chassotGrave), 3) });
  kit.hint("Daniel Menoud lies in the second row, just left of the middle path.", { if: { notFlag: 'read_grave_menoud' } });
  kit.hint("Gremaud's is a flat stone in the middle row, far over on the left.", { if: { notFlag: 'read_grave_gremaud' } });
  kit.hint('The Chassot plot is in the back row, in the far left corner.', { if: { notFlag: 'read_grave_chassot' } });
}

function nightTwo(kit: LevelKit, ctx: SceneContext, { site, round }: Live): void {
  const lights = kit.use((k) => k.world.lights);
  const { state, player } = ctx;
  const onRound = () => !!round && round.patrol.raymond.object.visible && !round.patrol.caught;
  const inGrounds = () => inside(GROUNDS, player.position.x, player.position.z);
  const tarpOver = () => site.tarp === 'over';
  const atGrave = near(GRAVE_FOOT, 3);

  // While he is on his round, most urgent first.
  kit.hint('Torch off now. He sees it from anywhere inside the walls.', { when: () => onRound() && lights.flashlightOn && inGrounds() });
  kit.hint('Climb out and hide. His torch checks this grave every time.', { when: () => onRound() && site.inHole });
  kit.hint('Pull the tarp over the hole, or his torch finds it.', { when: () => onRound() && site.visible && site.tarp === 'beside' });
  kit.hint("He'll see the open hole. Get out through the back gate, now.", { when: () => onRound() && site.visible && inGrounds() });
  kit.hint('Stay in the shed until the bell fades away.', { near: near(SHED, 1.5), when: () => onRound() && !site.visible });
  kit.hint('Wait out here until he has gone back down.', { near: near({ x: BACK_GATE.x, z: BACK_Z - 4 }, 4), when: onRound });
  kit.hint("He's coming. Hide in the shed by the front gate or out the back.", { when: () => onRound() && inGrounds() });

  // Between rounds.
  kit.hint("He's gone. Pull the tarp off the hole to carry on.", { when: () => !onRound() && tarpOver() && holeOpen(state) });
  kit.hint('Climbing out takes three seconds now. Get out at the first bell.', { if: { notFlag: 'opened_coffin' }, when: () => site.inHole && state.count('dig_stage') >= 3 });
  kit.hint('Step back to climb out, then fill the grave in from the edge.', { if: { item: 'bunker_key', notFlag: 'grave_refilled' }, when: () => site.inHole });
  kit.hint('The tarp in the shed can hide the hole from his torch.', { if: { notFlag: 'opened_coffin' }, when: () => holeOpen(state) && site.tarp === 'shed' });
  kit.hint('Stand at the foot of the left bed, by the boot prints. Hold to dig.', {
    if: { item: 'shovel', count: [['dig_stage', '==', 0]] },
    near: atGrave,
    when: () => !onRound(),
  });
  kit.hint('Keep holding to dig. Let go and listen for the bell now and then.', {
    if: { notFlag: 'opened_coffin' },
    near: atGrave,
    when: () => !onRound() && site.tarp === 'beside' && !site.inHole && holeOpen(state),
  });
  kit.hint('Stand at the foot of the hole and hold to throw the earth back.', {
    if: { item: 'bunker_key', notFlag: 'grave_refilled' },
    near: atGrave,
    when: () => !onRound() && !tarpOver() && !site.inHole,
  });
  kit.hint("The Chassot plot is in the back left corner. Marc's is the left bed.", { if: { item: 'shovel', notFlag: 'opened_coffin' } });
  kit.hint('Leave by the front gate between his rounds and go down to the inn.', { if: { any: [{ flag: 'grave_refilled' }, { flag: 'grave_left_open' }] } });
}
