import { describe, expect, it } from 'vitest';
import { gapsByRoom, neighbors, roomAt, sharedSide, solidSpans, type Room } from './rooms';

const hall: Room = { id: 'hall', x0: -1, x1: 1, z0: -10, z1: 0, h: 2 };
const side: Room = { id: 'side', x0: 1.6, x1: 5, z0: -6, z1: -2, h: 2.4 };
const end: Room = { id: 'end', x0: -2, x1: 2, z0: -14, z1: -10.6, h: 2.4 };

describe('sharedSide', () => {
  it('finds the wall between rooms 0.6 m apart', () => {
    expect(sharedSide(hall, side)).toBe('e');
    expect(sharedSide(side, hall)).toBe('w');
    expect(sharedSide(hall, end)).toBe('n');
    expect(sharedSide(side, end)).toBeNull();
  });
});

describe('gapsByRoom', () => {
  it('cuts the same gap into both walls', () => {
    const gaps = gapsByRoom([hall, side, end], [{ a: 'hall', b: 'side', at: -4, w: 1 }]);
    expect(gaps.get('hall')).toEqual([{ side: 'e', from: -4.5, to: -3.5, h: 2 }]);
    expect(gaps.get('side')).toEqual([{ side: 'w', from: -4.5, to: -3.5, h: 2 }]);
    expect(gaps.get('end')).toEqual([]);
  });

  it('refuses rooms that do not touch', () => {
    expect(() => gapsByRoom([side, end], [{ a: 'side', b: 'end', at: 0, w: 1 }])).toThrow();
  });
});

describe('solidSpans', () => {
  it('leaves the wall between and around gaps', () => {
    expect(solidSpans(0, 10, [{ from: 6, to: 7 }, { from: 2, to: 3 }])).toEqual([
      [0, 2],
      [3, 6],
      [7, 10],
    ]);
    expect(solidSpans(0, 2, [{ from: -1, to: 2 }])).toEqual([]);
  });
});

describe('roomAt and neighbors', () => {
  it('finds rooms by point and by opening', () => {
    expect(roomAt([hall, side], 3, -4)?.id).toBe('side');
    expect(roomAt([hall, side], 1.3, -4)).toBeNull();
    expect(neighbors([{ a: 'hall', b: 'side', at: -4, w: 1 }], 'side')).toEqual(['hall']);
  });
});
