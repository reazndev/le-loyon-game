import type { AudioManager, Bus, Point3 } from '../audio/audioManager';
import { noiseBurst } from '../audio/generators';

/** Procedural sounds the animals make. Every call plays once from a point in the world. */

export interface ToneOptions {
  type?: OscillatorType;
  frequency: number;
  /** Frequency to glide to by the end. */
  to?: number;
  start: number;
  duration: number;
  gain: number;
  attack?: number;
}

/** One enveloped oscillator note, the tonal partner of `noiseBurst`. */
export function tone(audio: AudioManager, destination: AudioNode, options: ToneOptions): void {
  const ctx = audio.context;
  const end = options.start + options.duration;
  const oscillator = new OscillatorNode(ctx, { type: options.type ?? 'sine', frequency: options.frequency });
  if (options.to) oscillator.frequency.exponentialRampToValueAtTime(options.to, end);
  const envelope = new GainNode(ctx, { gain: 0 });
  const attack = options.attack ?? 0.004;
  envelope.gain.setValueAtTime(0, options.start);
  envelope.gain.linearRampToValueAtTime(options.gain, options.start + attack);
  envelope.gain.exponentialRampToValueAtTime(0.0001, end);
  oscillator.connect(envelope).connect(destination);
  oscillator.start(options.start);
  oscillator.stop(end + 0.05);
}

export interface OneShot {
  at?: Point3;
  volume?: number;
  bus?: Bus;
}

/**
 * Opens an output for a one-shot sound, runs `build` with its input node and the start time,
 * and releases the output after `seconds`.
 */
export function oneShot(audio: AudioManager, options: OneShot, seconds: number, build: (out: AudioNode, t: number) => void): void {
  const output = audio.output({
    bus: options.bus ?? 'sfx',
    volume: options.volume ?? 1,
    ...(options.at ? { at: options.at, refDistance: 2 } : {}),
  });
  build(output.input, audio.now + 0.01);
  setTimeout(() => output.release(0.05), seconds * 1000);
}

const vary = (value: number, amount = 0.08) => value * (1 + (Math.random() - 0.5) * 2 * amount);

/** Bari's collar bell: a small brass bell, two or three quick knocks of the clapper. */
export function collarBell(audio: AudioManager, options: OneShot = {}): void {
  oneShot(audio, { volume: 0.35, ...options }, 1, (out, t) => {
    const hits = 1 + Math.floor(Math.random() * 3);
    for (let i = 0; i < hits; i++) {
      const at = t + i * vary(0.07, 0.4);
      const level = 0.5 + Math.random() * 0.5;
      [2650, 3980, 5710].forEach((f, n) => tone(audio, out, { frequency: vary(f, 0.01), start: at, duration: 0.35 - n * 0.08, gain: (0.22 / (n + 1)) * level }));
    }
  });
}

/** A Swiss cowbell on a moving heifer: a dull, inharmonic clank. */
export function cowbell(audio: AudioManager, options: OneShot = {}): void {
  oneShot(audio, { volume: 0.4, ...options }, 1.6, (out, t) => {
    noiseBurst(audio, out, { start: t, duration: 0.02, type: 'bandpass', frequency: 1800, q: 2, gain: 0.25 });
    [412, 618, 1031, 1497].forEach((f, n) =>
      tone(audio, out, { type: n ? 'sine' : 'triangle', frequency: vary(f, 0.01), start: t, duration: 1.2 - n * 0.2, gain: 0.2 / (n + 1) }),
    );
  });
}

const BARK_URL = `${import.meta.env.BASE_URL}assets/audio/bark.ogg`;

/** Fetches the bark ahead of time, for a scene where the first one has to land on cue. */
export function preloadBark(audio: AudioManager): void {
  audio.load(BARK_URL).catch(() => undefined);
}

/** One deep bark from an old dog, a recording played a little faster or slower each time. */
export function bark(audio: AudioManager, options: OneShot = {}): void {
  audio.play(BARK_URL, {
    bus: options.bus ?? 'sfx',
    volume: options.volume ?? 0.9,
    rate: vary(0.95, 0.06),
    ...(options.at ? { at: options.at, refDistance: 2 } : {}),
  });
}

/** A long low growl, rough and close to the ground. */
export function growl(audio: AudioManager, options: OneShot = {}): void {
  oneShot(audio, { volume: 0.7, ...options }, 1.8, (out, t) => {
    const ctx = audio.context;
    const rough = new GainNode(ctx, { gain: 0.6 });
    const flutter = new OscillatorNode(ctx, { frequency: 23 });
    flutter.connect(new GainNode(ctx, { gain: 0.4 })).connect(rough.gain);
    flutter.start(t);
    flutter.stop(t + 1.6);
    const low = new BiquadFilterNode(ctx, { type: 'lowpass', frequency: 420 });
    rough.connect(low).connect(out);
    tone(audio, rough, { type: 'sawtooth', frequency: 88, to: 80, start: t, duration: 1.4, gain: 0.5, attack: 0.25 });
    noiseBurst(audio, rough, { start: t, duration: 1.3, type: 'lowpass', frequency: 300, gain: 0.35, attack: 0.3 });
  });
}
