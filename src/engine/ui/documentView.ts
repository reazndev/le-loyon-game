import { el, setVisible } from './dom';

/** How a document is drawn: a sheet of paper, a ruled notebook page, or a carved stone. */
export type DocumentLook = 'paper' | 'notebook' | 'stone';

export interface DocumentPage {
  title: string;
  text: string;
  /** English under the sheet, for French documents. */
  translation?: string;
  /** 0-based. */
  page: number;
  pages: number;
  look: DocumentLook;
}

/** Each look's textures. Pages alternate between them, so turning a page shows a different sheet. */
const sheets: Record<DocumentLook, string[]> = {
  paper: ['paper_sheet_a', 'paper_sheet_b'],
  notebook: ['notebook_page_a', 'notebook_page_b'],
  stone: ['gravestone_granite'],
};

const texture = (name: string) => `url(assets/textures/${name}.png)`;

/** A readable page over a dark backdrop, with its translation underneath. */
export class DocumentView {
  /** Whether translations show. */
  subtitles = true;
  private readonly screen: HTMLElement;
  private readonly sheet: HTMLElement;
  private readonly title: HTMLElement;
  private readonly text: HTMLElement;
  private readonly counter: HTMLElement;
  private readonly translation: HTMLElement;

  constructor(parent: HTMLElement) {
    this.screen = el('div', 'ui-document', parent);
    this.sheet = el('div', 'ui-sheet', this.screen);
    const head = el('div', 'ui-sheet-head', this.sheet);
    this.title = el('div', 'ui-sheet-title', head);
    this.counter = el('div', 'ui-sheet-page', head);
    this.text = el('div', 'ui-sheet-text', this.sheet);
    this.translation = el('div', 'ui-sheet-translation', this.screen);
    this.close();
  }

  show(page: DocumentPage): void {
    this.sheet.className = `ui-sheet look-${page.look}`;
    const names = sheets[page.look];
    const sheet = texture(names[page.page % names.length]!);
    // The notebook's page sits in a leather cover drawn under its border.
    this.sheet.style.backgroundImage = page.look === 'notebook' ? `${sheet}, ${texture('leather_cover')}` : sheet;
    this.title.textContent = page.title;
    this.text.textContent = page.text;
    const counter = page.look === 'notebook' ? `Page ${page.page + 1} of ${page.pages}` : `${page.page + 1} / ${page.pages}`;
    this.counter.textContent = page.pages > 1 ? counter : '';
    this.translation.textContent = page.translation ?? '';
    setVisible(this.translation, this.subtitles && Boolean(page.translation));
    setVisible(this.screen, true);
  }

  close(): void {
    setVisible(this.screen, false);
  }
}
