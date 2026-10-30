import type { SoundHandle } from '../../engine/audio/audioManager';
import { playTune } from '../audio/midi';
import type { Computer } from '../computer';
import { h, wait } from '../dom';
import { globe } from '../gfx/icons';
import { gridCanvas } from '../gfx/pixels';
import type { Bookmark } from '../setup';
import type { FocusScope } from '../ui/focus';
import { LINE } from '../ui/focusStep';
import { ScrollPane } from '../ui/scrollPane';
import { PopupMenu, type MenuEntry } from '../ui/startMenu';
import type { AppWindow } from '../ui/window';
import type { LoadEnv, Page, PageEnv } from '../web/page';
import { normalize, Web } from '../web/router';
import { mountWidgets, type Widget } from '../web/widgets';
import '../web/web.css';

const toolIcons: Record<string, string[]> = {
  Back: ['....k.....', '...kk.....', '..kek.....', '.keekkkkkk', 'keeeeeeeek', '.keekkkkkk', '..kek.....', '...kk.....', '....k.....'],
  Forward: ['.....k....', '.....kk...', '.....kek..', 'kkkkkkeek.', 'keeeeeeeek', 'kkkkkkeek.', '.....kek..', '.....kk...', '.....k....'],
  Reload: ['...kkkk...', '..k....kkk', '.k......kk', 'k.......kk', 'k.........', 'k.........', 'k........k', '.k......k.', '..k....k..', '...kkkk...'],
  Home: ['....kk....', '...krrk...', '..krrrrk..', '.krrrrrrk.', 'kkkkkkkkkk', '.kbbbbbbk.', '.kbkkbbbk.', '.kbkkbbbk.', '.kbkkbbbk.', '.kkkkkkkk.'],
  Stop: ['..kkkkkk..', '.krrrrrrk.', 'krrrrrrrrk', 'krwwwwwwrk', 'krwwwwwwrk', 'krrrrrrrrk', 'krrrrrrrrk', '.krrrrrrk.', '..kkkkkk..'],
};

const DEFAULT_BACKGROUND = '#c0c0c0';

const clamp = (value: number, low: number, high: number) => Math.min(high, Math.max(low, value));

/**
 * Navigator 4.0, maximized, with one slim toolbar so the page gets most of the screen. Pages
 * arrive the way they did over a modem: text first, then each picture.
 */
export class BrowserApp {
  readonly bookmarks = new PopupMenu(false);
  loading = false;
  private win: AppWindow | null = null;
  private readonly web: Web;
  private readonly pane = new ScrollPane();
  private readonly location = h('span', 'field nav-location');
  private readonly status = h('span', { style: 'flex:1;overflow:hidden;white-space:nowrap' }, 'Document: Done.');
  private readonly progress = h('span', { style: 'display:block;height:100%;width:0;background:#22356f' });
  private readonly throbber = h('span', 'sunken nav-throbber');
  private readonly toolbar = h('div', 'nav-bar');
  private readonly buttons: Record<string, HTMLElement> = {};
  private readonly history: string[] = [];
  private index = -1;
  private readonly visited = new Set<string>();
  private readonly cached = new Set<string>();
  private widgets: Widget[] = [];
  private page: Page | null = null;
  /** Keys of the page's `data-seen` elements that have been on screen this visit. */
  private readonly seen = new Set<string>();
  private abort: AbortController | null = null;
  private music: SoundHandle | null = null;
  private spin = 0;

  constructor(private readonly pc: Computer) {
    this.web = new Web(pc.stage);
    this.pane.content.addEventListener('click', (event) => this.onPageClick(event));
    this.pane.onScroll = () => this.checkSeen();
    this.drawThrobber();
  }

  /** Opens Navigator, at `url` or, the first time, at the start page. */
  open(url?: string): void {
    const first = !this.win;
    this.win ??= this.build();
    this.pc.windows.open(this.win);
    if (first || url) void this.navigate(url ?? this.pc.setup.startUrl);
  }

  update(dt: number): void {
    this.widgets.forEach((widget) => widget.tick?.(dt));
    if (!this.loading) return;
    this.spin += dt * 4;
    this.drawThrobber();
  }

  /** Stops the transfer and the page's music. */
  stopAll(): void {
    this.abort?.abort(new DOMException('Stopped', 'AbortError'));
    this.music?.stop();
    this.music = null;
  }

  private build(): AppWindow {
    const win = this.pc.windows.create({
      title: 'Navigator',
      icon: 'browser',
      at: 'max',
      back: () => this.goBack(),
      focus: () => this.focusScope(),
      onClose: () => {
        this.stopAll();
        this.win = null;
      },
    });
    const tool = (label: string, run: () => void) => {
      const icon = gridCanvas(toolIcons[label]!);
      icon.className = 'px';
      icon.style.cssText = 'width:20px;height:18px';
      const button = h('div', { class: 'btn nav-tool', attrs: { title: label }, onClick: run }, icon);
      this.buttons[label] = button;
      return button;
    };
    const bookmarksButton = h('div', { class: 'btn nav-tool', onClick: () => this.toggleBookmarks(bookmarksButton) }, 'Bookmarks');
    this.bookmarks.owner = bookmarksButton;
    this.toolbar.append(
      tool('Back', () => this.goBack()),
      tool('Forward', () => this.goForward()),
      tool('Reload', () => this.reload()),
      tool('Home', () => void this.navigate(this.pc.setup.homeUrl)),
      tool('Stop', () => this.stop()),
      bookmarksButton,
      this.location,
      this.throbber,
    );
    win.body.append(
      this.toolbar,
      h('div', { class: 'sunken', style: 'flex:1;min-height:0;display:flex;padding:2px' }, this.pane.element),
      h(
        'div',
        'nav-status',
        h('div', { class: 'sunken', style: 'flex:1;display:flex;padding:0 6px;min-width:0' }, this.status),
        h('div', { class: 'sunken', style: 'width:110px;padding:3px' }, this.progress),
      ),
    );
    this.refreshButtons();
    return win;
  }

  /** The toolbar, then the page's links once its text has arrived. */
  private focusScope(): FocusScope {
    const arrived = !this.pane.content.style.clipPath;
    const links = arrived ? [...this.pane.content.querySelectorAll('a[href], input[type="submit"]')] : [];
    return { items: [...this.toolbar.querySelectorAll('.btn:not(.off)'), ...links], pane: this.pane, initial: null };
  }

  private toggleBookmarks(button: HTMLElement): void {
    if (this.bookmarks.isOpen) return this.bookmarks.close();
    const root = this.pc.root.getBoundingClientRect();
    const rect = button.getBoundingClientRect();
    const scale = root.width / 640;
    const entry = (bookmark: Bookmark, indent = ''): MenuEntry[] =>
      'url' in bookmark
        ? [{ label: `${indent}${bookmark.label}`, icon: 'browser', run: () => void this.navigate(bookmark.url) }]
        : [{ label: bookmark.folder, icon: 'text', off: true }, ...bookmark.items.flatMap((item) => entry(item, '\u00a0\u00a0\u00a0'))];
    this.bookmarks.open(this.pc.setup.bookmarks.flatMap((b) => entry(b)), {
      left: (rect.left - root.left) / scale,
      top: (rect.bottom - root.top) / scale,
    });
  }

  private goBack(): boolean {
    if (this.index <= 0) return false;
    this.index--;
    void this.navigate(this.history[this.index]!, false);
    return true;
  }

  private goForward(): void {
    if (this.index >= this.history.length - 1) return;
    this.index++;
    void this.navigate(this.history[this.index]!, false);
  }

  private reload(): void {
    const url = this.history[this.index];
    if (!url) return;
    this.cached.delete(url);
    void this.navigate(url, false);
  }

  private stop(): void {
    if (this.loading) this.setStatus('Transfer interrupted!');
    this.stopAll();
  }

  private onPageClick(event: MouseEvent): void {
    const target = event.target as Element;
    const link = target.closest('a[href]');
    const submit = target.closest('input[type="submit"]');
    if (link) {
      event.preventDefault();
      this.follow(link.getAttribute('href')!);
    } else if (submit) {
      const action = submit.closest('form')?.getAttribute('action');
      if (action) this.follow(action);
    }
  }

  private follow(href: string): void {
    if (href.startsWith('#')) return this.scrollToAnchor(href.slice(1));
    if (href.startsWith('mailto:')) return void this.pc.message('Courrier', 'No outgoing mail server is set up.');
    const current = this.history[this.index] ?? this.pc.setup.homeUrl;
    void this.navigate(new URL(href, current).href);
  }

  private scrollToAnchor(name: string): void {
    const anchor = this.pane.content.querySelector(`[name="${name}"], #${CSS.escape(name)}`);
    if (anchor instanceof HTMLElement) this.pane.scrollTo(anchor.offsetTop - 4);
  }

  /** Loads a page the slow way. `push` adds it to the history, as a click does but Back doesn't. */
  private async navigate(url: string, push = true): Promise<void> {
    this.stopAll();
    const abort = new AbortController();
    this.abort = abort;
    const signal = abort.signal;
    const lookup = this.web.find(url);
    const host = URL.canParse(url) ? new URL(url).host : url;
    const target = lookup.kind === 'page' ? lookup.url : normalize(url);
    const cached = this.cached.has(target);
    const slow = this.pc.setup.speed === '33,600' ? 1 : 1.17;
    this.loading = true;
    this.refreshButtons();
    this.setProgress(0);

    try {
      if (!cached) {
        this.setStatus(`Contacting host: ${host}...`);
        await wait(600 + Math.random() * 600, signal);
      }
      if (lookup.kind === 'no-response') {
        await wait(2600, signal);
        this.finish('Document: Done.');
        await this.pc.message('Navigator', 'Server not responding.\n\nThe server may be down or busy. Try again later.');
        return;
      }
      if (!cached) {
        this.setStatus('Host contacted. Waiting for reply...');
        await wait(400 + Math.random() * 500, signal);
      }
      if (push) {
        this.history.splice(this.index + 1);
        this.history.push(target);
        this.index = this.history.length - 1;
      }
      this.visited.add(target);
      this.location.textContent = target;
      this.show(lookup.page);
      const anchor = URL.canParse(url) ? new URL(url).hash.slice(1) : '';
      if (anchor) this.scrollToAnchor(anchor);
      await this.arrive(lookup.page, cached ? 0 : slow, signal);
      this.cached.add(target);
      this.finish('Document: Done.');
    } catch (error) {
      if (!(error instanceof DOMException && error.name === 'AbortError')) throw error;
      if (this.abort === abort) this.finish('Transfer interrupted!');
    }
  }

  private show(page: Page): void {
    const env = this.env();
    const content = h('div', 'web');
    content.innerHTML = page.html(env);
    const colors = page.colors ?? {};
    content.style.cssText = [colors.text && `--text:${colors.text}`, colors.link && `--link:${colors.link}`, colors.visited && `--vlink:${colors.visited}`]
      .filter(Boolean)
      .join(';');
    content.querySelectorAll('a[href]').forEach((link) => {
      const href = link.getAttribute('href')!;
      if (!href.startsWith('#') && !href.startsWith('mailto:') && this.visited.has(normalize(new URL(href, this.history[this.index]).href))) link.classList.add('visited');
    });
    this.widgets = mountWidgets(content);
    this.page = page;
    this.seen.clear();
    this.pane.content.replaceChildren(content);
    this.pane.content.style.clipPath = 'inset(0 0 100% 0)';
    this.pane.view.style.background = DEFAULT_BACKGROUND;
    this.pane.scrollTo(0);
    if (this.win) this.win.title = `Navigator - ${page.title}`;
  }

  /** Text drops in from the top, then the background, then each picture in turn. */
  private async arrive(page: Page, slow: number, signal: AbortSignal): Promise<void> {
    const content = this.pane.content;
    const height = content.scrollHeight;
    const seconds = clamp(page.size * 0.12, 0.6, 2.8) * slow;
    const steps = slow ? Math.ceil(height / 18) : 1;
    for (let i = 1; i <= steps; i++) {
      content.style.clipPath = `inset(0 0 ${Math.max(0, height - (i * height) / steps)}px 0)`;
      this.setStatus(`Document: Received ${Math.ceil((i / steps) * page.size)} of ${page.size}K`);
      this.setProgress((i / steps) * 0.5);
      if (slow) await wait((seconds * 1000) / steps, signal);
    }
    content.style.clipPath = '';
    const background = typeof page.background === 'function' ? page.background() : page.background;
    // Like a BODY background: it fills the window and scrolls with the page.
    this.pane.view.style.background = background ?? DEFAULT_BACKGROUND;
    this.pane.view.style.backgroundAttachment = 'local';
    page.onLoad?.(this.loadEnv());
    this.checkSeen();

    const pictures = this.widgets.filter((widget) => widget.arrive);
    for (const [i, widget] of pictures.entries()) {
      this.setStatus(`Transferring data from ${new URL(this.history[this.index]!).host}...`);
      this.setProgress(0.5 + ((i + 1) / pictures.length) * 0.5);
      const box = widget.element.getBoundingClientRect();
      const scale = this.pc.root.getBoundingClientRect().width / 640;
      const area = (box.width / scale) * (box.height / scale);
      await widget.arrive!(slow ? clamp(0.5 + area / 30000, 0.6, 3) * slow : 0, signal);
    }
  }

  /** Tells the page which of its `data-seen` elements have come on screen. */
  private checkSeen(): void {
    const page = this.page;
    if (!page?.onSeen || this.pane.content.style.clipPath) return;
    const view = this.pane.view.getBoundingClientRect();
    const scale = view.height / (this.pane.view.clientHeight || 1);
    this.pane.content.querySelectorAll<HTMLElement>('[data-seen]').forEach((element) => {
      const key = element.dataset.seen!;
      const rect = element.getBoundingClientRect();
      const shown = Math.min(rect.bottom, view.bottom) - Math.max(rect.top, view.top);
      if (this.seen.has(key) || shown < Math.min(rect.height, 2 * LINE * scale) - 1) return;
      this.seen.add(key);
      page.onSeen!(key, this.loadEnv());
    });
  }

  private env(): PageEnv {
    return { state: this.pc.state, stage: this.pc.stage, time: this.pc.clock.text };
  }

  private loadEnv(): LoadEnv {
    return {
      ...this.env(),
      read: (flag) => this.pc.read(flag),
      setFlag: (flag) => this.pc.state.setFlag(flag),
      playMusic: () => {
        this.music?.stop();
        this.music = playTune(this.pc.audio);
      },
      postRead: (id) => this.pc.onPostRead(id),
    };
  }

  private finish(status: string): void {
    this.loading = false;
    this.abort = null;
    this.setStatus(status);
    this.setProgress(0);
    this.refreshButtons();
    this.drawThrobber();
  }

  private setStatus(text: string): void {
    this.status.textContent = text;
  }

  private setProgress(fraction: number): void {
    this.progress.style.width = `${Math.round(fraction * 100)}%`;
  }

  private refreshButtons(): void {
    const off = (label: string, disabled: boolean) => this.buttons[label]?.classList.toggle('off', disabled);
    off('Back', this.index <= 0);
    off('Forward', this.index >= this.history.length - 1);
    off('Stop', !this.loading);
  }

  private drawThrobber(): void {
    const picture = globe(28, this.loading ? this.spin : 0.6);
    picture.className = 'px';
    this.throbber.replaceChildren(picture);
  }
}
