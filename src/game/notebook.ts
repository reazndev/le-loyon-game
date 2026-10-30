import { checkStory, holds, notebook, notebookGoals, type Flag, type NotebookEntry, type NotebookGoal } from '../content';
import { BOOK_PAGE, paginate } from '../content/paginate';
import type { StateView } from './conditions';
import type { ReadableDocument } from './documentPages';

/** The notebook lines the player has earned, in story order. */
export function unlockedNotes(state: StateView): string[] {
  return (Object.entries(notebook) as [Flag, NotebookEntry][])
    .filter(([flag, entry]) => holds(flag, state) && checkStory(entry.if, state))
    .map(([, entry]) => entry.text);
}

/** The step the reporter means to take next, or undefined when the story has nothing left to do. */
export function nextStep(state: StateView): NotebookGoal | undefined {
  return notebookGoals.find((goal) => checkStory(goal.if, state));
}

/** What the reporter means to do next, or null when the story has nothing left to do. */
export function currentGoal(state: StateView): string | null {
  return nextStep(state)?.text ?? null;
}

const controls = [
  'Move: WASD or arrows',
  'Run: Shift      Use: E',
  'Torch: F        Crouch: C',
  'Camera: Q       Inventory: Tab',
  'Notebook: N     Hints: H',
  'Pause and save: Esc',
].join('\n');

/** The hints page: the next step, then the controls. */
export function hintsDocument(state: StateView): ReadableDocument {
  const goal = currentGoal(state);
  return { title: 'Hints', pages: paginate([goal ? `Next: ${goal}` : 'Nothing left to do but finish it.', controls].join('\n\n'), BOOK_PAGE) };
}

/** The notebook as a document for the quest log view: the next step first, then one paragraph per note. */
export function notebookDocument(state: StateView): ReadableDocument {
  const goal = currentGoal(state);
  const paragraphs = [...(goal ? [goal] : []), ...unlockedNotes(state)];
  return { title: 'Notebook', pages: paragraphs.length === 0 ? ['Nothing yet. A clean page.'] : paginate(paragraphs.join('\n\n'), BOOK_PAGE) };
}
