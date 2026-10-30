import { describe, expect, it } from 'vitest';
import { BeatTracker, viewAngle, type Beat, type Senses } from './beats';

function senses(overrides: Partial<Senses> & { flags?: string[] } = {}): Senses {
  const flags = new Set(overrides.flags ?? []);
  return {
    x: 0,
    z: 0,
    eye: { x: 0, y: 1.6, z: 0 },
    view: { x: 0, y: 0, z: -1 },
    time: 0,
    state: { hasFlag: (f) => flags.has(f), hasItem: () => false, count: () => 0 },
    ...overrides,
  };
}

const beat = (when: Beat['when'], extra: Partial<Beat> = {}): Beat => ({ id: 'b', when, do: [], ...extra });

describe('BeatTracker', () => {
  it('fires a zone beat when the player walks in, once', () => {
    const tracker = new BeatTracker([beat({ enter: { x: 0, z: -5, r: 1 } })]);
    expect(tracker.update(senses(), 0.1)).toHaveLength(0);
    expect(tracker.update(senses({ z: -5 }), 0.1)).toHaveLength(1);
    tracker.update(senses(), 0.1);
    expect(tracker.update(senses({ z: -5 }), 0.1)).toHaveLength(0);
  });

  it('ignores a zone the player starts in until they leave it', () => {
    const tracker = new BeatTracker([beat({ enter: { x: 0, z: 0, w: 2, d: 2 } })]);
    expect(tracker.update(senses(), 0.1)).toHaveLength(0);
    expect(tracker.update(senses({ x: 0.5 }), 0.1)).toHaveLength(0);
    tracker.update(senses({ x: 5 }), 0.1);
    expect(tracker.update(senses(), 0.1)).toHaveLength(1);
  });

  it('waits for flags, time, and the condition together', () => {
    const tracker = new BeatTracker([beat([{ flag: 'a' }, { after: 10 }], { if: { notFlag: 'b' } })]);
    expect(tracker.update(senses({ flags: ['a'], time: 5 }), 0.1)).toHaveLength(0);
    expect(tracker.update(senses({ flags: ['a', 'b'], time: 11 }), 0.1)).toHaveLength(0);
    expect(tracker.update(senses({ flags: ['a'], time: 12 }), 0.1)).toHaveLength(1);
  });

  it('needs the look held', () => {
    const tracker = new BeatTracker([beat({ look: { x: 0, y: 1.6, z: -10, hold: 0.3 } })]);
    expect(tracker.update(senses(), 0.2)).toHaveLength(0);
    expect(tracker.update(senses(), 0.2)).toHaveLength(1);
    const away = new BeatTracker([beat({ look: { x: 10, y: 1.6, z: 0, hold: 0 } })]);
    expect(away.update(senses(), 0.2)).toHaveLength(0);
  });

  it('never fires a beat whose flag is already set', () => {
    const tracker = new BeatTracker([beat({ after: 0 }, { set: 'done' })]);
    expect(tracker.update(senses({ flags: ['done'] }), 0.1)).toHaveLength(0);
  });

  it('fires a repeatable beat again after its trigger lets go and the wait passes', () => {
    const tracker = new BeatTracker([beat({ enter: { x: 0, z: -5, r: 1 } }, { repeat: 10 })]);
    tracker.update(senses(), 0.1);
    expect(tracker.update(senses({ z: -5, time: 1 }), 0.1)).toHaveLength(1);
    expect(tracker.update(senses({ z: -5, time: 2 }), 0.1)).toHaveLength(0);
    tracker.update(senses({ time: 3 }), 0.1);
    expect(tracker.update(senses({ z: -5, time: 4 }), 0.1)).toHaveLength(0);
    tracker.update(senses({ time: 12 }), 0.1);
    expect(tracker.update(senses({ z: -5, time: 13 }), 0.1)).toHaveLength(1);
  });
});

describe('viewAngle', () => {
  it('is the angle off the view center in degrees', () => {
    const eye = { x: 0, y: 0, z: 0 };
    const view = { x: 0, y: 0, z: -1 };
    expect(viewAngle({ eye, view }, { x: 0, y: 0, z: -3 })).toBeCloseTo(0);
    expect(viewAngle({ eye, view }, { x: 3, y: 0, z: 0 })).toBeCloseTo(90);
    expect(viewAngle({ eye, view }, { x: 0, y: 0, z: 3 })).toBeCloseTo(180);
  });
});
