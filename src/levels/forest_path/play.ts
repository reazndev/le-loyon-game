import { dialogues, documents, type DocumentId, type NodeId } from '../../content';
import type { SceneContext } from '../../game/scene';

/** Plays a dialogue from the script by its node id. */
export const playNode = (ctx: SceneContext, id: NodeId): Promise<void> => ctx.dialogue(dialogues[id]);

/** Shows a document from 06-documents.md page by page, with its English subtitle if it has one. */
export async function readDocument(ctx: SceneContext, id: DocumentId): Promise<void> {
  const document = documents[id];
  await ctx.say(document.pages, document.title);
  if (document.translation) await ctx.say(document.translation);
}
