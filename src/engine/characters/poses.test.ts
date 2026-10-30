import { describe, expect, it } from 'vitest';
import { gaits, humanPose, loyonPose, quadrupedPose } from './poses';

const at = (t: number, phase: number, walk: number) => ({ t, phase, walk, seed: 1.3 });

describe('humanPose', () => {
  it('swings the legs against each other and the arms against the legs', () => {
    const pose = humanPose(at(0, 0.25, 1));
    expect(pose.legL.swing).toBeGreaterThan(0.3);
    expect(pose.legR.swing).toBeCloseTo(-pose.legL.swing);
    expect(Math.sign(pose.armL.swing)).toBe(-Math.sign(pose.legL.swing));
  });

  it('only bends knees backward', () => {
    for (let phase = 0; phase < 1; phase += 0.05) {
      const pose = humanPose(at(phase * 3, phase, 1));
      expect(pose.legL.bend).toBeLessThanOrEqual(0);
      expect(pose.legR.bend).toBeLessThanOrEqual(0);
    }
  });

  it('breathes while standing', () => {
    const chests = [0, 1, 2, 3].map((t) => humanPose(at(t, 0, 0)).chest);
    expect(new Set(chests.map((c) => c.toFixed(3))).size).toBeGreaterThan(1);
    chests.forEach((c) => expect(Math.abs(c - 1)).toBeLessThan(0.03));
  });
});

describe('loyonPose', () => {
  it('stands still: no body motion when not walking', () => {
    const pose = loyonPose(at(4, 0.3, 0));
    expect(pose.bodyY).toBe(-0);
    expect(pose.footL.z).toBe(-0);
  });

  it('sinks lower on the left step than on the right', () => {
    const lows = Array.from({ length: 40 }, (_, i) => loyonPose(at(0, i / 40, 1)));
    const leftDip = Math.min(...lows.map((p) => p.bodyY));
    const leanLeft = Math.min(...lows.map((p) => p.roll));
    expect(leftDip).toBeLessThan(-0.04);
    expect(leanLeft).toBeLessThan(-0.04);
  });
});

describe('quadrupedPose', () => {
  it('moves diagonal legs together at a trot', () => {
    const pose = quadrupedPose(at(0, 0.2, 1), gaits.trot, 0.5);
    expect(pose.legs[0]).toBeCloseTo(pose.legs[3]);
    expect(pose.legs[1]).toBeCloseTo(pose.legs[2]);
    expect(pose.legs[0]).toBeCloseTo(-pose.legs[1]);
  });
});
