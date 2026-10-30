import type { AudioManager } from '../engine/audio/audioManager';
import { noiseBurst } from '../engine/audio/generators';
import { oneShot, tone } from '../engine/characters/voices';

const vary = (value: number, amount = 0.1) => value * (1 + (Math.random() - 0.5) * 2 * amount);

/**
 * One breath in and out through the mouth, in the reporter's own head. `effort` 0 is a tired
 * breath, 1 a winded gasp: louder, shorter, rougher, with a little voice on the way out.
 */
export function pant(audio: AudioManager, effort: number, seconds: number): void {
  const inhale = seconds * 0.4;
  const exhale = seconds * 0.55;
  oneShot(audio, { volume: 0.25 + effort * 0.45, bus: 'sfx' }, seconds + 0.5, (out, t) => {
    noiseBurst(audio, out, { start: t, duration: inhale, type: 'bandpass', frequency: vary(1500), q: 1.6, gain: 0.3, attack: inhale * 0.7 });
    noiseBurst(audio, out, { start: t + inhale, duration: exhale, type: 'bandpass', frequency: vary(800), q: 1.1, gain: 0.45, attack: 0.04 });
    if (effort > 0.6) tone(audio, out, { type: 'sawtooth', frequency: vary(115, 0.05), to: 95, start: t + inhale, duration: exhale * 0.7, gain: 0.02 * effort, attack: 0.05 });
  });
}

/** A long shaky breath out in the cold, the jaw trembling. */
export function shiver(audio: AudioManager): void {
  oneShot(audio, { volume: 0.32, bus: 'sfx' }, 3.2, (out, t) => {
    const shakes = 7 + Math.floor(Math.random() * 5);
    for (let i = 0; i < shakes; i++) {
      noiseBurst(audio, out, { start: t + i * 0.13, duration: 0.12, type: 'bandpass', frequency: vary(700), q: 1.2, gain: 0.35 * (1 - i / shakes / 1.5), attack: 0.03 });
    }
  });
}

/** A quick breath in through the teeth, or a sniff, against the cold. */
export function coldGasp(audio: AudioManager): void {
  const teeth = Math.random() < 0.5;
  oneShot(audio, { volume: 0.3, bus: 'sfx' }, 1, (out, t) => {
    if (teeth) noiseBurst(audio, out, { start: t, duration: 0.45, type: 'highpass', frequency: 3500, gain: 0.25, attack: 0.15 });
    else [0, 0.16].forEach((at) => noiseBurst(audio, out, { start: t + at, duration: 0.1, type: 'bandpass', frequency: 2200, q: 2, gain: 0.3, attack: 0.03 }));
  });
}
