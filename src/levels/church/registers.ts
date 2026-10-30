import { documents, type DocumentId, type StoryFlag } from '../../content';
import type { DialogueNode, DialogueScript } from '../../game/dialogue';

/** The books in the register cupboard that open, with the flag each one sets once read. */
export const registerBooks: { doc: DocumentId; sets?: StoryFlag }[] = [
  { doc: 'doc_register_1995', sets: 'read_register' },
  { doc: 'doc_register_1996' },
  { doc: 'doc_register_1997' },
  { doc: 'doc_register_baptisms_1958', sets: 'read_baptism' },
  { doc: 'doc_chronicle', sets: 'read_chronicle' },
];

/**
 * P2: the cupboard as one dialogue. Each book shows its French pages under its title, then the
 * English, and goes back to the shelf. The flag is set once the English has been reached, so the
 * player has seen the whole entry.
 */
export function registerMenu(): DialogueScript {
  const nodes: Record<string, DialogueNode> = {
    shelf: {
      lines: ['The registers. Burials in green, baptisms in red, the chronicle in black.'],
      choices: [...registerBooks.map(({ doc }) => ({ text: documents[doc].title, next: doc })), { text: 'Close the cupboard.' }],
    },
  };
  registerBooks.forEach(({ doc, sets }) => {
    const { title, pages, translation } = documents[doc];
    const effects = sets ? { set: sets } : undefined;
    nodes[doc] = { speaker: title, lines: pages, next: translation ? `${doc}.en` : 'shelf', ...(!translation && effects ? { effects } : {}) };
    if (translation) nodes[`${doc}.en`] = { lines: translation, next: 'shelf', ...(effects ? { effects } : {}) };
  });
  return { start: 'shelf', nodes };
}
