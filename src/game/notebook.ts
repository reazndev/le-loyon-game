import { checkStory, holds, notebook, notebookGoals, type Flag, type NotebookEntry } from '../content';
import { paginate } from '../content/paginate';
import type { StateView } from './conditions';
import type { ReadableDocument } from './documentPages';

/** The notebook lines the player has earned, in story order. */
export function unlockedNotes(state: StateView): string[] {
  return (Object.entries(notebook) as [Flag, NotebookEntry][])
    .filter(([flag, entry]) => holds(flag, state) && checkStory(entry.if, state))
    .map(([, entry]) => entry.text);
}

/** What the reporter means to do next, or null when the story has nothing left to do. */
export function currentGoal(state: StateView): string | null {
  return notebookGoals.find((goal) => checkStory(goal.if, state))?.text ?? null;
}

const controls = [
  'Move: arrows or WASD. Run: Shift.',
  'Use: E. Torch: F. Crouch: C. Camera: Q.',
  'Inventory: Tab. Notebook: N. Hints: H. Pause and save: Esc.',
].join('\n');

/** The hints page: the next step, then the controls. */
export function hintsDocument(state: StateView): ReadableDocument {
  const goal = currentGoal(state);
  return { title: 'Hints', pages: paginate([goal ? `Next: ${goal}` : 'Nothing left to do but finish it.', controls].join('\n\n')) };
}

/** The notebook as a document for the quest log view: the next step first, then one paragraph per note. */
export function notebookDocument(state: StateView): ReadableDocument {
  const goal = currentGoal(state);
  const paragraphs = [...(goal ? [goal] : []), ...unlockedNotes(state)];
  return { title: 'Notebook', pages: paragraphs.length === 0 ? ['Nothing yet. A clean page.'] : paginate(paragraphs.join('\n\n')) };
}
