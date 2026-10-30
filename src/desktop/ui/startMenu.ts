import { h } from '../dom';
import { icon, type IconName } from '../gfx/icons';

export type MenuEntry = { label: string; icon?: IconName; run?: () => void; off?: boolean } | 'separator';

/** A pop-up list of commands, such as the Start menu or Navigator's bookmarks. */
export class PopupMenu {
  readonly element = h('div', 'pc-menu raised');
  /** The button that opens this menu; pressing it again shouldn't count as clicking outside. */
  owner: Element | null = null;
  private readonly items = h('div', 'pc-menu-items');

  constructor(band: boolean) {
    if (band) this.element.append(h('div', 'pc-menu-band'));
    this.element.append(this.items);
    this.element.style.display = 'none';
  }

  get isOpen(): boolean {
    return this.element.style.display !== 'none';
  }

  open(entries: MenuEntry[], at: { left?: number; top?: number; bottom?: number }): void {
    this.items.replaceChildren(...entries.map((entry) => this.item(entry)));
    Object.assign(this.element.style, {
      display: 'flex',
      left: `${at.left ?? 0}px`,
      top: at.top === undefined ? '' : `${at.top}px`,
      bottom: at.bottom === undefined ? '' : `${at.bottom}px`,
    });
  }

  close(): void {
    this.element.style.display = 'none';
  }

  private item(entry: MenuEntry): HTMLElement {
    if (entry === 'separator') return h('div', 'pc-menu-sep');
    return h(
      'div',
      {
        class: `pc-menu-item${entry.off ? ' off' : ''}`,
        onClick: (event) => {
          event.stopPropagation();
          if (entry.off) return;
          this.close();
          entry.run?.();
        },
      },
      entry.icon ? icon(entry.icon) : h('span', 'gap'),
      entry.label,
    );
  }
}
