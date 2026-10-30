import { describe, expect, it } from 'vitest';
import { doorstep } from './doorstep';

const state = (time: 'day' | 'night', day: number, flags: string[] = []) => ({
  time,
  hasFlag: (f: string) => flags.includes(f),
  hasItem: () => false,
  count: (name: string) => (name === 'day' ? day : 0),
});

describe('doorstep', () => {
  it('shuts the door on day 1', () => {
    expect(doorstep(state('day', 1))).toBe('refuses');
    expect(doorstep(state('day', 0))).toBe('refuses');
  });

  it('keeps the door shut until the register is read', () => {
    expect(doorstep(state('day', 2))).toBe('curtain');
    expect(doorstep(state('day', 3))).toBe('curtain');
  });

  it('lets the reporter in from day 2 once the register is read', () => {
    expect(doorstep(state('day', 2, ['read_register']))).toBe('lets_in');
    expect(doorstep(state('day', 3, ['read_register', 'odile_talked']))).toBe('lets_in');
  });

  it('answers nobody at night', () => {
    expect(doorstep(state('night', 2, ['read_register']))).toBe('curtain');
  });
});
