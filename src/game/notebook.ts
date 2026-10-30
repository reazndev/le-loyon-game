import { checkStory, holds, notebook, type Flag, type NotebookEntry } from '../content';
import { paginate } from '../content/paginate';
import type { StateView } from './conditions';
import type { ReadableDocument } from './documentPages';

/** The notebook lines the player has earned, in story order. */
export function unlockedNotes(state: StateView): string[] {
  return (Object.entries(notebook) as [Flag, NotebookEntry][])
    .filter(([flag, entry]) => holds(flag, state) && checkStory(entry.if, state))
    .map(([, entry]) => entry.text);
}

/** The notebook as a document, one paragraph per note, for the quest log view. */
export function notebookDocument(state: StateView): ReadableDocument {
  const notes = unlockedNotes(state);
  return {
    title: 'Notebook',
    pages: notes.length === 0 ? ['Nothing yet. A clean page.'] : paginate(notes.join('\n\n')),
  };
}
