import { dialogues, type NodeId } from '../../content';
import type { SceneContext } from '../../game/scene';

/** Plays a dialogue from the script by its node id. */
export const playNode = (ctx: SceneContext, id: NodeId): Promise<void> => ctx.dialogue(dialogues[id]);
