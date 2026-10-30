import { describe, expect, it } from 'vitest';
import { stepBack, TALK_DISTANCE } from './talkFraming';

describe('stepBack', () => {
  it('moves straight away from the character to the talking distance', () => {
    const step = stepBack({ x: 0, z: 0.5 }, { x: 0, z: 0 });
    expect(step.x).toBeCloseTo(0);
    expect(step.z).toBeCloseTo(TALK_DISTANCE - 0.5);
  });

  it('keeps the direction on a diagonal', () => {
    const step = stepBack({ x: 0.6, z: 0.8 }, { x: 0, z: 0 }, 2);
    expect(step.x).toBeCloseTo(0.6);
    expect(step.z).toBeCloseTo(0.8);
  });

  it('stays put when already far enough, or on top of the character', () => {
    expect(stepBack({ x: 0, z: 2 }, { x: 0, z: 0 })).toEqual({ x: 0, z: 0 });
    expect(stepBack({ x: 0, z: 0 }, { x: 0, z: 0 })).toEqual({ x: 0, z: 0 });
  });
});
