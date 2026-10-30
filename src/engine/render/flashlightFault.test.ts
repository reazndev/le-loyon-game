import { describe, expect, it } from 'vitest';
import { FlashlightFault } from './flashlightFault';

/** A small seeded generator, so the hour below is the same every run. */
function seeded(seed: number): () => number {
  let s = seed;
  return () => ((s = (s * 1664525 + 1013904223) % 4294967296) / 4294967296);
}

/** Plays an hour at 60 frames a second and returns each dark stretch as [start, seconds]. */
function darkStretches(seed: number): [number, number][] {
  const fault = new FlashlightFault(seeded(seed));
  const stretches: [number, number][] = [];
  let since: number | null = null;
  for (let frame = 0; frame < 3600 * 60; frame++) {
    const time = frame / 60;
    const dark = fault.level(time) === 0;
    if (dark && since === null) since = time;
    if (!dark && since !== null) {
      stretches.push([since, time - since]);
      since = null;
    }
  }
  return stretches;
}

describe('FlashlightFault', () => {
  it('dies for a few seconds at a time, at most about once a minute', () => {
    [1, 2, 3].forEach((seed) => {
      const outages = darkStretches(seed).filter(([, seconds]) => seconds >= 1.4);
      expect(outages.length).toBeGreaterThan(15);
      expect(outages.length).toBeLessThan(60);
      outages.forEach(([, seconds]) => expect(seconds).toBeLessThanOrEqual(4.05));
      outages.slice(1).forEach(([start], i) => expect(start - outages[i]![0]).toBeGreaterThan(25));
    });
  });

  it('stays steady most of the time', () => {
    const fault = new FlashlightFault(seeded(7));
    const frames = 3600 * 60;
    let full = 0;
    for (let frame = 0; frame < frames; frame++) if (fault.level(frame / 60) === 1) full++;
    expect(full / frames).toBeGreaterThan(0.93);
  });
});
