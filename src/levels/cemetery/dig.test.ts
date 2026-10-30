import { describe, expect, it } from 'vitest';
import { GameState } from '../../game/state';
import { graveAction, holeDepth, holeOpen, holeVisible, StageClock } from './dig';

const state = (setup: (s: GameState) => void = () => undefined) => {
  const s = new GameState();
  s.giveItem('shovel');
  setup(s);
  return s;
};

describe('graveAction', () => {
  it('needs the shovel', () => {
    const s = new GameState();
    expect(graveAction(s, false)).toBeNull();
  });

  it('digs from the edge until the hole is waist deep, then from inside', () => {
    expect(graveAction(state(), false)).toBe('dig');
    expect(graveAction(state((s) => s.setCount('dig_stage', 2)), false)).toBe('dig');
    expect(graveAction(state((s) => s.setCount('dig_stage', 3)), false)).toBe('climb_in');
    expect(graveAction(state((s) => s.setCount('dig_stage', 3)), true)).toBe('dig');
    expect(graveAction(state((s) => s.setCount('dig_stage', 5)), true)).toBe('lift_lid');
  });

  it('takes the box before anything can be filled in', () => {
    const opened = state((s) => {
      s.setCount('dig_stage', 5);
      s.setFlag('opened_coffin');
    });
    expect(graveAction(opened, true)).toBe('take_box');
    expect(graveAction(opened, false)).toBe('climb_in');
    opened.giveItem('bunker_key');
    expect(graveAction(opened, false)).toBe('refill');
    expect(graveAction(opened, true)).toBeNull();
  });

  it('does nothing under the tarp or after refilling', () => {
    expect(graveAction(state((s) => s.setFlag('tarp_over_hole')), false)).toBeNull();
    expect(graveAction(state((s) => s.setFlag('grave_refilled')), false)).toBeNull();
  });
});

describe('the hole', () => {
  it('deepens with each stage and fills back in', () => {
    const s = state();
    expect(holeDepth(s)).toBe(0);
    s.setCount('dig_stage', 3);
    expect(holeDepth(s)).toBe(1);
    s.setCount('dig_stage', 5);
    s.setCount('refill_stage', 2);
    expect(holeDepth(s)).toBeLessThan(1);
    s.setFlag('grave_refilled');
    expect(holeDepth(s)).toBe(0);
  });

  it('is evidence while open and uncovered', () => {
    const s = state((x) => x.setCount('dig_stage', 1));
    expect(holeOpen(s)).toBe(true);
    expect(holeVisible(s)).toBe(true);
    s.setFlag('tarp_over_hole');
    expect(holeVisible(s)).toBe(false);
  });
});

describe('StageClock', () => {
  it('keeps progress when the button is let go', () => {
    const clock = new StageClock(25);
    expect(clock.hold(10)).toBe(false);
    expect(clock.hold(10)).toBe(false);
    expect(clock.progress).toBeCloseTo(0.8);
    expect(clock.hold(5)).toBe(true);
    expect(clock.progress).toBe(0);
  });
});
