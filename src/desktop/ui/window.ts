import { h } from '../dom';
import { icon, type IconName } from '../gfx/icons';
import { gridCanvas } from '../gfx/pixels';

const minimizeGlyph = ['......', '......', '......', '......', '......', 'kkkkkk', 'kkkkkk'];
export const closeGlyph = ['kk....kk', '.kk..kk.', '..kkkk..', '...kk...', '..kkkk..', '.kk..kk.', 'kk....kk'];

/** A title-bar button with a pixel glyph. */
export function titleButton(glyph: string[], onClick: () => void): HTMLElement {
  const picture = gridCanvas(glyph);
  picture.className = 'px';
  return h('div', { class: 'btn win-ctrl', onClick }, picture);
}

export interface WindowOptions {
  title: string;
  icon: IconName;
  x: number;
  y: number;
  w: number;
  h: number;
  /** Menu bar labels. Period set dressing; they open nothing. */
  menu?: string[];
  /** Runs when the window closes, from its close button or from Back. */
  onClose?: () => void;
  /** Handles the Back button before it closes the window. Returns true when it did something. */
  back?: () => boolean;
}

/** A window frame: title bar with minimize and close, an optional menu bar, and a body. */
export class AppWindow {
  readonly element: HTMLDivElement;
  readonly body: HTMLDivElement;
  readonly icon: IconName;
  private readonly titleText: HTMLElement;
  private titleValue: string;

  constructor(
    private readonly options: WindowOptions,
    actions: { minimize: (win: AppWindow) => void; close: (win: AppWindow) => void },
  ) {
    this.icon = options.icon;
    this.titleValue = options.title;
    this.titleText = h('span', 'win-title-text', options.title);
    this.body = h('div', 'win-body');
    this.element = h(
      'div',
      { class: 'win raised', style: `left:${options.x}px;top:${options.y}px;width:${options.w}px;height:${options.h}px` },
      h(
        'div',
        'win-title',
        icon(options.icon),
        this.titleText,
        titleButton(minimizeGlyph, () => actions.minimize(this)),
        titleButton(closeGlyph, () => actions.close(this)),
      ),
      options.menu && h('div', 'win-menu', options.menu.map((label) => h('span', null, label))),
      this.body,
    );
  }

  get title(): string {
    return this.titleValue;
  }

  set title(text: string) {
    this.titleValue = text;
    this.titleText.textContent = text;
  }

  closed(): void {
    this.options.onClose?.();
  }

  back(): boolean {
    return this.options.back?.() ?? false;
  }
}

/** Stacks windows, tracks the active one, and tells the taskbar when anything changes. */
export class WindowManager {
  readonly element = h('div', 'pc-windows');
  onChange: () => void = () => undefined;
  /** Front to back is last to first. */
  private readonly stack: AppWindow[] = [];
  /** Opening order, for the taskbar. */
  private readonly order: AppWindow[] = [];
  private readonly minimized = new Set<AppWindow>();

  readonly actions = {
    minimize: (win: AppWindow) => this.minimize(win),
    close: (win: AppWindow) => this.close(win),
  };

  create(options: WindowOptions): AppWindow {
    return new AppWindow(options, this.actions);
  }

  /** Opens a window or, if it is open already, restores it and brings it to the front. */
  open(win: AppWindow): void {
    if (!this.order.includes(win)) this.order.push(win);
    this.focus(win);
  }

  focus(win: AppWindow): void {
    this.minimized.delete(win);
    win.element.classList.remove('hidden');
    this.remove(win);
    this.stack.push(win);
    this.element.appendChild(win.element);
    this.refresh();
  }

  minimize(win: AppWindow): void {
    this.minimized.add(win);
    win.element.classList.add('hidden');
    this.refresh();
  }

  close(win: AppWindow): void {
    if (!this.stack.includes(win)) return;
    this.remove(win);
    this.order.splice(this.order.indexOf(win), 1);
    this.minimized.delete(win);
    win.element.remove();
    win.closed();
    this.refresh();
  }

  isOpen(win: AppWindow): boolean {
    return this.stack.includes(win);
  }

  get windows(): readonly AppWindow[] {
    return this.order;
  }

  /** The front window that isn't minimized. */
  get active(): AppWindow | null {
    return [...this.stack].reverse().find((win) => !this.minimized.has(win)) ?? null;
  }

  windowOf(element: Element): AppWindow | null {
    const frame = element.closest('.win');
    return this.stack.find((win) => win.element === frame) ?? null;
  }

  private remove(win: AppWindow): void {
    const index = this.stack.indexOf(win);
    if (index >= 0) this.stack.splice(index, 1);
  }

  private refresh(): void {
    this.stack.forEach((win) => win.element.classList.toggle('active', win === this.active));
    this.onChange();
  }
}
