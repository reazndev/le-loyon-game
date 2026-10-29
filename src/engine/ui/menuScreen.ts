import { el, setVisible } from './dom';
import { ListMenu } from './listMenu';

export interface MenuEntry {
  label: string;
  /** Text shown at the bottom while this entry is selected. */
  detail?: string;
}

/** A full-frame menu with a title, a list, and a detail line. Used for pause and inventory. */
export class MenuScreen {
  readonly list: ListMenu;
  private readonly screen: HTMLElement;
  private readonly title: HTMLElement;
  private readonly empty: HTMLElement;
  private readonly detail: HTMLElement;
  private entries: MenuEntry[] = [];

  constructor(parent: HTMLElement) {
    this.screen = el('div', 'ui-screen', parent);
    this.title = el('div', 'ui-title', this.screen);
    this.list = new ListMenu(this.screen);
    this.empty = el('div', 'ui-empty', this.screen);
    this.detail = el('div', 'ui-detail', this.screen);
    this.list.onSelect = (index) => (this.detail.textContent = this.entries[index]?.detail ?? '');
    this.close();
  }

  open(title: string, entries: MenuEntry[], emptyText = ''): void {
    this.entries = entries;
    this.title.textContent = title;
    this.detail.textContent = '';
    this.empty.textContent = entries.length === 0 ? emptyText : '';
    this.list.set(entries.map((e) => e.label));
    setVisible(this.screen, true);
  }

  close(): void {
    setVisible(this.screen, false);
  }
}
