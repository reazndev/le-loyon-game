import './desktop.css';
import { dialogues } from '../content';
import { click } from '../engine/audio/generators';
import type { Input } from '../engine/input/input';
import type { ScreenHandle } from '../game/gameUi';
import type { SceneContext } from '../game/scene';
import { BrowserApp } from './apps/browser';
import { DialUpApp } from './apps/dialUp';
import { openDrives, openRecycleBin } from './apps/explorer';
import { MailApp } from './apps/mail';
import { NotesApp } from './apps/notes';
import { chime, diskSeek, mouseClick } from './audio/sounds';
import { Clock } from './clock';
import { h, wait } from './dom';
import type { ForumStage } from './forum';
import { icon, type IconName } from './gfx/icons';
import { recordRead, villageClues } from './progress';
import type { Setup } from './setup';
import { Cursor, type CursorShape } from './ui/cursor';
import { messageBox } from './ui/messageBox';
import { paneAt } from './ui/scrollPane';
import { PopupMenu, type MenuEntry } from './ui/startMenu';
import { Taskbar } from './ui/taskbar';
import { WindowManager } from './ui/window';

declare global {
  interface Window {
    /** The computer on screen most recently, for screenshots and tests in development. */
    __desktop?: Computer;
  }
}

const CURSOR_SPEED = 90;
const CURSOR_TOP_SPEED = 360;
/** Seconds of holding a direction until the cursor reaches top speed. */
const CURSOR_RAMP = 0.9;
const STICK_SCROLL = 520;

interface DesktopIcon {
  label: string;
  icon: IconName;
  open: () => void;
}

/**
 * The computer: its screen, cursor, windows, and programs. The player drives the cursor with
 * the arrow keys, the d-pad, the left stick, or the mouse; interact clicks and Back closes.
 */
export class Computer {
  readonly root: HTMLDivElement;
  readonly windows = new WindowManager();
  readonly clock: Clock;
  readonly cursor = new Cursor();
  readonly dialUp: DialUpApp;
  readonly browser: BrowserApp;
  readonly mail: MailApp | null;
  readonly notes: NotesApp | null;
  connected = false;
  /** Runs when the player picks "Pack and go". */
  onPackAndGo: () => void = () => undefined;
  /** Runs when a board post opens, with its message number. */
  onPostRead: (id: string) => void = () => undefined;
  private readonly modal = h('div', 'pc-modal-layer');
  private readonly taskbar: Taskbar;
  private readonly startMenu = new PopupMenu(true);
  private readonly menus: PopupMenu[] = [this.startMenu];
  private closeMessage: (() => void) | null = null;
  private screen: ScreenHandle | null = null;
  private standUp: (() => void) | null = null;
  private busyCount = 0;
  private holdTime = 0;
  private pressTarget: Element | null = null;
  private hovered: Element | null = null;
  private lightTimer = 0;
  private lightPhase: 0 | 1 = 0;
  private poweredOff = false;
  /** Seconds left before the screen shows after sitting down; negative once it shows. */
  private hiddenFor = -1;

  constructor(
    readonly ctx: SceneContext,
    readonly setup: Setup,
    readonly stage: ForumStage,
  ) {
    this.clock = new Clock(setup.clock);
    this.dialUp = new DialUpApp(this);
    this.browser = new BrowserApp(this);
    this.mail = setup.mode === 'home' ? new MailApp(this) : null;
    this.notes = setup.mode === 'home' ? new NotesApp(this) : null;
    this.taskbar = new Taskbar(this.windows, () => this.toggleStart());
    this.windows.onChange = () => this.taskbar.refresh();
    this.menus.push(this.browser.bookmarks);

    const desktop = h(
      'div',
      { class: 'pc-desktop', style: setup.wallpaper ? `background-image:url(${setup.wallpaper()})` : '' },
      h('div', 'pc-icons', this.icons().map((item) => this.desktopIcon(item))),
      this.windows.element,
      this.browser.bookmarks.element,
    );
    this.root = h(
      'div',
      `pc pc-${setup.mode}`,
      h('div', 'pc-tube', desktop, this.taskbar.element, this.startMenu.element, this.modal, this.cursor.element),
      h('div', 'pc-dot'),
      h('div', 'pc-crt'),
    );
    this.startMenu.owner = this.taskbar.startButton;
    this.listen();
    if (import.meta.env.DEV) window.__desktop = this;
  }

  get state() {
    return this.ctx.state;
  }

  get audio() {
    return this.ctx.audio;
  }

  /**
   * Takes the player's input and, after `delay` seconds of looking at the monitor, fills the
   * frame with the screen. Resolves when they stand up.
   */
  sit(delay = 0): Promise<void> {
    this.root.classList.remove('on');
    this.root.style.visibility = 'hidden';
    this.hiddenFor = delay;
    this.screen = this.ctx.openScreen(this.root, (dt, input) => this.update(dt, input));
    window.addEventListener('keydown', this.onKey);
    return new Promise((resolve) => (this.standUp = resolve));
  }

  stand(): void {
    window.removeEventListener('keydown', this.onKey);
    this.screen?.close();
    this.screen = null;
    this.standUp?.();
    this.standUp = null;
  }

  /** Runs `then` once online, dialing up first if needed. */
  online(then: () => void): void {
    if (this.connected) then();
    else this.dialUp.open(then);
  }

  /** Hangs up, or stops dialing, and stops every transfer and sound the programs started. */
  hangUp(): void {
    // The modem relay drops the line with a click, then silence.
    if (this.connected) click(this.audio, { volume: 0.4 });
    this.connected = false;
    this.dialUp.hangUp();
    this.browser.stopAll();
  }

  /** Records that a page was read. A clue adds a line to notes.txt; the third solves P1. */
  read(flag: string): void {
    const clue = (villageClues as readonly string[]).includes(flag) && !this.state.hasFlag(flag);
    const solved = recordRead(this.state, flag);
    if (clue) this.ctx.notify('notes.txt updated');
    if (solved) void this.ctx.dialogue(dialogues.home_ready);
  }

  message(title: string, text: string): Promise<void> {
    this.closeMessage?.();
    chime(this.audio);
    const box = messageBox(this.modal, title, text);
    this.closeMessage = box.close;
    return box.done.then(() => {
      if (this.closeMessage === box.close) this.closeMessage = null;
    });
  }

  /** Shows the hourglass while `work` runs. */
  async busy<T>(work: Promise<T>): Promise<T> {
    this.busyCount++;
    try {
      return await work;
    } finally {
      this.busyCount--;
    }
  }

  /** Opens a program with the hard disk chattering, as programs took a moment to start. */
  launch(open: () => void, seconds = 0.6): void {
    diskSeek(this.audio, seconds);
    void this.busy(wait(seconds * 1000)).then(open);
  }

  /** Disconnects and collapses the picture to a white dot. Resolves when the screen is dark. */
  async powerOff(): Promise<void> {
    this.poweredOff = true;
    this.menus.forEach((menu) => menu.close());
    this.hangUp();
    this.root.classList.add('off');
    await wait(2400);
  }

  update(dt: number, input: Input): void {
    if (this.hiddenFor >= 0) {
      this.hiddenFor -= dt;
      if (this.hiddenFor >= 0) return;
      this.root.style.visibility = '';
      this.root.classList.add('on');
    }
    this.clock.advance(dt);
    this.taskbar.setClock(this.clock.text);
    this.updateModemLight(dt);
    this.browser.update(dt);
    this.notes?.update(dt);
    if (this.poweredOff) return;

    if (input.pressed('cancel')) this.back();
    this.moveCursor(dt, input);
    if (input.pressed('interact')) this.press();
    else if (this.pressTarget && !input.isDown('interact')) this.release();
    this.scrollWithStick(dt);
    this.updateHover();
  }

  private icons(): DesktopIcon[] {
    const home = this.setup.mode === 'home';
    return [
      { label: 'My Computer', icon: 'computer', open: () => this.launch(() => openDrives(this)) },
      home && { label: 'Courrier', icon: 'mail', open: () => this.online(() => this.launch(() => this.mail?.open())) },
      { label: 'Navigator', icon: 'browser', open: () => this.online(() => this.launch(() => this.browser.open(), 1)) },
      { label: 'Helvenet Dial-Up', icon: 'dialUp', open: () => this.dialUp.open() },
      home && { label: 'notes.txt', icon: 'text', open: () => this.launch(() => this.notes?.open(), 0.3) },
      { label: 'Recycle Bin', icon: 'trash', open: () => openRecycleBin(this) },
    ].filter((item): item is DesktopIcon => Boolean(item));
  }

  private desktopIcon(item: DesktopIcon): HTMLElement {
    return h('div', { class: 'pc-icon', onClick: item.open }, icon(item.icon, 32), h('span', null, item.label));
  }

  private startEntries(): MenuEntry[] {
    const programs = this.icons().filter((item) => item.icon !== 'computer' && item.icon !== 'trash');
    const ready = this.state.hasFlag('pro_knows_village');
    const shutDown: MenuEntry =
      this.setup.mode === 'inn'
        ? { label: 'Shut Down...', run: () => this.leave() }
        : ready
          ? { label: 'Pack and go', run: () => this.onPackAndGo() }
          : { label: 'Shut Down...', run: () => void this.ctx.dialogue(dialogues.home_bag) };
    return [
      ...programs.map((item) => ({ label: item.label, icon: item.icon, run: item.open })),
      'separator',
      { label: 'Settings', off: true },
      { label: 'Find', off: true },
      { label: 'Help', off: true },
      'separator',
      shutDown,
    ];
  }

  private toggleStart(): void {
    if (this.startMenu.isOpen) this.startMenu.close();
    else this.startMenu.open(this.startEntries(), { left: 2, bottom: 26 });
  }

  /** Hangs up and stands, the way the inn computer is left. */
  private leave(): void {
    this.hangUp();
    this.stand();
  }

  /** Back closes the top thing on screen, page by page in Navigator, and stands up last. */
  private back(): void {
    const menu = this.menus.find((m) => m.isOpen);
    const active = this.windows.active;
    if (this.closeMessage) this.closeMessage();
    else if (menu) menu.close();
    else if (active) {
      if (!active.back()) this.windows.close(active);
    } else if (this.setup.mode === 'inn') this.leave();
    else this.stand();
  }

  private moveCursor(dt: number, input: Input): void {
    const { forward, turn } = input.movement();
    const amount = Math.min(1, Math.hypot(turn, forward));
    this.holdTime = amount > 0.05 ? this.holdTime + dt : 0;
    if (!this.holdTime) return;
    const ramp = Math.min(this.holdTime / CURSOR_RAMP, 1);
    const speed = (CURSOR_SPEED + (CURSOR_TOP_SPEED - CURSOR_SPEED) * ramp * ramp) * (input.isDown('fast') ? 1.8 : 1);
    this.cursor.moveTo(this.cursor.x + turn * speed * dt, this.cursor.y - forward * speed * dt);
  }

  /** The element under the cursor, the way a real pointer would hit it. */
  private target(): Element | null {
    const rect = this.root.getBoundingClientRect();
    const scale = rect.width / 640;
    return document.elementFromPoint(rect.left + (this.cursor.x + 0.5) * scale, rect.top + (this.cursor.y + 0.5) * scale);
  }

  private mouseEvent(type: string, target: Element): void {
    const rect = this.root.getBoundingClientRect();
    const scale = rect.width / 640;
    target.dispatchEvent(
      new MouseEvent(type, { bubbles: true, cancelable: true, clientX: rect.left + this.cursor.x * scale, clientY: rect.top + this.cursor.y * scale }),
    );
  }

  private press(): void {
    const target = this.target();
    if (!target || !this.root.contains(target)) return;
    this.pressTarget = target;
    this.mouseEvent('mousedown', target);
  }

  private release(): void {
    const pressed = this.pressTarget!;
    this.pressTarget = null;
    const target = this.target() ?? pressed;
    this.mouseEvent('mouseup', target);
    if (pressed.contains(target) || target.contains(pressed)) this.mouseEvent('click', pressed);
  }

  private updateHover(): void {
    const target = this.target();
    const hovered = target?.closest('.btn, .pc-menu-item, .pc-icon') ?? null;
    if (hovered !== this.hovered) {
      this.hovered?.classList.remove('hover');
      hovered?.classList.add('hover');
      this.hovered = hovered;
    }
    const shape: CursorShape = this.busyCount > 0 ? 'busy' : target?.closest('a[href]') ? 'hand' : 'arrow';
    this.cursor.render(shape);
  }

  private scrollWithStick(dt: number): void {
    const pad = navigator.getGamepads?.().find((p) => p?.connected);
    const y = pad?.axes[3] ?? 0;
    if (Math.abs(y) > 0.25) this.scrollUnderCursor(y * STICK_SCROLL * dt);
  }

  private scrollUnderCursor(dy: number): void {
    const pane = paneAt(this.target()) ?? this.browser.paneIfActive();
    pane?.scrollBy(dy);
  }

  private updateModemLight(dt: number): void {
    if (!this.connected) return this.taskbar.setModem(-1);
    this.lightTimer -= dt;
    if (this.lightTimer <= 0) {
      this.lightPhase = this.lightPhase ? 0 : 1;
      this.lightTimer = (this.browser.loading ? 0.05 : 0.4) + Math.random() * (this.browser.loading ? 0.12 : 1.2);
    }
    this.taskbar.setModem(this.lightPhase);
  }

  private readonly onKey = (event: KeyboardEvent) => {
    const pane = () => paneAt(this.target()) ?? this.browser.paneIfActive();
    if (event.code === 'PageDown') pane()?.scrollBy(260);
    if (event.code === 'PageUp') pane()?.scrollBy(-260);
  };

  private listen(): void {
    const toScreen = (event: MouseEvent) => {
      const rect = this.root.getBoundingClientRect();
      const scale = rect.width / 640;
      return { x: (event.clientX - rect.left) / scale, y: (event.clientY - rect.top) / scale };
    };
    // While a dialogue covers the screen, the real mouse can't reach the desktop under it.
    (['mousedown', 'mouseup', 'click', 'dblclick'] as const).forEach((type) =>
      this.root.addEventListener(
        type,
        (event) => {
          if (!event.isTrusted || this.screen?.onTop !== false) return;
          event.stopImmediatePropagation();
          event.preventDefault();
        },
        true,
      ),
    );
    this.root.addEventListener('mousemove', (event) => {
      if (!event.isTrusted) return;
      const { x, y } = toScreen(event);
      this.cursor.moveTo(x, y);
    });
    this.root.addEventListener(
      'mousedown',
      (event) => {
        mouseClick(this.audio);
        const target = event.target as Element;
        target.closest('.btn')?.classList.add('down');
        window.addEventListener('mouseup', () => target.closest('.btn')?.classList.remove('down'), { once: true });
        const win = this.windows.windowOf(target);
        if (win && win !== this.windows.active) this.windows.focus(win);
        this.menus
          .filter((menu) => menu.isOpen && !menu.element.contains(target) && !menu.owner?.contains(target))
          .forEach((menu) => menu.close());
      },
      true,
    );
    this.root.addEventListener(
      'wheel',
      (event) => {
        event.preventDefault();
        paneAt(event.target as Element)?.scrollBy(Math.sign(event.deltaY) * 54);
      },
      { passive: false },
    );
  }
}
