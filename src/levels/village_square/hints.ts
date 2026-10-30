import type { Condition, CountTest } from '../../game/conditions';
import type { LevelKit } from '../../game/kit/levelKit';
import { nextStep } from '../../game/notebook';
import type { SceneContext } from '../../game/scene';
import { BUS_STOP, CHURCH_DOOR, churchLane, GREMAUD_GATE, PHONE_BOX } from './layout';

/** Day `n` before nightfall, as the notebook goals count it. */
export const day = (n: number): CountTest[] => [['day', '==', n], ['night', '==', 0]];
export const near = (spot: { x: number; z: number }, r: number) => ({ x: spot.x, z: spot.z, r });

/** Day 1 with the room taken and the priest heard: the round of the village before supper. */
export const villageRound: Condition = { count: day(1), flag: ['inn_checked_in', 'abbe_told_graves'], notFlag: 'dinner_day1' };

/** Scenes past the cemetery, in the Bois-Noir. */
const FOREST = ['forest_path', 'bunker_interior', 'bunker_hidden', 'forest_deep'];

/** Whether the next notebook step happens in one of `scenes`. */
export const headingTo =
  (ctx: SceneContext, ...scenes: string[]) =>
  (): boolean =>
    scenes.includes(nextStep(ctx.state)?.to ?? '');

/** The night steps with no scene of their own all happen at the cemetery. */
const headingToCemetery = (ctx: SceneContext) => () => {
  const to = nextStep(ctx.state)?.to;
  return to === 'cemetery' || (!to && ctx.state.time === 'night');
};

/** Whether the next step lies up the lane past the church: the cemetery or the forest behind it. */
export const headingUpTheHill = (ctx: SceneContext) => () => headingToCemetery(ctx)() || headingTo(ctx, ...FOREST)();

/**
 * Which way the next step lies, told from the square so it reads the same from any building on
 * it. Scenes in the village register their own clues first and these after, skipping `here`.
 */
export function ways(kit: LevelKit, ctx: SceneContext, here: string): void {
  const toward = (scene: string, text: string) => {
    if (scene !== here) kit.hint(text, { when: headingTo(ctx, scene) });
  };
  toward('inn', 'The inn is on the east side of the square, under the hanging sign.');
  toward('church', 'The church is the tower at the north end of the square.');
  toward('house_gremaud_kitchen', "The Gremaud house is down the lane by the square's red phone box.");
  toward('yerly_farm', 'The Yerly farm is at the end of the road south, past the garage.');
  toward('laiterie', 'The dairy shop is down the road south, across from the garage.');
  kit.hint('The cemetery lane runs up the west side of the church.', { when: headingToCemetery(ctx) });
  kit.hint('The forest is past the cemetery, up the lane west of the church.', { when: headingTo(ctx, ...FOREST) });
  kit.hint('The dairy shop, the garage and the farm are down the road south.', { if: villageRound });
}

/** The square's clues: the torch, the locked church, the start of each way out, then the ways. */
export function hints(kit: LevelKit, ctx: SceneContext): void {
  const lights = kit.use((k) => k.world.lights);
  const night = () => ctx.state.time === 'night';
  const laneFoot = near({ x: churchLane[0]![0], z: churchLane[0]![1] }, 4);

  kit.hint('It is dark. Press F to switch the torch on.', { if: { item: 'flashlight' }, when: () => night() && !lights.flashlightOn });
  kit.hint('Locked at night. The lane up the hill is on its west side.', { near: near(CHURCH_DOOR, 3), when: night });
  kit.hint('Follow the gravel lane north, past the yellow sign, up the hill.', { near: laneFoot, when: headingUpTheHill(ctx) });
  kit.hint('Go through the gate to the front door.', { near: near(GREMAUD_GATE, 3), when: headingTo(ctx, 'house_gremaud_kitchen') });
  kit.hint('The phone box is by the Gremaud lane.', { if: { flag: ['knows_brodard', 'has_taxcard'], notFlag: 'brodard_called', count: [['night', '==', 0]] }, point: PHONE_BOX });
  kit.hint('Cross the square past the fountain. The inn is on the east side.', { if: { notFlag: 'inn_checked_in' }, near: near(BUS_STOP, 5) });
  ways(kit, ctx, 'village_square');
}
