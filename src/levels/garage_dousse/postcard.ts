import type { LevelKit } from '../../game/kit/levelKit';
import type { SceneContext } from '../../game/scene';
import { everyFrame } from '../church/everyFrame';
import { POSTCARD } from './layout';
import { narration } from './narration';

/**
 * The 1979 postcard from Calvi, pinned above the bench. When Gilles unpins it and hands it
 * over (`knows_legion`), it goes from the wall at once, leaving the pin and a paler square.
 */
export function buildPostcard(kit: LevelKit, ctx: SceneContext): void {
  const { x, y, z } = POSTCARD;
  const pinned = () => !ctx.state.hasFlag('knows_legion');

  kit.box({ w: 0.17, h: 0.12, d: 0.003 }).color(0xa4a69a).at(x, y - 0.005, z - 0.004);
  const card = kit.group((g) => {
    g.box({ w: 0.15, h: 0.1, d: 0.004 }).color(0xb4b4a4).at(0, 0, 0);
    g.box({ w: 0.138, h: 0.05, d: 0.005 }).color(0x5e8aa6).at(0, 0.044, 0);
    g.box({ w: 0.138, h: 0.03, d: 0.005 }).color(0x3a6684).at(0, 0.014, 0);
    g.box({ w: 0.05, h: 0.03, d: 0.006 }).color(0x9a8c70).at(0.035, 0.05, 0);
  }).at(x, y, z);
  kit.box({ w: 0.012, h: 0.012, d: 0.02 }).color(0x6a2a20).at(x, y + 0.085, z);

  everyFrame(kit, () => {
    card.object.visible = pinned();
  });
  kit
    .hotspot({
      prompt: () => (pinned() ? 'Look at the postcard' : 'Look at the pin'),
      radius: 0.35,
      onInteract: () => ctx.say(pinned() ? narration.postcard : narration.postcardGone),
    })
    .at(x, 0, z + 0.1);
}
