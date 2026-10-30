import { describe, expect, it } from 'vitest';
import { isFriendlyKnock, knockGroups } from './knock';

describe('knockGroups', () => {
  it('splits knocks at waits of two seconds or more', () => {
    expect(knockGroups([0, 0.4, 0.8, 3.5])).toEqual([3, 1]);
    expect(knockGroups([0, 2, 2.5])).toEqual([1, 2]);
    expect(knockGroups([])).toEqual([]);
  });
});

describe('isFriendlyKnock', () => {
  it('accepts three knocks, a wait, then one', () => {
    expect(isFriendlyKnock([0, 0.5, 1.1, 3.4])).toBe(true);
  });

  it('rejects any other pattern', () => {
    expect(isFriendlyKnock([0, 0.5, 1.1, 1.5])).toBe(false);
    expect(isFriendlyKnock([0, 0.5, 1.1])).toBe(false);
    expect(isFriendlyKnock([0, 0.5, 1.1, 3.4, 3.8])).toBe(false);
    expect(isFriendlyKnock([0, 2.5, 3, 3.5, 6])).toBe(false);
  });
});
