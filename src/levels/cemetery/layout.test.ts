import { describe, expect, it } from 'vitest';
import { documents } from '../../content';
import { BACK_GATE, bedOf, chassotGrave, CHASSOT_BEDS, EAST_X, FRONT_GATE, graves, inside, PATH_WIDTH, SHED, WEST_X } from './layout';

describe('cemetery layout', () => {
  it('has about forty graves', () => {
    expect(graves.length).toBeGreaterThanOrEqual(38);
    expect(graves.length).toBeLessThanOrEqual(45);
  });

  it('places every grave inscription from the content exactly once', () => {
    const inscriptions = Object.keys(documents).filter((id) => id.startsWith('grave_') && id !== 'grave_chassot');
    const placed = graves.flatMap((g) => (g.doc ? [g.doc] : []));
    expect([...placed].sort()).toEqual([...inscriptions].sort());
  });

  it('puts the Chassot plot in the back row against the west wall', () => {
    expect(chassotGrave.row).toBe(5);
    expect(chassotGrave.x - chassotGrave.w / 2).toBeLessThan(WEST_X + 3);
    expect(CHASSOT_BEDS.marc.x).toBeLessThan(CHASSOT_BEDS.therese.x);
  });

  it('keeps graves off the central path, out of the shed, and inside the walls', () => {
    graves.forEach((g) => {
      const bed = bedOf(g);
      expect(Math.abs(g.x) - g.w / 2).toBeGreaterThan(PATH_WIDTH / 2);
      expect(inside(SHED, bed.x, bed.z, 0.5)).toBe(false);
      expect(g.x - g.w / 2).toBeGreaterThan(WEST_X);
      expect(g.x + g.w / 2).toBeLessThan(EAST_X);
    });
  });

  it('leaves the way to the back gate clear', () => {
    const backRow = graves.filter((g) => g.row === 5);
    backRow.forEach((g) => expect(Math.abs(g.x - BACK_GATE.x)).toBeGreaterThan(g.w / 2 + BACK_GATE.w));
    expect(FRONT_GATE.x).toBe(0);
  });
});
