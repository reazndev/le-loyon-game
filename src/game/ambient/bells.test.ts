import { describe, expect, it } from 'vitest';
import { FIRST_HOUR, HOUR_SECONDS, hoursRung, strokesFor } from './bells';

describe('hour bells', () => {
  it('rings the first hour soon after arrival, then every hour of play time', () => {
    expect(hoursRung(FIRST_HOUR - 1)).toBe(0);
    expect(hoursRung(FIRST_HOUR)).toBe(1);
    expect(hoursRung(FIRST_HOUR + HOUR_SECONDS - 1)).toBe(1);
    expect(hoursRung(FIRST_HOUR + HOUR_SECONDS)).toBe(2);
  });

  it('strikes the next hour on a twelve-hour bell', () => {
    expect(strokesFor(16, 1)).toBe(5);
    expect(strokesFor(22, 1)).toBe(11);
    expect(strokesFor(22, 2)).toBe(12);
    expect(strokesFor(22, 3)).toBe(1);
  });
});
