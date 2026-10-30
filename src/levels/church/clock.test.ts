import { describe, expect, it } from 'vitest';
import { chimesBetween, FIRST_QUARTER, QUARTER_SECONDS } from './clock';

describe('chimesBetween', () => {
  it('is quiet before the first quarter', () => {
    expect(chimesBetween(0, FIRST_QUARTER - 0.01)).toEqual([]);
  });

  it('clicks once when a quarter passes', () => {
    expect(chimesBetween(FIRST_QUARTER - 0.01, FIRST_QUARTER)).toEqual(['quarter']);
    expect(chimesBetween(FIRST_QUARTER, FIRST_QUARTER + 1)).toEqual([]);
  });

  it('rings the bell on every fourth quarter', () => {
    const end = FIRST_QUARTER + 7 * QUARTER_SECONDS;
    expect(chimesBetween(0, end)).toEqual(['quarter', 'quarter', 'quarter', 'hour', 'quarter', 'quarter', 'quarter', 'hour']);
  });
});
