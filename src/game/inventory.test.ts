import { describe, expect, it } from 'vitest';
import '../content';
import { inventoryEntry, itemUse } from './inventory';
import { GameState } from './state';

describe('inventory', () => {
  const state = new GameState();
  state.setCount('film_shots', 7);
  state.addPhoto('photo_misc_1', { image: 'data:', caption: 'Leurs, November 98', takenAt: 0 });
  state.addPhoto('photo_lantern', { image: 'data:', caption: 'D.M. Who lights it?', takenAt: 0 });

  it('knows what each item does', () => {
    expect(itemUse('notebook', state)).toEqual({ kind: 'notebook' });
    expect(itemUse('polaroid_camera', state)).toEqual({ kind: 'camera' });
    expect(itemUse('photo_lantern', state)).toEqual({ kind: 'photo', item: 'photo_lantern' });
    expect(itemUse('gremaud_letter', state)).toEqual({ kind: 'read', document: 'doc_gremaud_letter' });
    expect(itemUse('photo_boys', state)).toEqual({ kind: 'read', document: 'photo_boys' });
    expect(itemUse('shovel', state)).toBeNull();
  });

  it('describes misc photos by their caption and the camera by its film', () => {
    expect(inventoryEntry('photo_misc_1', state)).toEqual({ label: 'Photo', detail: '"Leurs, November 98"', action: 'Look' });
    expect(inventoryEntry('polaroid_camera', state).detail).toMatch(/Shots left: 7\.$/);
    expect(inventoryEntry('shovel', state)).not.toHaveProperty('action');
  });
});
