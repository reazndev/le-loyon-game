import type { AudioManager, Bus, Point3, SoundHandle } from './audioManager';

/** Procedural ambience, so scenes have sound before any recordings exist. */

export interface GeneratorOptions {
  volume?: number;
  bus?: Bus;
}

function loopNoise(audio: AudioManager): AudioBufferSourceNode {
  const source = audio.context.createBufferSource();
  source.buffer = audio.noise;
  source.loop = true;
  source.start(audio.now, Math.random() * 2);
  return source;
}

function lfo(audio: AudioManager, frequency: number, depth: number, target: AudioParam): OscillatorNode {
  const oscillator = new OscillatorNode(audio.context, { frequency });
  oscillator.connect(new GainNode(audio.context, { gain: depth })).connect(target);
  oscillator.start();
  return oscillator;
}

function stopAll(nodes: AudioScheduledSourceNode[], when: number): void {
  nodes.forEach((node) => node.stop(when));
}

/** Gusting wind: band-passed noise with slow, uneven swells, plus a faint whistle. */
export function wind(audio: AudioManager, options: GeneratorOptions = {}): SoundHandle {
  const volume = options.volume ?? 0.5;
  const output = audio.output({ bus: options.bus ?? 'ambience', volume });
  const ctx = audio.context;

  const body = new BiquadFilterNode(ctx, { type: 'bandpass', frequency: 420, Q: 0.5 });
  const bodyGain = new GainNode(ctx, { gain: 0.55 });
  const whistle = new BiquadFilterNode(ctx, { type: 'bandpass', frequency: 760, Q: 9 });
  const whistleGain = new GainNode(ctx, { gain: 0.07 });
  loopNoise(audio).connect(body).connect(bodyGain).connect(output.input);
  loopNoise(audio).connect(whistle).connect(whistleGain).connect(output.input);

  // Detuned slow oscillators sum to gusts that never quite repeat.
  const sources = [
    lfo(audio, 0.071, 260, body.frequency),
    lfo(audio, 0.113, 0.22, bodyGain.gain),
    lfo(audio, 0.047, 0.18, bodyGain.gain),
    lfo(audio, 0.089, 180, whistle.frequency),
    lfo(audio, 0.061, 0.05, whistleGain.gain),
  ];
  return {
    stop: (fade = 1) => {
      output.release(fade);
      stopAll(sources, audio.now + fade + 0.1);
    },
  };
}

/** A low, distant drone that slowly breathes. */
export function drone(audio: AudioManager, options: GeneratorOptions = {}): SoundHandle {
  const output = audio.output({ bus: options.bus ?? 'ambience', volume: options.volume ?? 0.3 });
  const ctx = audio.context;
  const filter = new BiquadFilterNode(ctx, { type: 'lowpass', frequency: 150, Q: 0.8 });
  const level = new GainNode(ctx, { gain: 0.5 });
  filter.connect(level).connect(output.input);

  const tones = [
    new OscillatorNode(ctx, { type: 'sawtooth', frequency: 38.9 }),
    new OscillatorNode(ctx, { type: 'sawtooth', frequency: 39.3 }),
    new OscillatorNode(ctx, { type: 'triangle', frequency: 58.2 }),
  ];
  tones.forEach((tone) => {
    tone.connect(filter);
    tone.start();
  });
  const sources = [...tones, lfo(audio, 0.031, 0.2, level.gain), lfo(audio, 0.053, 45, filter.frequency)];
  return {
    stop: (fade = 2) => {
      output.release(fade);
      stopAll(sources, audio.now + fade + 0.1);
    },
  };
}

export interface CrackleOptions extends GeneratorOptions {
  /** Average seconds between bursts. */
  interval?: number;
  /** Nearest and farthest distance of each burst from the listener, in meters. */
  distance?: [number, number];
}

/**
 * Random crackles and twig snaps placed around the listener: the sounds of something moving
 * just out of sight.
 */
export function crackle(audio: AudioManager, options: CrackleOptions = {}): SoundHandle {
  const interval = options.interval ?? 5;
  const [near, far] = options.distance ?? [3, 14];
  let timer: ReturnType<typeof setTimeout> | null = null;

  const schedule = () => {
    // Exponential gaps make bursts arrive in uneven clumps, like real forest noise.
    const wait = -Math.log(1 - Math.random()) * interval;
    timer = setTimeout(() => {
      const angle = Math.random() * Math.PI * 2;
      const distance = near + Math.random() * (far - near);
      const at: Point3 = {
        x: audio.listenerPosition.x + Math.cos(angle) * distance,
        y: audio.listenerPosition.y - 1.2,
        z: audio.listenerPosition.z + Math.sin(angle) * distance,
      };
      crackleBurst(audio, at, options.volume ?? 0.6, options.bus ?? 'ambience');
      schedule();
    }, wait * 1000);
  };
  schedule();
  return {
    stop: () => {
      if (timer) clearTimeout(timer);
    },
  };
}

function crackleBurst(audio: AudioManager, at: Point3, volume: number, bus: Bus): void {
  const output = audio.output({ bus, volume, at, refDistance: 2 });
  const snap = Math.random() < 0.25;
  const clicks = snap ? 1 + Math.floor(Math.random() * 2) : 2 + Math.floor(Math.random() * 6);
  for (let i = 0; i < clicks; i++) {
    noiseBurst(audio, output.input, {
      start: audio.now + i * (0.02 + Math.random() * 0.09),
      duration: snap ? 0.03 + Math.random() * 0.03 : 0.004 + Math.random() * 0.02,
      type: 'bandpass',
      frequency: snap ? 700 + Math.random() * 700 : 1800 + Math.random() * 4000,
      q: snap ? 3 : 1.5,
      gain: (snap ? 1 : 0.4) * (0.5 + Math.random() * 0.5),
    });
  }
  setTimeout(() => output.release(0), 1000);
}

export interface BurstOptions {
  start: number;
  duration: number;
  type: BiquadFilterType;
  frequency: number;
  q?: number;
  gain: number;
  /** Seconds to reach full level. */
  attack?: number;
}

/** A short burst of filtered noise. The building block for clicks, steps, and rustles. */
export function noiseBurst(audio: AudioManager, destination: AudioNode, burst: BurstOptions): void {
  const ctx = audio.context;
  const source = ctx.createBufferSource();
  source.buffer = audio.noise;
  const filter = new BiquadFilterNode(ctx, { type: burst.type, frequency: burst.frequency, Q: burst.q ?? 1 });
  const envelope = new GainNode(ctx, { gain: 0 });
  const attack = burst.attack ?? 0.002;
  envelope.gain.setValueAtTime(0, burst.start);
  envelope.gain.linearRampToValueAtTime(burst.gain, burst.start + attack);
  envelope.gain.exponentialRampToValueAtTime(0.0001, burst.start + attack + burst.duration);
  source.connect(filter).connect(envelope).connect(destination);
  source.start(burst.start, Math.random() * 1.5);
  source.stop(burst.start + attack + burst.duration + 0.05);
}

/** A short sine thump that drops in pitch, for heavy steps on hollow floors. */
export function thump(audio: AudioManager, destination: AudioNode, start: number, from: number, gain: number): void {
  const ctx = audio.context;
  const oscillator = new OscillatorNode(ctx, { frequency: from });
  const envelope = new GainNode(ctx, { gain: 0 });
  oscillator.frequency.exponentialRampToValueAtTime(from * 0.5, start + 0.09);
  envelope.gain.setValueAtTime(0, start);
  envelope.gain.linearRampToValueAtTime(gain, start + 0.004);
  envelope.gain.exponentialRampToValueAtTime(0.0001, start + 0.12);
  oscillator.connect(envelope).connect(destination);
  oscillator.start(start);
  oscillator.stop(start + 0.15);
}

/** A dry mechanical click, for switches such as the flashlight. */
export function click(audio: AudioManager, options: GeneratorOptions = {}): void {
  const output = audio.output({ bus: options.bus ?? 'sfx', volume: options.volume ?? 0.5 });
  noiseBurst(audio, output.input, { start: audio.now, duration: 0.012, type: 'bandpass', frequency: 3200, q: 2, gain: 0.8 });
  noiseBurst(audio, output.input, { start: audio.now + 0.03, duration: 0.01, type: 'bandpass', frequency: 2100, q: 2, gain: 0.4 });
  setTimeout(() => output.release(0), 300);
}
