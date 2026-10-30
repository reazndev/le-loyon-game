import type { AudioManager, Point3 } from '../../engine/audio/audioManager';
import { noiseBurst } from '../../engine/audio/generators';
import { oneShot, tone } from '../../engine/characters/voices';

/** The farm's animals and what they rattle: a cow lowing in the shed, hens in their run, the dog's chain, loose iron. */

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

/** A dog chain dragged a little way over stone: a run of small dull clinks. */
export function chainRattle(audio: AudioManager, at: Point3, volume = 0.3): void {
  const links = 4 + Math.floor(Math.random() * 5);
  oneShot(audio, { at, volume, bus: 'ambience' }, links * 0.09 + 0.5, (out, t) => {
    for (let i = 0; i < links; i++) {
      const s = t + i * vary(0.07, 0.5);
      noiseBurst(audio, out, { start: s, duration: 0.03, type: 'bandpass', frequency: vary(3600, 0.25), q: 6, gain: 0.35 * (1 - i / (links + 2)) });
      tone(audio, out, { frequency: vary(2300, 0.2), start: s, duration: 0.05, gain: 0.03 });
    }
  });
}

/** A loose sheet of corrugated iron knocking against the boards it hangs on: a hollow, rattling bong. */
export function tinKnock(audio: AudioManager, at: Point3, volume = 0.4): void {
  oneShot(audio, { at, volume, bus: 'ambience' }, 1.4, (out, t) => {
    noiseBurst(audio, out, { start: t, duration: 0.08, type: 'lowpass', frequency: 900, gain: 0.5 });
    [168, 391, 655, 1012].forEach((f, n) => tone(audio, out, { type: n ? 'sine' : 'triangle', frequency: vary(f, 0.03), start: t, duration: 0.9 - n * 0.15, gain: 0.12 / (n + 1) }));
    // It settles back against the wall a beat later.
    if (Math.random() < 0.6) noiseBurst(audio, out, { start: t + vary(0.22, 0.3), duration: 0.05, type: 'bandpass', frequency: 700, q: 2, gain: 0.25 });
  });
}

/** A cow blowing hard through her nose: a wet rush of air and a flutter of the nostrils. */
export function snort(audio: AudioManager, at: Point3, volume = 0.7): void {
  oneShot(audio, { at, volume }, 1.2, (out, t) => {
    noiseBurst(audio, out, { start: t, duration: vary(0.45), type: 'bandpass', frequency: vary(700), q: 0.9, gain: 0.8, attack: 0.03 });
    for (let i = 0; i < 5; i++) noiseBurst(audio, out, { start: t + 0.05 + i * 0.05, duration: 0.03, type: 'lowpass', frequency: 300, gain: 0.35 });
  });
}

/** A cow breathing out and in, slow and deep, close by: no filter, no rasp, just a big animal. */
export function cowBreath(audio: AudioManager, at: Point3, volume = 0.45): void {
  oneShot(audio, { at, volume }, 3.4, (out, t) => {
    noiseBurst(audio, out, { start: t, duration: 1.3, type: 'lowpass', frequency: vary(420), gain: 0.6, attack: 0.25 });
    noiseBurst(audio, out, { start: t + 1.7, duration: 1.2, type: 'lowpass', frequency: vary(300), gain: 0.35, attack: 0.5 });
  });
}

/** Hens woken in the dark: squawks over each other, rising and breaking, for a few seconds. */
export function henPanic(audio: AudioManager, at: Point3, volume = 0.9): void {
  oneShot(audio, { at, volume, bus: 'sfx' }, 4, (out, t) => {
    for (let i = 0; i < 14; i++) {
      const s = t + Math.random() * 2.8;
      const pitch = vary(900, 0.25);
      tone(audio, out, { type: 'square', frequency: pitch, to: pitch * vary(1.4, 0.2), start: s, duration: vary(0.18, 0.4), gain: 0.07, attack: 0.01 });
      noiseBurst(audio, out, { start: s, duration: 0.12, type: 'bandpass', frequency: vary(2200), q: 2, gain: 0.3 });
    }
  });
}
