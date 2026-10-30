import { el, setVisible } from './dom';
import { ListMenu, type ListRow } from './listMenu';

export interface MenuEntry extends ListRow {
  /** Text shown at the bottom while this entry is selected. */
  detail?: string;
  /** What the confirm button does to this entry, such as "Read". Shown under the detail. */
  action?: string;
}

/** A full-frame menu with a title, a list, and a detail line. Used for pause, inventory, and settings. */
export class MenuScreen {
  readonly list: ListMenu;
  /** The confirm button's label on the current device, for action hints. */
  keyLabel = 'E';
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
    this.list.onSelect = (index) => this.showDetail(this.entries[index]);
    this.close();
  }

  open(title: string, entries: MenuEntry[], emptyText = ''): void {
    this.title.textContent = title;
    this.empty.textContent = entries.length === 0 ? emptyText : '';
    this.refresh(entries, 0);
    setVisible(this.screen, true);
  }

  /** Replaces the entries and keeps the selection, for settings whose values change in place. */
  refresh(entries: MenuEntry[], selected = this.list.selected): void {
    this.entries = entries;
    this.list.set(entries, selected);
  }

  close(): void {
    setVisible(this.screen, false);
  }

  private showDetail(entry: MenuEntry | undefined): void {
    this.detail.replaceChildren();
    if (!entry) return;
    el('div', '', this.detail).textContent = entry.detail ?? '';
    if (entry.action) {
      const hint = el('div', 'ui-action', this.detail);
      el('span', 'ui-key', hint).textContent = this.keyLabel;
      hint.append(entry.action);
    }
  }
}
