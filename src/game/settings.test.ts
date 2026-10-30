import { describe, expect, it } from 'vitest';
import { brightnessFactor, changeSetting, defaultSettings, parseSettings, settingRows } from './settings';

describe('settings', () => {
  it('falls back to defaults', () => {
    expect(parseSettings(null)).toEqual(defaultSettings);
    expect(parseSettings('not json')).toEqual(defaultSettings);
    expect(parseSettings('{"volume":{"music":3,"sfx":"loud"},"brightness":42,"subtitles":false}')).toEqual({
      ...defaultSettings,
      volume: { ...defaultSettings.volume, music: 3 },
      brightness: 10,
      subtitles: false,
    });
  });

  it('changes one row at a time and keeps values in range', () => {
    const quieter = changeSetting(defaultSettings, 0, -1);
    expect(quieter.volume.ambience).toBe(9);
    expect(defaultSettings.volume.ambience).toBe(10);
    expect(changeSetting(defaultSettings, 0, 1).volume.ambience).toBe(10);
    expect(changeSetting(defaultSettings, 5, 1).invertTurning).toBe(true);
    expect(changeSetting(defaultSettings, 6, -1).subtitles).toBe(false);
  });

  it('lists each setting with its value', () => {
    const rows = settingRows(defaultSettings);
    expect(rows[0]).toEqual({ label: 'Ambience', value: 1 });
    expect(rows.at(-1)).toEqual({ label: 'Subtitles', value: 'On' });
  });

  it('maps brightness steps around the rendered frame', () => {
    expect(brightnessFactor(5)).toBe(1);
    expect(brightnessFactor(0)).toBeCloseTo(0.6);
    expect(brightnessFactor(10)).toBeCloseTo(1.4);
  });
});
