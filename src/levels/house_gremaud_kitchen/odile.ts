import { dialogues } from '../../content';
import type { Condition } from '../../game/conditions';
import type { DialogueScript, Next } from '../../game/dialogue';
import type { LevelKit } from '../../game/kit/levelKit';
import type { NpcBuilder } from '../../game/kit/npc';
import type { SceneContext } from '../../game/scene';
import { everyFrame } from '../church/everyFrame';

/** The doorstep half of `odile_talk` has played outside; the kitchen picks up at `odile_talk_2`. */
export const INSIDE_FIRST_TIME: Condition = { flag: 'read_register', notFlag: 'odile_talked' };
const GREET_AFTER = 1;

const asList = (next: Next): Exclude<Next, string> => (typeof next === 'string' ? [{ to: next }] : next);

/** Her entry table, opening at `odile_talk_2` the first time the player is in her kitchen. */
export function kitchenScript(entry: DialogueScript): DialogueScript {
  return { ...entry, start: [{ if: INSIDE_FIRST_TIME, to: 'odile_talk_2' }, ...asList(entry.start)] };
}

/** Odile on her feet by the sink, between her chair and the window. */
export function placeOdile(kit: LevelKit, at: { x: number; z: number; yaw: number }): NpcBuilder {
  return kit.npc('odile').at(at.x, 0, at.z).faceYaw(at.yaw).watch(3).talk(kitchenScript(dialogues.odile));
}

/** On the first visit she starts talking a second after the player comes in, facing them. */
export function greetOnArrival(kit: LevelKit, ctx: SceneContext, odile: NpcBuilder): void {
  let greeted = false;
  everyFrame(kit, () => {
    if (greeted || ctx.time < GREET_AFTER) return;
    greeted = true;
    void facingPlayer(ctx, odile, dialogues.odile_talk_2);
  });
}

async function facingPlayer(ctx: SceneContext, npc: NpcBuilder, script: DialogueScript): Promise<void> {
  const character = npc.character;
  character.lookAt = ctx.player.camera.position;
  character.turnToLook = true;
  await ctx.dialogue(script);
  character.turnToLook = false;
  character.lookAt = null;
}
