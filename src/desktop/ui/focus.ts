import type { Input } from '../../engine/input/input';
import { stepFocus, type Direction, type ItemBox, type PaneView } from './focusStep';
import type { ScrollPane } from './scrollPane';

/** What the focus can reach on screen right now, such as the links of a page or the entries of a menu. */
export interface FocusScope {
  /** Focusable elements in reading order. */
  items: Element[];
  /** The scrolling area some of the items sit in. Up and down scroll it when no item is near. */
  pane?: ScrollPane | null;
  /** Focused when the scope comes up. Default: none in a pane, else the first item. */
  initial?: Element | null;
}

const directions: Direction[] = ['up', 'down', 'left', 'right'];
const REPEAT_DELAY = 0.38;
const REPEAT_EVERY = 0.09;

/**
 * The keyboard and gamepad focus: one highlighted element that interact presses. The direction
 * actions move it, and repeat while held.
 */
export class Focus {
  current: Element | null = null;
  private held: Direction | null = null;
  private wait = 0;

  /** Keeps the focus inside `scope` and moves it. Returns true when a direction was used. */
  update(dt: number, input: Input, scope: FocusScope): boolean {
    this.keepInside(scope);
    const pressed = directions.find((direction) => input.pressed(direction));
    if (pressed) {
      this.held = pressed;
      this.wait = REPEAT_DELAY;
      this.step(pressed, scope);
      return true;
    }
    if (!this.held || !input.isDown(this.held)) {
      this.held = null;
      return false;
    }
    this.wait -= dt;
    if (this.wait > 0) return false;
    this.wait += REPEAT_EVERY;
    this.step(this.held, scope);
    return true;
  }

  set(element: Element | null): void {
    if (element === this.current) return;
    this.current?.classList.remove('focus');
    element?.classList.add('focus');
    this.current = element;
  }

  /** Drops a focus the player can no longer see, such as a link scrolled away or a closed menu's entry. */
  private keepInside(scope: FocusScope): void {
    const { current } = this;
    const pane = scope.pane ?? null;
    if (!current || !scope.items.includes(current)) {
      this.set(scope.initial !== undefined ? scope.initial : pane ? null : (scope.items[0] ?? null));
      return;
    }
    const box = boxOf(current, pane);
    const top = pane?.destination ?? 0;
    if (pane && !box.fixed && (box.bottom <= top || box.top >= top + pane.view.clientHeight)) this.set(null);
  }

  private step(direction: Direction, scope: FocusScope): void {
    const pane = scope.pane ?? null;
    const index = this.current ? scope.items.indexOf(this.current) : -1;
    const view: PaneView | null = pane && { top: pane.destination, height: pane.view.clientHeight, max: pane.maxTop };
    const step = stepFocus(
      scope.items.map((item) => boxOf(item, pane)),
      index < 0 ? null : index,
      direction,
      view,
    );
    this.set(step.focus === null ? null : scope.items[step.focus]!);
    if (pane && step.top !== pane.destination) pane.glideTo(step.top);
  }
}

/** An item's place in the pane's content, in unscaled screen pixels. */
function boxOf(item: Element, pane: ScrollPane | null): ItemBox {
  if (!pane?.content.contains(item)) return { top: 0, bottom: 0, fixed: true };
  const scale = pane.view.getBoundingClientRect().height / (pane.view.clientHeight || 1);
  const content = pane.content.getBoundingClientRect();
  const rect = item.getBoundingClientRect();
  return { top: (rect.top - content.top) / scale, bottom: (rect.bottom - content.top) / scale, fixed: false };
}
