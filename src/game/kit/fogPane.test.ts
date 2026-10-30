import { describe, expect, it } from 'vitest';
import { fogPanePixels, PANE_SIZE, skyline } from './fogPane';

const luma = (pixels: Uint8Array, x: number, y: number) => {
  const i = (y * PANE_SIZE + x) * 4;
  return pixels[i]! + pixels[i + 1]! + pixels[i + 2]!;
};

describe('fogPanePixels', () => {
  const day = fogPanePixels({ night: false });

  it('is lighter toward the top', () => {
    expect(luma(day, 16, PANE_SIZE - 1)).toBeGreaterThan(luma(day, 16, PANE_SIZE / 2));
  });

  it('stays below the day fog outside', () => {
    const brightest = Math.max(...Array.from({ length: PANE_SIZE }, (_, x) => luma(day, x, PANE_SIZE - 1)));
    expect(brightest).toBeLessThan(0x9c + 0x9e + 0x9a);
  });

  it('shows a darker skyline in the lower third only', () => {
    expect(luma(day, 7, 4)).toBeLessThan(luma(day, 7, 14));
    expect(Math.max(...Array.from({ length: PANE_SIZE }, (_, x) => skyline(x)))).toBeLessThan(PANE_SIZE / 3 + 2);
  });

  it('puts a lamp haze on the glass only at night with a lamp', () => {
    const dark = fogPanePixels({ night: true });
    const lamp = fogPanePixels({ night: true, lamp: true });
    expect(luma(lamp, 22, 20)).toBeGreaterThan(luma(dark, 22, 20));
    expect(luma(lamp, 2, 30)).toBe(luma(dark, 2, 30));
  });
});
