import type { AudioManager, Point3 } from '../../engine/audio/audioManager';
import { noiseBurst, thump } from '../../engine/audio/generators';
import { oneShot, tone } from '../../engine/characters/voices';

/** The tower clock's escapement letting go: one heavy mechanical click through the vault. */
export function towerClick(audio: AudioManager, at: Point3): void {
  oneShot(audio, { at, volume: 0.9 }, 2.5, (out, t) => {
    thump(audio, out, t, 70, 0.9);
    noiseBurst(audio, out, { start: t, duration: 0.03, type: 'bandpass', frequency: 900, q: 3, gain: 0.9 });
    noiseBurst(audio, out, { start: t + 0.04, duration: 0.02, type: 'bandpass', frequency: 1500, q: 4, gain: 0.4 });
    // The nave rings faintly after it.
    noiseBurst(audio, out, { start: t + 0.05, duration: 1.6, type: 'bandpass', frequency: 420, q: 6, gain: 0.05, attack: 0.05 });
  });
}

/** The hour bell: a click, then `strokes` slow strokes, loud, with a long hum under each. */
export function towerBell(audio: AudioManager, at: Point3, strokes: number): void {
  towerClick(audio, at);
  oneShot(audio, { at, volume: 1.6 }, 2 + strokes * 2.2 + 6, (out, t) => {
    for (let i = 0; i < strokes; i++) {
      const s = t + 1.6 + i * 2.2;
      noiseBurst(audio, out, { start: s, duration: 0.04, type: 'bandpass', frequency: 2400, q: 2, gain: 0.5 });
      // A church bell's partials: hum, prime, minor third, fifth, octave.
      [
        [196, 0.32, 6],
        [392, 0.4, 4.5],
        [466, 0.22, 3.5],
        [587, 0.14, 2.5],
        [784, 0.12, 2],
      ].forEach(([frequency, gain, duration]) => tone(audio, out, { frequency: frequency!, start: s, duration: duration!, gain: gain!, attack: 0.003 }));
    }
  });
}

/** Old wood taking someone's weight: a slow creak and a settle. */
export function woodCreak(audio: AudioManager, at: Point3): void {
  oneShot(audio, { at, volume: 0.55 }, 2, (out, t) => {
    tone(audio, out, { type: 'sawtooth', frequency: 92, to: 71, start: t, duration: 0.55, gain: 0.05, attack: 0.15 });
    noiseBurst(audio, out, { start: t, duration: 0.5, type: 'bandpass', frequency: 640, q: 14, gain: 0.25, attack: 0.18 });
    noiseBurst(audio, out, { start: t + 0.62, duration: 0.05, type: 'lowpass', frequency: 300, gain: 0.35 });
  });
}
