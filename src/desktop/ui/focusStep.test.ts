import { describe, expect, it } from 'vitest';
import { LINE, stepFocus, type ItemBox } from './focusStep';

const link = (top: number): ItemBox => ({ top, bottom: top + LINE, fixed: false });
const tool: ItemBox = { top: 0, bottom: 0, fixed: true };
const view = (top: number) => ({ top, height: 360, max: 2000 });
const PAGE = 360 - 3 * LINE;

describe('stepFocus without a pane', () => {
  it('moves through the list and wraps around', () => {
    const items = [tool, tool, tool];
    expect(stepFocus(items, 2, 'down', null).focus).toBe(0);
    expect(stepFocus(items, 0, 'up', null).focus).toBe(2);
    expect(stepFocus(items, 1, 'right', null).focus).toBe(2);
    expect(stepFocus(items, null, 'down', null).focus).toBe(0);
  });
});

describe('stepFocus in a page', () => {
  it('focuses the first link on screen, then the next one', () => {
    const items = [tool, link(40), link(100)];
    expect(stepFocus(items, null, 'down', view(0))).toEqual({ focus: 1, top: 0 });
    expect(stepFocus(items, 1, 'down', view(0))).toEqual({ focus: 2, top: 0 });
  });

  it('scrolls a near link into view with a line of context', () => {
    const items = [link(40), link(420)];
    expect(stepFocus(items, 0, 'down', view(0))).toEqual({ focus: 1, top: 420 + 2 * LINE - 360 });
  });

  it('scrolls by most of a screen when the next link is far, so no text is skipped', () => {
    const items = [link(40), link(1200)];
    expect(stepFocus(items, 0, 'down', view(0))).toEqual({ focus: null, top: PAGE });
  });

  it('scrolls when there are no links', () => {
    expect(stepFocus([], null, 'down', view(100))).toEqual({ focus: null, top: 100 + PAGE });
    expect(stepFocus([], null, 'up', view(100))).toEqual({ focus: null, top: 0 });
  });

  it('keeps the focused link while it stays on screen', () => {
    expect(stepFocus([link(100)], 0, 'right', view(0))).toEqual({ focus: null, top: PAGE });
    expect(stepFocus([link(560)], 0, 'right', view(200))).toEqual({ focus: 0, top: 200 + PAGE });
  });

  it('goes back to the previous link', () => {
    const items = [link(40), link(100)];
    expect(stepFocus(items, 1, 'up', view(0))).toEqual({ focus: 0, top: 0 });
  });

  it('reaches the toolbar only from the top of the page', () => {
    const items = [tool, tool, link(500)];
    expect(stepFocus(items, 2, 'up', view(300))).toEqual({ focus: null, top: 0 });
    expect(stepFocus(items, null, 'up', view(0))).toEqual({ focus: 1, top: 0 });
    expect(stepFocus(items, 1, 'up', view(300)).focus).toBe(0);
  });

  it('walks a list outside the pane and scrolls the pane past its end', () => {
    const rows = [tool, tool];
    expect(stepFocus(rows, 0, 'down', view(0))).toEqual({ focus: 1, top: 0 });
    expect(stepFocus(rows, 1, 'down', view(0))).toEqual({ focus: 1, top: PAGE });
  });
});
