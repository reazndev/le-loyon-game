import type { Bus } from '../engine/audio/audioManager';
import type { ListRow } from '../engine/ui/listMenu';

export interface Settings {
  /** 0 to 10 per bus; 10 plays the bus at its mixed level. */
  volume: Record<Bus, number>;
  /** 0 to 10; 5 shows the frame as rendered. */
  brightness: number;
  invertTurning: boolean;
  /** The English under French lines and documents. */
  subtitles: boolean;
}

export const STEPS = 10;
const STORAGE_KEY = 'le-loyon.settings';

export const defaultSettings: Settings = {
  volume: { ambience: 10, sfx: 10, ui: 10, music: 10 },
  brightness: 5,
  invertTurning: false,
  subtitles: true,
};

const clampStep = (value: unknown, fallback: number) =>
  typeof value === 'number' && Number.isFinite(value) ? Math.min(STEPS, Math.max(0, Math.round(value))) : fallback;
const bool = (value: unknown, fallback: boolean) => (typeof value === 'boolean' ? value : fallback);

/** Reads stored settings, keeping defaults for anything missing or broken. */
export function parseSettings(raw: string | null): Settings {
  let stored: Partial<Record<keyof Settings, unknown>> = {};
  try {
    stored = raw ? (JSON.parse(raw) as typeof stored) : {};
  } catch {
    stored = {};
  }
  const volume = (stored.volume ?? {}) as Partial<Record<Bus, unknown>>;
  return {
    volume: Object.fromEntries(
      (Object.keys(defaultSettings.volume) as Bus[]).map((bus) => [bus, clampStep(volume[bus], defaultSettings.volume[bus])]),
    ) as Record<Bus, number>,
    brightness: clampStep(stored.brightness, defaultSettings.brightness),
    invertTurning: bool(stored.invertTurning, defaultSettings.invertTurning),
    subtitles: bool(stored.subtitles, defaultSettings.subtitles),
  };
}

export const loadSettings = (storage: Pick<Storage, 'getItem'>): Settings => parseSettings(storage.getItem(STORAGE_KEY));

export const saveSettings = (storage: Pick<Storage, 'setItem'>, settings: Settings): void =>
  storage.setItem(STORAGE_KEY, JSON.stringify(settings));

/** The CSS brightness factor for a brightness step: 0.6 at 0, 1 at 5, 1.4 at 10. */
export const brightnessFactor = (step: number): number => 1 + (step - 5) * 0.08;

/** One line of the settings menu: how it reads and how left, right, and confirm change it. */
interface SettingRow {
  label: string;
  value(settings: Settings): number | string;
  change(settings: Settings, delta: number): Settings;
}

const volumeRow = (label: string, bus: Bus): SettingRow => ({
  label,
  value: (s) => s.volume[bus] / STEPS,
  change: (s, delta) => ({ ...s, volume: { ...s.volume, [bus]: clampStep(s.volume[bus] + delta, 0) } }),
});

const toggleRow = (label: string, key: 'invertTurning' | 'subtitles'): SettingRow => ({
  label,
  value: (s) => (s[key] ? 'On' : 'Off'),
  change: (s) => ({ ...s, [key]: !s[key] }),
});

const rows: SettingRow[] = [
  volumeRow('Ambience', 'ambience'),
  volumeRow('Sound effects', 'sfx'),
  volumeRow('Music', 'music'),
  volumeRow('Menus', 'ui'),
  {
    label: 'Brightness',
    value: (s) => s.brightness / STEPS,
    change: (s, delta) => ({ ...s, brightness: clampStep(s.brightness + delta, 5) }),
  },
  toggleRow('Invert turning', 'invertTurning'),
  toggleRow('Subtitles', 'subtitles'),
];

export const settingRows = (settings: Settings): ListRow[] => rows.map((row) => ({ label: row.label, value: row.value(settings) }));

/** The settings after pressing left (-1), right (+1), or confirm (+1) on a row. */
export const changeSetting = (settings: Settings, row: number, delta: number): Settings =>
  rows[row]?.change(settings, delta) ?? settings;
