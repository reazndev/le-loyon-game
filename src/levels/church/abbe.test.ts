import { describe, expect, it } from 'vitest';
import { overneySpot, sealDue } from './abbe';

const state = (options: { day?: number; night?: number; flags?: string[]; time?: 'day' | 'night' }) => ({
  time: options.time ?? 'day',
  hasFlag: (f: string) => (options.flags ?? []).includes(f),
  hasItem: () => false,
  count: (name: string) => (name === 'day' ? (options.day ?? 0) : name === 'night' ? (options.night ?? 0) : 0),
});

describe('overneySpot', () => {
  it('has him at the candles on day 1 until he has told the graves, then in the sacristy', () => {
    expect(overneySpot(state({ day: 1 }))).toBe('candles');
    expect(overneySpot(state({}))).toBe('candles');
    expect(overneySpot(state({ day: 1, flags: ['abbe_met', 'abbe_told_graves'] }))).toBe('sacristy');
  });

  it('follows the register and the seal on day 2', () => {
    expect(overneySpot(state({ day: 2 }))).toBe('nave');
    expect(overneySpot(state({ day: 2, flags: ['read_register'] }))).toBe('sacristy_door');
    expect(overneySpot(state({ day: 2, flags: ['read_register', 'abbe_seal_hint'] }))).toBe('office');
  });

  it('has him kneeling on day 3 until he has said his piece about the letter', () => {
    expect(overneySpot(state({ day: 3 }))).toBe('kneeling');
    expect(overneySpot(state({ day: 3, flags: ['abbe_day3'] }))).toBeNull();
  });

  it('keeps him out of the church at night, after Marc, and on day 4', () => {
    expect(overneySpot(state({ day: 2, night: 2, time: 'night' }))).toBeNull();
    expect(overneySpot(state({ day: 3, flags: ['met_marc'] }))).toBeNull();
    expect(overneySpot(state({ day: 4 }))).toBeNull();
  });
});

describe('sealDue', () => {
  it('holds only between reading the register and the talk about the seal', () => {
    expect(sealDue(state({ day: 2 }))).toBe(false);
    expect(sealDue(state({ day: 2, flags: ['read_register'] }))).toBe(true);
    expect(sealDue(state({ day: 2, flags: ['read_register', 'abbe_seal_hint'] }))).toBe(false);
  });
});
