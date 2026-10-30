import { describe, expect, it } from 'vitest';
import { heiferPlace } from './heifer';

const state = (flags: string[] = []) => ({
  hasFlag: (f: string) => flags.includes(f),
  hasItem: () => false,
  count: () => 0,
});

describe('heiferPlace', () => {
  it('has her missing on day 1 and at night', () => {
    expect(heiferPlace(state(['heifer_missing']), 'day1')).toBe('missing');
    expect(heiferPlace(state(['heifer_missing']), 'night1')).toBe('missing');
    expect(heiferPlace(state(['heifer_found']), 'night2')).toBe('missing');
  });

  it('puts her at the forest edge on day 2 until she is found', () => {
    expect(heiferPlace(state(), 'day2')).toBe('at_the_edge');
    expect(heiferPlace(state(['heifer_missing']), 'day3')).toBe('at_the_edge');
  });

  it('has her follow the reporter once found', () => {
    expect(heiferPlace(state(['heifer_found']), 'day2')).toBe('following');
  });

  it('keeps her home once Bernard has her back, day or night', () => {
    expect(heiferPlace(state(['heifer_found', 'heifer_returned']), 'day2')).toBe('home');
    expect(heiferPlace(state(['heifer_found', 'heifer_returned']), 'night2')).toBe('home');
    expect(heiferPlace(state(['heifer_returned']), 'dawn')).toBe('home');
  });
});
