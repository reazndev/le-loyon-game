import { documents, type DocumentId, type StoryFlag } from '../../content';
import type { DialogueScript } from '../../game/dialogue';
import type { SceneContext } from '../../game/scene';

/** The books in the register cupboard that open, with the flag each one sets once read. */
export const registerBooks: { doc: DocumentId; sets?: StoryFlag }[] = [
  { doc: 'doc_register_1995', sets: 'read_register' },
  { doc: 'doc_register_1996' },
  { doc: 'doc_register_1997' },
  { doc: 'doc_register_baptisms_1958', sets: 'read_baptism' },
  { doc: 'doc_chronicle', sets: 'read_chronicle' },
];

export const CLOSE_CUPBOARD = 'Close the cupboard.';

/** The shelf: one choice per book, by its title, and one to close the cupboard. */
export const shelf: DialogueScript = {
  start: 'shelf',
  nodes: {
    shelf: {
      lines: ['The registers. Burials in green, baptisms in red, the chronicle in black.'],
      choices: [...registerBooks.map(({ doc }) => ({ text: documents[doc].title })), { text: CLOSE_CUPBOARD }],
    },
  },
};

/** The book a shelf choice opens, or undefined for closing the cupboard. */
export const bookTitled = (title: string | null) => registerBooks.find(({ doc }) => documents[doc].title === title);

/**
 * P2: the cupboard. Each book opens in the document view, French with the English under it, and
 * sets its flag once the player closes it, then the shelf comes back.
 */
export async function readRegisters(ctx: SceneContext): Promise<void> {
  let book = bookTitled(await ctx.ask(shelf));
  while (book) {
    await ctx.readDocument(book.doc);
    if (book.sets) ctx.state.setFlag(book.sets);
    book = bookTitled(await ctx.ask(shelf));
  }
}
