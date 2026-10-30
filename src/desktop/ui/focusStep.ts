/** Where a focusable item sits: its top and bottom in the content of a scroll pane, or `fixed` outside it, such as a toolbar button. */
export interface ItemBox {
  top: number;
  bottom: number;
  fixed: boolean;
}

/** The visible part of a scroll pane: scroll position, height, and the largest scroll position. */
export interface PaneView {
  top: number;
  height: number;
  max: number;
}

export type Direction = 'up' | 'down' | 'left' | 'right';

/** The item to focus, or null for none, and where the pane should scroll to. */
export interface Step {
  focus: number | null;
  top: number;
}

/** One line of page text, kept visible around a focused link so it has context. */
export const LINE = 18;

/**
 * Moves the focus one step, the way a 1998 browser did with the keyboard. Without a pane, up and
 * left go to the previous item and down and right to the next, wrapping around. With a pane,
 * up and down go to the previous or next link when it is near, and scroll the page by most of a
 * screen when it isn't, so no text is skipped. Left and right always scroll by a screen.
 */
export function stepFocus(items: ItemBox[], current: number | null, direction: Direction, view: PaneView | null): Step {
  if (!view) return stepList(items.length, current, direction);
  const page = Math.max(LINE, view.height - 3 * LINE);
  const clamp = (top: number) => Math.min(view.max, Math.max(0, Math.round(top)));
  const visible = (index: number | null, top: number) => {
    const item = index === null ? null : items[index]!;
    return !!item && (item.fixed || (item.bottom > top && item.top < top + view.height));
  };
  const scroll = (top: number): Step => ({ focus: visible(current, top) ? current : null, top });
  const reveal = (index: number): Step => {
    const item = items[index]!;
    if (item.fixed) return { focus: index, top: view.top };
    if (item.top < view.top) return { focus: index, top: clamp(item.top - LINE) };
    if (item.bottom > view.top + view.height) return { focus: index, top: clamp(item.bottom + LINE - view.height) };
    return { focus: index, top: view.top };
  };

  if (direction === 'left') return scroll(clamp(view.top - page));
  if (direction === 'right') return scroll(clamp(view.top + page));

  const bottom = view.top + view.height;
  if (direction === 'down') {
    const next = items.findIndex((item, i) =>
      current === null ? !item.fixed && item.bottom > view.top : i > current && (item.fixed || item.bottom > view.top),
    );
    if (next < 0) return scroll(clamp(view.top + page));
    const item = items[next]!;
    if (!item.fixed && item.top >= bottom + view.height / 2) return scroll(clamp(view.top + page));
    return reveal(next);
  }

  const from = current ?? items.length;
  const previous = items.map((item, i) => i < from && (item.fixed || item.top < bottom)).lastIndexOf(true);
  if (previous < 0) return scroll(clamp(view.top - page));
  const item = items[previous]!;
  const fromPage = current === null || !items[current]!.fixed;
  // A toolbar above the page is only reached from the top of the page.
  if (item.fixed && fromPage && view.top > 0) return scroll(clamp(view.top - page));
  if (!item.fixed && item.bottom <= view.top - view.height / 2) return scroll(clamp(view.top - page));
  return reveal(previous);
}

function stepList(count: number, current: number | null, direction: Direction): Step {
  if (count === 0) return { focus: null, top: 0 };
  const back = direction === 'up' || direction === 'left';
  if (current === null) return { focus: back ? count - 1 : 0, top: 0 };
  return { focus: (current + (back ? count - 1 : 1)) % count, top: 0 };
}
