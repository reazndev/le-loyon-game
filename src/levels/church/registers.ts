import { documents, type DocumentId, type ItemId, type StoryFlag } from '../../content';
import type { StateView } from '../../game/conditions';
import type { DialogueScript } from '../../game/dialogue';
import type { SceneContext } from '../../game/scene';
import { playNode } from '../forest_path/play';

/**
 * The books in the register cupboard that open, with the flag each one sets once read. The green
 * burials books spend day 2 in the parish office (A2); reading 1995 takes them out of the bag again.
 */
export const registerBooks: { doc: DocumentId; burials?: true; sets?: StoryFlag; takes?: ItemId }[] = [
  { doc: 'doc_register_1995', burials: true, sets: 'read_register', takes: 'burials_book' },
  { doc: 'doc_register_1996', burials: true },
  { doc: 'doc_register_1997', burials: true },
  { doc: 'doc_register_baptisms_1958', sets: 'read_baptism' },
  { doc: 'doc_chronicle', sets: 'read_chronicle' },
];

export const CLOSE_CUPBOARD = 'Close the cupboard.';

/** Day 2 until the printer prints: Simone has the burials books on her desk in the office. */
export const burialsInOffice = (state: StateView): boolean =>
  state.count('day') === 2 && !state.hasFlag('simone_printed') && !state.hasFlag('read_register');

/** The shelf shows a gap while the burials books are in the office or in the reporter's hands. */
export const burialsGap = (state: StateView): boolean => burialsInOffice(state) || state.hasItem('burials_book');

/** The shelf: one choice per book on it, by its title, and one to close the cupboard. */
export function shelf(state: StateView): DialogueScript {
  const away = burialsInOffice(state);
  const books = registerBooks.filter(({ burials }) => !(away && burials));
  return {
    start: 'shelf',
    nodes: {
      shelf: {
        lines: [away ? 'Baptisms in red, the chronicle in black.' : 'The registers. Burials in green, baptisms in red, the chronicle in black.'],
        choices: [...books.map(({ doc }) => ({ text: documents[doc].title })), { text: CLOSE_CUPBOARD }],
      },
    },
  };
}

/** The book a shelf choice opens, or undefined for closing the cupboard. */
export const bookTitled = (title: string | null) => registerBooks.find(({ doc }) => documents[doc].title === title);

/**
 * P2: the cupboard. The burials books go back first if the reporter carries them, or the gap
 * shows if they are still in the office. Each book opens in the document view, French with the
 * English under it, and sets its flag once the player closes it, then the shelf comes back.
 */
export async function readRegisters(ctx: SceneContext): Promise<void> {
  if (ctx.state.hasItem('burials_book')) await playNode(ctx, 'sacristy_books_back');
  else if (burialsInOffice(ctx.state)) await playNode(ctx, 'sacristy_register_gap');
  let book = bookTitled(await ctx.ask(shelf(ctx.state)));
  while (book) {
    await ctx.readDocument(book.doc);
    if (book.sets) ctx.state.setFlag(book.sets);
    if (book.takes) ctx.state.takeItem(book.takes);
    book = bookTitled(await ctx.ask(shelf(ctx.state)));
  }
}
