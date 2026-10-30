import type { LevelKit } from '../../game/kit/levelKit';
import type { SceneContext } from '../../game/scene';
import { day, near, villageRound, ways } from '../village_square/hints';
import { BENCH } from './layout';

/** The workshop's clues: who is at the bench, and where the mechanic is on day 1. */
export function hints(kit: LevelKit, ctx: SceneContext): void {
  kit.hint('Ask the mechanic at the bench if he knew Marc Chassot.', { if: { count: day(2), notFlag: 'knows_legion' }, near: near(BENCH, 3) });
  kit.hint('Talk to the boy at the bench. The mechanic is at the inn tonight.', { if: { all: [villageRound, { notFlag: 'met_gilles' }] } });
  kit.hint('Talk to the boy at the bench. Then ask the innkeeper for supper.', { if: villageRound });
  ways(kit, ctx, 'garage_dousse');
}
