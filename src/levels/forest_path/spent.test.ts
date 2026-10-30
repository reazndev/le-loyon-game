import { describe, expect, it } from 'vitest';
import type { Beat } from '../../game/scares/beats';
import { isSpent, unspent } from './spent';

const state = (day: number, night: number) => ({
  count: (name: string) => (name === 'day' ? day : name === 'night' ? night : 0),
  hasFlag: () => false,
  hasItem: () => false,
});
const beat = (id: string): Beat => ({ id, when: { after: 0 }, do: [] });
const fire = (b: Beat) => b.do.forEach((action) => 'run' in action && action.run({} as never));

describe('unspent', () => {
  it('drops a beat once it has fired, for the rest of the night', () => {
    const night1 = state(1, 1);
    const [cough] = unspent(night1, [beat('test_cough')]);
    expect(isSpent(night1, 'test_cough')).toBe(false);
    fire(cough!);
    expect(isSpent(night1, 'test_cough')).toBe(true);
    expect(unspent(night1, [beat('test_cough')])).toEqual([]);
  });

  it('starts fresh on a new day or night', () => {
    const [b] = unspent(state(2, 0), [beat('test_masks')]);
    fire(b!);
    expect(unspent(state(2, 2), [beat('test_masks')])).toHaveLength(1);
    expect(unspent(state(3, 0), [beat('test_masks')])).toHaveLength(1);
  });
});
