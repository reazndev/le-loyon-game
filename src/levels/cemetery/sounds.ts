import type { AudioManager, Point3 } from '../../engine/audio/audioManager';
import { noiseBurst, thump } from '../../engine/audio/generators';
import { oneShot, tone } from '../../engine/characters/voices';

/** Sounds of the hill: the shovel, earth thrown back, crows, and water off the spruce. */

const vary = (value: number, amount = 0.1) => value * (1 + (Math.random() - 0.5) * 2 * amount);

/** The blade into wet earth, a grunt of breath, and the earth landing on the pile. */
export function shovelStroke(audio: AudioManager, at: Point3, volume = 1): void {
  oneShot(audio, { at, volume }, 1.6, (out, t) => {
    noiseBurst(audio, out, { start: t, duration: 0.16, type: 'bandpass', frequency: vary(900), q: 1.6, gain: 0.7, attack: 0.02 });
    noiseBurst(audio, out, { start: t + 0.04, duration: 0.05, type: 'highpass', frequency: 3200, gain: 0.25 });
    noiseBurst(audio, out, { start: t + 0.3, duration: 0.35, type: 'bandpass', frequency: 380, q: 2, gain: 0.18, attack: 0.08 });
    thump(audio, out, t + vary(0.85, 0.08), vary(110), 0.45);
    noiseBurst(audio, out, { start: t + 0.85, duration: 0.3, type: 'lowpass', frequency: 600, gain: 0.45, attack: 0.01 });
  });
}

/** Earth thrown back into a hole: quieter, a dull fall onto earth or wood. */
export function earthFall(audio: AudioManager, at: Point3, onWood: boolean): void {
  oneShot(audio, { at, volume: 0.7 }, 1.2, (out, t) => {
    noiseBurst(audio, out, { start: t, duration: 0.12, type: 'bandpass', frequency: 700, q: 1.2, gain: 0.35 });
    thump(audio, out, t + 0.35, onWood ? 150 : 90, onWood ? 0.6 : 0.4);
    noiseBurst(audio, out, { start: t + 0.35, duration: 0.4, type: 'lowpass', frequency: 500, gain: 0.5, attack: 0.02 });
  });
}

/** The lid coming up: a crack of old wood and screws giving. */
export function lidCrack(audio: AudioManager, at: Point3): void {
  oneShot(audio, { at, volume: 1 }, 1.4, (out, t) => {
    thump(audio, out, t, 140, 0.7);
    noiseBurst(audio, out, { start: t, duration: 0.08, type: 'bandpass', frequency: 1300, q: 3, gain: 0.9 });
    tone(audio, out, { type: 'sawtooth', frequency: 210, to: 160, start: t + 0.05, duration: 0.5, gain: 0.1 });
  });
}

/** A crow, two or three hoarse calls. */
export function caw(audio: AudioManager, at: Point3): void {
  const calls = 2 + Math.floor(Math.random() * 2);
  oneShot(audio, { at, volume: 0.55 }, calls * 0.5 + 0.4, (out, t) => {
    for (let i = 0; i < calls; i++) {
      const start = t + i * vary(0.42, 0.15);
      const pitch = vary(520, 0.06);
      tone(audio, out, { type: 'sawtooth', frequency: pitch, to: pitch * 0.78, start, duration: 0.26, gain: 0.12, attack: 0.02 });
      noiseBurst(audio, out, { start, duration: 0.24, type: 'bandpass', frequency: vary(1400), q: 2.5, gain: 0.3, attack: 0.02 });
    }
  });
}

/** Wings beating as a bird takes off. */
export function flap(audio: AudioManager, at: Point3): void {
  oneShot(audio, { at, volume: 0.6 }, 1.2, (out, t) => {
    for (let i = 0; i < 6; i++) {
      noiseBurst(audio, out, { start: t + i * vary(0.11, 0.1), duration: 0.06, type: 'bandpass', frequency: vary(500), q: 0.8, gain: 0.5 - i * 0.06 });
    }
  });
}
