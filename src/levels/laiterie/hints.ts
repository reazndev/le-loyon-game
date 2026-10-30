import type { LevelKit } from '../../game/kit/levelKit';
import type { SceneContext } from '../../game/scene';
import { day, headingTo, near, villageRound, ways } from '../village_square/hints';
import { SHOP_COUNTER } from './layout';

/** The shop's clues: who to talk to, and the bread on day 3. */
export function hints(kit: LevelKit, ctx: SceneContext): void {
  kit.hint('The woman at the counter has heard about last night. Ask her.', { if: { count: day(2), notFlag: 'christine_daniel_hint' }, near: near(SHOP_COUNTER, 2.5), point: SHOP_COUNTER });
  kit.hint('Ask the woman at the counter for bread and cheese.', { when: headingTo(ctx, 'laiterie') });
  kit.hint('The woman at the counter hears everything. Then try the garage.', { if: villageRound, point: SHOP_COUNTER });
  ways(kit, ctx, 'laiterie');
}
