import { describe, expect, it } from 'vitest';
import { distanceToPath, inTorchCone, noticed, TORCH_HALF_ANGLE, TORCH_RANGE, type SightInput } from './detection';

/** A torch at the origin pointing down -Z. */
const torch = { x: 0, z: 0, yaw: 0, range: TORCH_RANGE, halfAngle: TORCH_HALF_ANGLE };

function input(overrides: Partial<Omit<SightInput, 'player'>> & { player?: Partial<SightInput['player']> } = {}): SightInput {
  return {
    torch,
    watchman: { x: 0, z: 0 },
    inGrounds: true,
    hidden: false,
    clearSight: () => true,
    evidence: [],
    investigating: false,
    ...overrides,
    player: { x: 0, z: -6, crouched: false, flashlight: false, ...overrides.player },
  };
}

describe('inTorchCone', () => {
  it('covers 12 m and 25 degrees', () => {
    expect(inTorchCone(torch, { x: 0, z: -11.9 })).toBe(true);
    expect(inTorchCone(torch, { x: 0, z: -12.1 })).toBe(false);
    expect(inTorchCone(torch, { x: Math.tan(0.2) * 8, z: -8 })).toBe(true);
    expect(inTorchCone(torch, { x: Math.tan(0.24) * 8, z: -8 })).toBe(false);
    expect(inTorchCone(torch, { x: 0, z: 6 })).toBe(false);
  });
});

describe('distanceToPath', () => {
  it('measures to the nearest segment', () => {
    const path = [
      { x: 0, z: 0 },
      { x: 10, z: 0 },
      { x: 10, z: 10 },
    ];
    expect(distanceToPath(path, { x: 5, z: 2 })).toBeCloseTo(2);
    expect(distanceToPath(path, { x: 12, z: 5 })).toBeCloseTo(2);
    expect(distanceToPath(path, { x: -3, z: 4 })).toBeCloseTo(5);
  });
});

describe('noticed', () => {
  it('sees a standing player in the beam, even behind low cover', () => {
    expect(noticed(input({ clearSight: () => false }))).toBe('beam');
  });

  it('misses a crouched player behind cover, but not in the open', () => {
    expect(noticed(input({ player: { crouched: true }, clearSight: () => false }))).toBeNull();
    expect(noticed(input({ player: { crouched: true } }))).toBe('beam');
  });

  it('finds a crouched player at point-blank range while searching', () => {
    expect(noticed(input({ player: { crouched: true, z: -3 }, clearSight: () => false, investigating: true }))).toBe('beam');
  });

  it('spots a flashlight anywhere in the grounds within 30 m', () => {
    expect(noticed(input({ player: { x: 20, z: 15, flashlight: true } }))).toBe('flashlight');
    expect(noticed(input({ player: { x: 30, z: 15, flashlight: true } }))).toBeNull();
    expect(noticed(input({ inGrounds: false, player: { x: 20, z: 15, flashlight: true } }))).toBeNull();
  });

  it('never finds a hidden player, but finds evidence in the beam', () => {
    expect(noticed(input({ hidden: true }))).toBeNull();
    expect(noticed(input({ hidden: true, evidence: [{ x: 0, z: -4 }] }))).toBe('evidence');
    expect(noticed(input({ player: { x: 20 }, evidence: [{ x: 0, z: -4 }], inGrounds: false }))).toBeNull();
  });
});
