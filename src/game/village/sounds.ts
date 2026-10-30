import type { AudioManager, Point3 } from '../../engine/audio/audioManager';
import { noiseBurst, thump } from '../../engine/audio/generators';
import { oneShot, tone } from '../../engine/characters/voices';

/** Sounds the people in the street make with what they carry. All synthesized; nothing in the audio folder fits. */

const vary = (value: number, amount = 0.15) => value * (1 + (Math.random() - 0.5) * 2 * amount);

/** A stiff broom across a stone step: two or three scrapes. */
export function broomStroke(audio: AudioManager, at: Point3, volume = 0.35): void {
  oneShot(audio, { at, volume, bus: 'ambience' }, 1.4, (out, t) => {
    const strokes = 2 + Math.floor(Math.random() * 2);
    for (let i = 0; i < strokes; i++) {
      noiseBurst(audio, out, { start: t + i * vary(0.38), duration: vary(0.22), type: 'bandpass', frequency: vary(3400), q: 0.8, gain: 0.5, attack: 0.06 });
    }
  });
}

/** A bicycle bell, two rings of the thumb lever. */
export function bicycleBell(audio: AudioManager, at: Point3, volume = 0.45): void {
  oneShot(audio, { at, volume, bus: 'ambience' }, 1.6, (out, t) => {
    [0, 0.22].forEach((delay) => [3100, 4650, 6900].forEach((f, n) => tone(audio, out, { frequency: vary(f, 0.01), start: t + delay, duration: 0.7 - n * 0.2, gain: 0.12 / (n + 1) })));
  });
}

/** The freewheel of a bicycle coasting: a run of fine dry ticks that slows. */
export function freewheel(audio: AudioManager, at: Point3, volume = 0.3): void {
  oneShot(audio, { at, volume, bus: 'ambience' }, 1.8, (out, t) => {
    let time = t;
    for (let gap = 0.035; gap < 0.12; gap *= 1.08) {
      noiseBurst(audio, out, { start: time, duration: 0.006, type: 'highpass', frequency: 5200, gain: 0.35 });
      time += gap;
    }
  });
}

/** A barrow's dry wheel bearing, one squeak per turn, and a knock over a cobble now and then. */
export function barrowSqueak(audio: AudioManager, at: Point3, volume = 0.25): void {
  oneShot(audio, { at, volume, bus: 'ambience' }, 0.6, (out, t) => {
    tone(audio, out, { type: 'triangle', frequency: vary(1150, 0.05), to: vary(980, 0.05), start: t, duration: 0.16, gain: 0.08, attack: 0.03 });
    if (Math.random() < 0.3) thump(audio, out, t + 0.1, 180, 0.3);
  });
}
