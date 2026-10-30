import type { LevelKit } from '../../game/kit/levelKit';
import type { SceneContext } from '../../game/scene';
import { day, headingTo, near, villageRound, ways } from '../village_square/hints';
import { cafeLit, type InnDressing } from './dressing';
import { BED, GILLES_AT_COUNTER, PHONE, SEAT, TABLES } from './layout';

/** The inn's clues: the phone when it rings, then who to talk to and where each room is. */
export function hints(kit: LevelKit, ctx: SceneContext, dressing: InnDressing, ringing: () => boolean): void {
  const toInn = headingTo(ctx, 'inn');
  const night = () => ctx.state.time === 'night';

  kit.hint('The phone is ringing in the back room. Answer it.', { when: ringing });
  kit.hint('Lift the receiver and dial the newspaper.', { if: { count: day(4) }, near: near(PHONE, 2) });
  kit.hint('Sit at the computer and read the newest posts.', { if: { count: day(3) }, near: near(SEAT, 2), when: toInn });
  kit.hint('Lie down on the bed to sleep.', { near: near(BED, 2.5), when: () => night() && toInn() });
  kit.hint('The man at the counter is the mechanic. He may talk.', { if: { count: day(1), notFlag: 'met_gilles' }, near: near(GILLES_AT_COUNTER, 2) });
  kit.hint('The farmer having coffee here is from the Yerly farm. Talk to him.', { if: { notFlag: 'heifer_found' }, near: near(TABLES[3], 2.5), when: headingTo(ctx, 'yerly_farm') });

  kit.hint('The innkeeper is behind the counter at the back. Talk to her.', { if: { notFlag: 'inn_checked_in' } });
  kit.hint('When you have seen the village, ask the innkeeper for supper.', { if: villageRound });
  kit.hint('Supper is ready. Talk to the innkeeper at the counter.', { if: { count: day(2) }, when: toInn });
  kit.hint('Room 3 is up the stairs at the back, at the end of the corridor.', { when: () => night() && toInn() });
  // On the third evening the café is dark and the innkeeper has gone through, so the shop is the way.
  kit.hint('Ask the innkeeper at the counter to pack bread and cheese.', { when: () => cafeLit(dressing) && headingTo(ctx, 'laiterie')() });
  kit.hint('The computer is in the back room, left as you come in.', { if: { count: day(3) }, when: toInn });
  kit.hint('The phone is in the back room, left as you come in.', { if: { count: day(4) } });
  ways(kit, ctx, 'inn');
}
