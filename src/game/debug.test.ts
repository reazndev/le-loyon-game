import { describe, expect, it } from 'vitest';
import { parseDebugParams } from './debug';

describe('parseDebugParams', () => {
  it('reads every parameter', () => {
    expect(parseDebugParams('?scene=church&time=night&flags=a,b&pos=1,0,-2.5&yaw=90')).toEqual({
      scene: 'church',
      time: 'night',
      flags: ['a', 'b'],
      pose: { x: 1, y: 0, z: -2.5, yaw: 90 },
    });
  });

  it('ignores missing and malformed values', () => {
    expect(parseDebugParams('?time=dusk&pos=1,2&flags=')).toEqual({ flags: [] });
    expect(parseDebugParams('')).toEqual({ flags: [] });
  });
});
