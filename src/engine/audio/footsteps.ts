import type { Surface } from '../physics/ground';
import type { AudioManager, Point3 } from './audioManager';
import { noiseBurst, thump } from './generators';

type Recipe = (audio: AudioManager, out: AudioNode, t: number, level: number) => void;

const vary = (value: number, amount = 0.2) => value * (1 + (Math.random() - 0.5) * 2 * amount);

const recipes: Record<Surface, Recipe> = {
  grass: (audio, out, t, level) => {
    noiseBurst(audio, out, { start: t, duration: vary(0.13), type: 'bandpass', frequency: vary(1700), q: 0.6, gain: 0.35 * level, attack: 0.02 });
    noiseBurst(audio, out, { start: t + 0.03, duration: 0.07, type: 'highpass', frequency: 4200, gain: 0.1 * level, attack: 0.01 });
  },
  gravel: (audio, out, t, level) => {
    thump(audio, out, t, vary(140), 0.12 * level);
    for (let i = 0; i < 9; i++) {
      noiseBurst(audio, out, {
        start: t + Math.random() * 0.11,
        duration: vary(0.012, 0.5),
        type: 'bandpass',
        frequency: 2200 + Math.random() * 3200,
        q: 2.5,
        gain: (0.15 + Math.random() * 0.2) * level,
      });
    }
  },
  wood: (audio, out, t, level) => {
    thump(audio, out, t, vary(115), 0.45 * level);
    noiseBurst(audio, out, { start: t, duration: 0.06, type: 'bandpass', frequency: vary(650), q: 4, gain: 0.3 * level });
    noiseBurst(audio, out, { start: t + 0.05, duration: 0.04, type: 'bandpass', frequency: vary(900), q: 5, gain: 0.08 * level });
  },
  stone: (audio, out, t, level) => {
    noiseBurst(audio, out, { start: t, duration: 0.018, type: 'highpass', frequency: vary(2400), gain: 0.35 * level });
    noiseBurst(audio, out, { start: t, duration: 0.05, type: 'lowpass', frequency: 420, gain: 0.3 * level });
    noiseBurst(audio, out, { start: t + vary(0.06), duration: 0.012, type: 'highpass', frequency: vary(3000), gain: 0.15 * level });
  },
  snow: (audio, out, t, level) => {
    for (let i = 0; i < 6; i++) {
      noiseBurst(audio, out, {
        start: t + i * vary(0.025),
        duration: 0.03,
        type: 'bandpass',
        frequency: 900 + Math.random() * 900,
        q: 1.2,
        gain: (0.15 + Math.random() * 0.15) * level,
        attack: 0.008,
      });
    }
    noiseBurst(audio, out, { start: t, duration: 0.16, type: 'lowpass', frequency: 900, gain: 0.15 * level, attack: 0.03 });
  },
};

/**
 * Plays one synthesized footstep. Omit `at` for the player's own steps; pass a position for
 * steps that come from somewhere else.
 */
export function playFootstep(audio: AudioManager, surface: Surface, options: { at?: Point3; level?: number } = {}): void {
  const output = audio.output({ bus: 'sfx', volume: 0.6, ...(options.at ? { at: options.at } : {}) });
  recipes[surface](audio, output.input, audio.now + 0.005, vary(options.level ?? 1, 0.15));
  setTimeout(() => output.release(0), 600);
}
