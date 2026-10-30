import { describe, expect, it } from 'vitest';
import { check, apply } from './conditions';
import { SAVE_VERSION, deleteSave, latestSave, readSave, writeSave, type SaveStorage } from './save';
import { GameState } from './state';

function memoryStorage(): SaveStorage & { data: Map<string, string> } {
  const data = new Map<string, string>();
  return {
    data,
    getItem: (key) => data.get(key) ?? null,
    setItem: (key, value) => void data.set(key, value),
    removeItem: (key) => void data.delete(key),
  };
}

function sampleState(): GameState {
  const state = new GameState();
  state.scene = 'village';
  state.time = 'night';
  state.player = { x: 1, y: 0, z: -4.5, yaw: 90 };
  state.setFlag('met_priest');
  state.giveItem('shovel');
  state.giveItem('lamp');
  return state;
}

describe('GameState', () => {
  it('keeps each item once, in pickup order', () => {
    const state = new GameState();
    state.giveItem('a');
    state.giveItem('b');
    state.giveItem('a');
    expect(state.inventory).toEqual(['a', 'b']);
    state.takeItem('a');
    expect(state.inventory).toEqual(['b']);
  });

  it('emits events only on change', () => {
    const state = new GameState();
    const seen: string[] = [];
    state.events.on('flag', ({ flag, on }) => seen.push(`${flag}:${on}`));
    state.events.on('time', (time) => seen.push(time));
    state.setFlag('x');
    state.setFlag('x');
    state.setFlag('x', false);
    state.time = 'night';
    state.time = 'night';
    expect(seen).toEqual(['x:true', 'x:false', 'night']);
  });
});

describe('conditions and effects', () => {
  it('checks flags, items, any, and not together', () => {
    const state = sampleState();
    expect(check({ flag: 'met_priest', item: ['shovel', 'lamp'] }, state)).toBe(true);
    expect(check({ flag: 'met_priest', notItem: 'shovel' }, state)).toBe(false);
    expect(check({ any: [{ flag: 'nope' }, { item: 'lamp' }] }, state)).toBe(true);
    expect(check({ not: { flag: 'met_priest' } }, state)).toBe(false);
    expect(check({}, state)).toBe(true);
  });

  it('applies effects', () => {
    const state = sampleState();
    apply({ set: ['a', 'b'], clear: 'met_priest', give: 'key', take: 'shovel' }, state);
    expect(state.snapshot().flags).toEqual(['a', 'b']);
    expect(state.inventory).toEqual(['lamp', 'key']);
  });
});

describe('save files', () => {
  it('round-trips a snapshot', () => {
    const storage = memoryStorage();
    const state = sampleState();
    writeSave(storage, 'main', state.snapshot(), new Date('1998-11-14T18:00:00Z'));
    const file = readSave(storage, 'main')!;
    expect(file.version).toBe(SAVE_VERSION);
    expect(file.savedAt).toBe('1998-11-14T18:00:00.000Z');
    const restored = new GameState();
    restored.restore(file);
    expect(restored.snapshot()).toEqual(state.snapshot());
  });

  it('returns null for empty, corrupt, or malformed slots', () => {
    const storage = memoryStorage();
    expect(readSave(storage, 'main')).toBeNull();
    storage.setItem('le-loyon.save.main', '{not json');
    expect(readSave(storage, 'main')).toBeNull();
    storage.setItem('le-loyon.save.main', JSON.stringify({ version: SAVE_VERSION, scene: 3 }));
    expect(readSave(storage, 'main')).toBeNull();
  });

  it('rejects saves from a newer version', () => {
    const storage = memoryStorage();
    writeSave(storage, 'main', sampleState().snapshot());
    const raw = JSON.parse(storage.getItem('le-loyon.save.main')!);
    storage.setItem('le-loyon.save.main', JSON.stringify({ ...raw, version: SAVE_VERSION + 1 }));
    expect(readSave(storage, 'main')).toBeNull();
  });

  it('upgrades old versions through migrations', () => {
    const storage = memoryStorage();
    const old = { ...sampleState().snapshot(), version: 0, savedAt: 'x' } as Record<string, unknown>;
    delete old.time;
    storage.setItem('le-loyon.save.main', JSON.stringify(old));
    expect(readSave(storage, 'main')).toBeNull();
    const file = readSave(storage, 'main', { 0: (save) => ({ ...save, version: 1, time: 'day' }) });
    expect(file).toMatchObject({ version: 1, time: 'day', scene: 'village' });
  });

  it('keeps slots apart and deletes them', () => {
    const storage = memoryStorage();
    writeSave(storage, 'a', sampleState().snapshot());
    expect(readSave(storage, 'b')).toBeNull();
    deleteSave(storage, 'a');
    expect(readSave(storage, 'a')).toBeNull();
  });
});

describe('latestSave', () => {
  it('picks the newest of several slots and skips empty ones', () => {
    const storage = memoryStorage();
    expect(latestSave(storage, ['main', 'sleep'])).toBeNull();
    writeSave(storage, 'main', sampleState().snapshot(), new Date('1998-11-17T20:00:00Z'));
    writeSave(storage, 'sleep', sampleState().snapshot(), new Date('1998-11-18T07:00:00Z'));
    expect(latestSave(storage, ['main', 'sleep'])?.slot).toBe('sleep');
    expect(latestSave(storage, ['main', 'other'])?.slot).toBe('main');
  });

  it('keeps photos through a save', () => {
    const storage = memoryStorage();
    const state = sampleState();
    state.addPhoto('photo_lantern', { image: 'data:image/jpeg;base64,', caption: 'D.M. Who lights it?', takenAt: 5 });
    writeSave(storage, 'main', state.snapshot());
    const restored = new GameState();
    restored.restore(readSave(storage, 'main')!);
    expect(restored.photo('photo_lantern')?.caption).toBe('D.M. Who lights it?');
    expect(restored.photos).toEqual(['photo_lantern']);
  });
});
