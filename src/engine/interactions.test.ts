import { describe, expect, it } from 'vitest';
import { findFocus, type Interactable } from './interactions';

const item = (x: number, z: number, radius = 0.3, enabled?: () => boolean): Interactable => ({
  position: { x, z },
  radius,
  prompt: 'Look',
  onInteract: () => undefined,
  ...(enabled ? { enabled } : {}),
});

const north = { x: 0, z: -1 };

describe('findFocus', () => {
  it('finds an object in front and within reach', () => {
    const door = item(0, -1);
    expect(findFocus([door], { x: 0, z: 0 }, north)).toBe(door);
  });

  it('ignores objects behind the player or out of reach', () => {
    expect(findFocus([item(0, 1)], { x: 0, z: 0 }, north)).toBeNull();
    expect(findFocus([item(0, -3)], { x: 0, z: 0 }, north)).toBeNull();
  });

  it('prefers the closer, more centered object', () => {
    const centered = item(0, -1);
    const offset = item(0.6, -1);
    expect(findFocus([offset, centered], { x: 0, z: 0 }, north)).toBe(centered);
  });

  it('skips disabled objects', () => {
    expect(findFocus([item(0, -1, 0.3, () => false)], { x: 0, z: 0 }, north)).toBeNull();
  });
});
