import { describe, expect, it } from 'vitest';
import { parseDebugParams } from './debug';

describe('parseDebugParams', () => {
  it('reads every parameter', () => {
    expect(parseDebugParams('?scene=church&time=night&day=2&night=2&flags=a,b&pos=1,0,-2.5&yaw=90')).toEqual({
      scene: 'church',
      time: 'night',
      flags: ['a', 'b'],
      counts: { day: 2, night: 2 },
      pose: { x: 1, y: 0, z: -2.5, yaw: 90 },
    });
  });

  it('ignores missing and malformed values', () => {
    expect(parseDebugParams('?time=dusk&pos=1,2&flags=&day=two&night=')).toEqual({ flags: [], counts: {} });
    expect(parseDebugParams('')).toEqual({ flags: [], counts: {} });
  });
});
