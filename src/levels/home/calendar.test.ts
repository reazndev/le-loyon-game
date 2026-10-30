import { describe, expect, it } from 'vitest';
import { monthCells } from './calendar';

describe('monthCells', () => {
  const november = monthCells(1998, 10);

  it('has every day of November 1998', () => {
    expect(november).toHaveLength(30);
  });

  it('starts on a Sunday, the last column of the first week', () => {
    expect(november[0]).toEqual({ day: 1, column: 6, row: 0 });
  });

  it('puts Monday 16 November in the first column of the fourth week', () => {
    expect(november[15]).toEqual({ day: 16, column: 0, row: 3 });
  });

  it('ends on Monday 30 November in a sixth week', () => {
    expect(november[29]).toEqual({ day: 30, column: 0, row: 5 });
  });
});
