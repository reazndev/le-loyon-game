import type { AudioManager, Point3 } from '../../engine/audio/audioManager';
import { noiseBurst } from '../../engine/audio/generators';
import { oneShot, tone } from '../../engine/characters/voices';

/** The farm's animals: a cow lowing in the shed, hens muttering in their run. */

const vary = (value: number, amount = 0.1) => value * (1 + (Math.random() - 0.5) * 2 * amount);

/** One long low moo: a nasal start through closed lips, then the mouth opens and the pitch sags. */
export function moo(audio: AudioManager, at: Point3, volume = 0.6): void {
  const length = vary(1.6, 0.25);
  oneShot(audio, { at, volume }, length + 0.6, (out, t) => {
    const ctx = audio.context;
    const mouth = new BiquadFilterNode(ctx, { type: 'bandpass', frequency: 320, Q: 1.4 });
    mouth.frequency.setValueAtTime(320, t);
    mouth.frequency.linearRampToValueAtTime(720, t + length * 0.35);
    mouth.frequency.linearRampToValueAtTime(480, t + length);
    mouth.connect(out);
    const pitch = vary(118, 0.12);
    tone(audio, mouth, { type: 'sawtooth', frequency: pitch * 1.15, to: pitch * 0.82, start: t, duration: length, gain: 0.5, attack: 0.25 });
    tone(audio, mouth, { type: 'sawtooth', frequency: pitch * 2.3, to: pitch * 1.66, start: t, duration: length * 0.9, gain: 0.12, attack: 0.3 });
    noiseBurst(audio, mouth, { start: t + 0.1, duration: length * 0.8, type: 'bandpass', frequency: 500, q: 1, gain: 0.08, attack: 0.3 });
  });
}

/** A hen muttering: two to five short clucks. */
export function cluck(audio: AudioManager, at: Point3, volume = 0.3): void {
  const count = 2 + Math.floor(Math.random() * 4);
  oneShot(audio, { at, volume }, count * 0.2 + 0.4, (out, t) => {
    for (let i = 0; i < count; i++) {
      const s = t + i * vary(0.16, 0.3);
      const pitch = vary(620, 0.15);
      tone(audio, out, { type: 'square', frequency: pitch, to: pitch * 0.7, start: s, duration: 0.06, gain: 0.08, attack: 0.005 });
      noiseBurst(audio, out, { start: s, duration: 0.05, type: 'bandpass', frequency: vary(1500), q: 3, gain: 0.25 });
    }
  });
}
