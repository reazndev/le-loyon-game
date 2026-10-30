import { describe, expect, it } from 'vitest';
import { garageCast, YANNICK_LEFT } from './cast';

const state = (...flags: string[]) => ({
  hasFlag: (flag: string) => flags.includes(flag),
  hasItem: () => false,
  count: () => 0,
});

describe('garageCast', () => {
  it('has Yannick alone at the bench on day 1', () => {
    expect(garageCast('day1', state())).toEqual({ gilles: false, yannick: 'bench', yannickLeaves: false });
  });

  it('has Gilles at the bench and Yannick under the Fiat on day 2', () => {
    expect(garageCast('day2', state())).toEqual({ gilles: true, yannick: 'lift', yannickLeaves: false });
  });

  it('sends Gilles to the café on day 3 when the grave was left open', () => {
    expect(garageCast('day3', state()).gilles).toBe(true);
    expect(garageCast('day3', state('grave_left_open')).gilles).toBe(false);
  });

  it('lets Yannick walk out once on day 3', () => {
    expect(garageCast('day3', state())).toMatchObject({ yannick: 'bench', yannickLeaves: true });
    expect(garageCast('day3', state(YANNICK_LEFT))).toMatchObject({ yannick: null, yannickLeaves: false });
    expect(garageCast('day3', state('met_veilleur')).yannick).toBeNull();
  });

  it('is empty at night and at dawn', () => {
    (['night1', 'night2', 'night3', 'dawn'] as const).forEach((phase) =>
      expect(garageCast(phase, state())).toEqual({ gilles: false, yannick: null, yannickLeaves: false }),
    );
  });
});
