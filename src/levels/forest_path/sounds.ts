import type { AudioManager, Point3, SoundHandle } from '../../engine/audio/audioManager';
import { noiseBurst, thump } from '../../engine/audio/generators';
import { oneShot, tone } from '../../engine/characters/voices';

/** Sounds of the Bois-Noir and the fort that the shared palette doesn't have. */

function loopNoise(audio: AudioManager): AudioBufferSourceNode {
  const source = audio.context.createBufferSource();
  source.buffer = audio.noise;
  source.loop = true;
  source.start(audio.now, Math.random() * 2);
  return source;
}

function wobble(audio: AudioManager, frequency: number, depth: number, target: AudioParam): OscillatorNode {
  const oscillator = new OscillatorNode(audio.context, { frequency });
  oscillator.connect(new GainNode(audio.context, { gain: depth })).connect(target);
  oscillator.start();
  return oscillator;
}

/** Black water running fast over stones: a hiss and a low rush under it, no splashing. */
export function streamHiss(audio: AudioManager, at: Point3, volume = 0.45): SoundHandle {
  const ctx = audio.context;
  const output = audio.output({ bus: 'ambience', volume, at, refDistance: 2.2 });
  const hiss = new BiquadFilterNode(ctx, { type: 'bandpass', frequency: 2600, Q: 0.5 });
  const rush = new BiquadFilterNode(ctx, { type: 'lowpass', frequency: 380 });
  const level = new GainNode(ctx, { gain: 0.45 });
  const sources = [loopNoise(audio), loopNoise(audio)];
  sources[0]!.connect(hiss).connect(level).connect(output.input);
  sources[1]!.connect(rush).connect(new GainNode(ctx, { gain: 0.5 })).connect(output.input);
  const drift = [wobble(audio, 0.17, 0.08, level.gain), wobble(audio, 0.41, 500, hiss.frequency)];
  return {
    stop: (fade = 1) => {
      output.release(fade);
      [...sources, ...drift].forEach((node) => node.stop(audio.now + fade + 0.1));
    },
  };
}

/**
 * Air moving in the ventilation shafts of the fort: a low hum that swells and sinks. It might be
 * wind; it might be a machine nobody switched off.
 */
export function ventHum(audio: AudioManager, at: Point3, volume = 0.35): SoundHandle {
  const ctx = audio.context;
  const output = audio.output({ bus: 'ambience', volume, at, refDistance: 1.8 });
  const level = new GainNode(ctx, { gain: 0.5 });
  level.connect(output.input);
  const hum = new OscillatorNode(ctx, { type: 'triangle', frequency: 49 });
  const overtone = new OscillatorNode(ctx, { type: 'sine', frequency: 98.6 });
  hum.connect(new GainNode(ctx, { gain: 0.5 })).connect(level);
  overtone.connect(new GainNode(ctx, { gain: 0.12 })).connect(level);
  const air = new BiquadFilterNode(ctx, { type: 'bandpass', frequency: 300, Q: 1.2 });
  const noise = loopNoise(audio);
  noise.connect(air).connect(new GainNode(ctx, { gain: 0.6 })).connect(level);
  [hum, overtone].forEach((node) => node.start());
  const swell = wobble(audio, 0.07, 0.3, level.gain);
  return {
    stop: (fade = 1) => {
      output.release(fade);
      [hum, overtone, noise, swell].forEach((node) => node.stop(audio.now + fade + 0.1));
    },
  };
}

/**
 * Steel castors dragged over concrete: a long grinding screech that rises and catches. `length`
 * in seconds; the far echo of the escape hatch lid uses a short, faint one.
 */
export function castorScreech(audio: AudioManager, at: Point3, options: { volume?: number; length?: number } = {}): void {
  const length = options.length ?? 2.6;
  oneShot(audio, { at, volume: options.volume ?? 1 }, length + 2.5, (out, t) => {
    const ctx = audio.context;
    const voice = new OscillatorNode(ctx, { type: 'sawtooth', frequency: 690 });
    const judder = new OscillatorNode(ctx, { type: 'square', frequency: 11 });
    judder.connect(new GainNode(ctx, { gain: 70 })).connect(voice.frequency);
    voice.frequency.setValueAtTime(690, t);
    voice.frequency.linearRampToValueAtTime(980, t + length * 0.6);
    voice.frequency.linearRampToValueAtTime(860, t + length);
    const band = new BiquadFilterNode(ctx, { type: 'bandpass', frequency: 1700, Q: 4 });
    const envelope = new GainNode(ctx, { gain: 0 });
    envelope.gain.setValueAtTime(0, t);
    envelope.gain.linearRampToValueAtTime(0.22, t + 0.12);
    envelope.gain.setValueAtTime(0.22, t + length - 0.3);
    // The ring of it hangs in the concrete for a long time.
    envelope.gain.exponentialRampToValueAtTime(0.0005, t + length + 2.2);
    voice.connect(band).connect(envelope).connect(out);
    [voice, judder].forEach((node) => {
      node.start(t);
      node.stop(t + length + 2.3);
    });
    noiseBurst(audio, out, { start: t, duration: length, type: 'lowpass', frequency: 260, gain: 0.35, attack: 0.1 });
  });
}

/** A fist on an empty fuel drum: a deep boom that rings like a church bell. */
export function drumBoom(audio: AudioManager, at: Point3): void {
  oneShot(audio, { at, volume: 1.2 }, 4.5, (out, t) => {
    thump(audio, out, t, 70, 1);
    [82, 131, 197, 263].forEach((frequency, n) => tone(audio, out, { frequency, start: t, duration: 4 - n * 0.7, gain: 0.16 / (n + 1), attack: 0.005 }));
  });
}

/** One mask sliding off the heap: rubber and tin rattling down, then a soft knock on the floor. */
export function maskSlide(audio: AudioManager, at: Point3): void {
  oneShot(audio, { at, volume: 0.8 }, 1.6, (out, t) => {
    for (let i = 0; i < 7; i++) {
      noiseBurst(audio, out, { start: t + i * 0.07 + Math.random() * 0.03, duration: 0.03, type: 'bandpass', frequency: 1800 + Math.random() * 1600, q: 3, gain: 0.25 });
    }
    noiseBurst(audio, out, { start: t, duration: 0.5, type: 'bandpass', frequency: 600, q: 0.8, gain: 0.12, attack: 0.05 });
    thump(audio, out, t + 0.55, 130, 0.45);
  });
}

/** A heavy steel door pulled shut somewhere behind: the boom and the latch. */
export function steelDoorShut(audio: AudioManager, at: Point3, volume = 0.7): void {
  oneShot(audio, { at, volume }, 2.5, (out, t) => {
    thump(audio, out, t, 60, 1);
    noiseBurst(audio, out, { start: t, duration: 0.3, type: 'lowpass', frequency: 500, gain: 0.6 });
    noiseBurst(audio, out, { start: t + 0.35, duration: 0.03, type: 'bandpass', frequency: 2200, q: 4, gain: 0.35 });
  });
}

/** A foot in shallow water on concrete. */
export function splash(audio: AudioManager, at: Point3, volume = 0.5): void {
  oneShot(audio, { at, volume }, 0.6, (out, t) => {
    noiseBurst(audio, out, { start: t, duration: 0.12, type: 'bandpass', frequency: 1200 + Math.random() * 500, q: 1.2, gain: 0.5, attack: 0.01 });
    noiseBurst(audio, out, { start: t + 0.06, duration: 0.25, type: 'highpass', frequency: 3000, gain: 0.12, attack: 0.03 });
  });
}

/** The hatch wheel turning on a rusted thread, then the lid lifting. */
export function hatchWheel(audio: AudioManager, at: Point3): void {
  oneShot(audio, { at, volume: 0.8 }, 2.4, (out, t) => {
    [0, 0.35, 0.7, 1.05].forEach((delay) =>
      noiseBurst(audio, out, { start: t + delay, duration: 0.22, type: 'bandpass', frequency: 900 + delay * 300, q: 6, gain: 0.35, attack: 0.04 }),
    );
    thump(audio, out, t + 1.6, 110, 0.5);
  });
}

/** A candle flame in still air: a faint, uneven flutter, the only sound in Marc's room. */
export function candleFlutter(audio: AudioManager, at: Point3, volume = 0.18): SoundHandle {
  const ctx = audio.context;
  const output = audio.output({ bus: 'ambience', volume, at, refDistance: 1 });
  const breath = new BiquadFilterNode(ctx, { type: 'lowpass', frequency: 240 });
  const level = new GainNode(ctx, { gain: 0.4 });
  const noise = loopNoise(audio);
  noise.connect(breath).connect(level).connect(output.input);
  const flicker = [wobble(audio, 5.3, 0.18, level.gain), wobble(audio, 0.7, 0.15, level.gain)];
  return {
    stop: (fade = 1) => {
      output.release(fade);
      [noise, ...flicker].forEach((node) => node.stop(audio.now + fade + 0.1));
    },
  };
}
