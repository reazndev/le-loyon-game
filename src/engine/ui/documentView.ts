import { el, setVisible } from './dom';
import { grainTexture } from './grain';

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

const tints: Record<DocumentLook, [number, number, number]> = {
  paper: [196, 188, 166],
  notebook: [200, 197, 184],
  stone: [112, 114, 110],
};

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
    this.sheet.style.backgroundImage = `url(${grainTexture(...tints[page.look])})`;
    this.title.textContent = page.title;
    this.text.textContent = page.text;
    this.counter.textContent = page.pages > 1 ? `${page.page + 1} / ${page.pages}` : '';
    this.translation.textContent = page.translation ?? '';
    setVisible(this.translation, this.subtitles && Boolean(page.translation));
    setVisible(this.screen, true);
  }

  close(): void {
    setVisible(this.screen, false);
  }
}
