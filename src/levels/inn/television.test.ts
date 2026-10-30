import { describe, expect, it } from 'vitest';
import { tvPicture } from './television';

describe('tvPicture', () => {
  const samples = Array.from({ length: 2000 }, (_, i) => tvPicture(i * 0.05));

  it('stays dim and never blacks out', () => {
    samples.forEach(({ level }) => {
      expect(level).toBeGreaterThan(0.7);
      expect(level).toBeLessThanOrEqual(1);
    });
  });

  it('holds a shot for more than a second and cuts within eight', () => {
    const runs: number[] = [];
    let run = 1;
    samples.slice(1).forEach((s, i) => {
      if (s.shot === samples[i]!.shot) run++;
      else {
        runs.push(run * 0.05);
        run = 1;
      }
    });
    expect(runs.length).toBeGreaterThan(5);
    runs.forEach((seconds) => {
      expect(seconds).toBeGreaterThanOrEqual(1.45);
      expect(seconds).toBeLessThanOrEqual(7.6);
    });
  });

  it('is the same picture for the same time', () => {
    expect(tvPicture(42.1)).toEqual(tvPicture(42.1));
  });
});
