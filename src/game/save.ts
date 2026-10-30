import type { StateSnapshot } from './state';

export const SAVE_VERSION = 1;

export interface SaveFile extends StateSnapshot {
  version: typeof SAVE_VERSION;
  /** ISO timestamp. */
  savedAt: string;
}

export type SaveStorage = Pick<Storage, 'getItem' | 'setItem' | 'removeItem'>;

/**
 * Upgrades a save from version N to N + 1. When the save format changes, bump SAVE_VERSION and
 * add the step from the old version here, so old saves keep loading.
 */
export type Migration = (save: Record<string, unknown>) => Record<string, unknown>;
export const migrations: Record<number, Migration> = {};

const storageKey = (slot: string) => `le-loyon.save.${slot}`;

export function writeSave(storage: SaveStorage, slot: string, snapshot: StateSnapshot, now = new Date()): SaveFile {
  const file: SaveFile = { version: SAVE_VERSION, savedAt: now.toISOString(), ...snapshot };
  storage.setItem(storageKey(slot), JSON.stringify(file));
  return file;
}

/** Reads a save, upgrading old versions. Returns null if the slot is empty or unreadable. */
export function readSave(storage: SaveStorage, slot: string, steps: Record<number, Migration> = migrations): SaveFile | null {
  const raw = storage.getItem(storageKey(slot));
  if (raw === null) return null;
  try {
    return upgrade(JSON.parse(raw) as Record<string, unknown>, steps);
  } catch {
    return null;
  }
}

export function deleteSave(storage: SaveStorage, slot: string): void {
  storage.removeItem(storageKey(slot));
}

function upgrade(save: Record<string, unknown>, steps: Record<number, Migration>): SaveFile | null {
  let current = save;
  while (typeof current.version === 'number' && current.version < SAVE_VERSION) {
    const step = steps[current.version];
    if (!step) return null;
    current = step(current);
  }
  return isSaveFile(current) ? current : null;
}

function isSaveFile(value: Record<string, unknown>): value is SaveFile & Record<string, unknown> {
  const player = value.player as Record<string, unknown> | undefined;
  const isStringList = (v: unknown) => Array.isArray(v) && v.every((x) => typeof x === 'string');
  return (
    value.version === SAVE_VERSION &&
    typeof value.savedAt === 'string' &&
    typeof value.scene === 'string' &&
    (value.time === 'day' || value.time === 'night') &&
    isStringList(value.flags) &&
    isStringList(value.inventory) &&
    typeof player === 'object' &&
    player !== null &&
    ['x', 'y', 'z', 'yaw'].every((k) => typeof player[k] === 'number')
  );
}

/** The most recent readable save among `slots`, for a "Continue" option. */
export function latestSave(storage: SaveStorage, slots: string[]): { slot: string; file: SaveFile } | null {
  return slots
    .map((slot) => ({ slot, file: readSave(storage, slot) }))
    .filter((save): save is { slot: string; file: SaveFile } => save.file !== null)
    .reduce<{ slot: string; file: SaveFile } | null>((latest, save) => (!latest || save.file.savedAt > latest.file.savedAt ? save : latest), null);
}
