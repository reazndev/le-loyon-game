import { h } from '../dom';
import { gridCanvas } from '../gfx/pixels';

const arrowUp = ['...k...', '..kkk..', '.kkkkk.', 'kkkkkkk'];
const arrowDown = [...arrowUp].reverse();

const LINE = 18;
const REPEAT_DELAY = 350;
const REPEAT_EVERY = 45;

const panes = new WeakMap<Element, ScrollPane>();

/** The scroll pane under an element, if any. */
export function paneAt(element: Element | null): ScrollPane | null {
  for (let node = element; node; node = node.parentElement) {
    const pane = panes.get(node);
    if (pane) return pane;
  }
  return null;
}

/**
 * A scrolling area with a drawn scroll bar, so the virtual cursor can press its arrows and
 * track like any other button.
 */
export class ScrollPane {
  readonly element: HTMLDivElement;
  readonly view: HTMLDivElement;
  readonly content: HTMLDivElement;
  onScroll: () => void = () => undefined;
  private readonly bar: HTMLDivElement;
  private readonly track: HTMLDivElement;
  private readonly thumb: HTMLDivElement;

  constructor(contentClass = '') {
    this.content = h('div', contentClass);
    this.view = h('div', 'scroll-view', this.content);
    this.thumb = h('div', 'scroll-thumb raised');
    this.track = h('div', { class: 'scroll-track', onMouseDown: (event) => this.page(event) }, this.thumb);
    this.bar = h(
      'div',
      'scroll-bar',
      this.arrow(arrowUp, -LINE),
      this.track,
      this.arrow(arrowDown, LINE),
    );
    this.element = h('div', 'scroll', this.view, this.bar);
    panes.set(this.element, this);
    new ResizeObserver(() => this.refresh()).observe(this.content);
    new ResizeObserver(() => this.refresh()).observe(this.view);
  }

  get scrollTop(): number {
    return this.view.scrollTop;
  }

  get atEnd(): boolean {
    return this.view.scrollTop + this.view.clientHeight >= this.view.scrollHeight - 2;
  }

  scrollBy(dy: number): void {
    this.scrollTo(this.view.scrollTop + dy);
  }

  scrollTo(y: number): void {
    const before = this.view.scrollTop;
    this.view.scrollTop = Math.round(y);
    if (this.view.scrollTop !== before) {
      this.refresh();
      this.onScroll();
    }
  }

  refresh(): void {
    const { scrollHeight, clientHeight, scrollTop } = this.view;
    const room = this.track.clientHeight;
    const idle = scrollHeight <= clientHeight + 1;
    this.bar.classList.toggle('idle', idle);
    if (idle || room <= 0) return;
    const size = Math.max(14, Math.round((clientHeight / scrollHeight) * room));
    const top = Math.round((scrollTop / (scrollHeight - clientHeight)) * (room - size));
    this.thumb.style.top = `${top}px`;
    this.thumb.style.height = `${size}px`;
  }

  private arrow(rows: string[], step: number): HTMLElement {
    return h('div', { class: 'btn scroll-arrow', onMouseDown: () => this.repeat(() => this.scrollBy(step)) }, gridCanvas(rows));
  }

  private page(event: MouseEvent): void {
    if (event.target !== this.track) return;
    const below = event.clientY > this.thumb.getBoundingClientRect().top;
    this.repeat(() => this.scrollBy((below ? 1 : -1) * (this.view.clientHeight - LINE)));
  }

  /** Runs `step` now and keeps running it while the button stays held. */
  private repeat(step: () => void): void {
    step();
    let timer = setTimeout(function again() {
      step();
      timer = setTimeout(again, REPEAT_EVERY);
    }, REPEAT_DELAY);
    window.addEventListener('mouseup', () => clearTimeout(timer), { once: true });
  }
}
