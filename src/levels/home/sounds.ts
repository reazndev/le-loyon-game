import type { AudioManager, Point3, SoundHandle } from '../../engine/audio/audioManager';
import { noiseBurst, thump } from '../../engine/audio/generators';

/** The flat's own sounds: rain on the window, the fridge next door, and the computer. */

function loopNoise(audio: AudioManager): AudioBufferSourceNode {
  const source = audio.context.createBufferSource();
  source.buffer = audio.noise;
  source.loop = true;
  source.start(audio.now, Math.random() * 2);
  return source;
}

/** Steady rain against the glass, with single drops and a gutter dripping now and then. */
export function rain(audio: AudioManager, at: Point3): SoundHandle {
  const ctx = audio.context;
  const output = audio.output({ bus: 'ambience', volume: 0.5, at, refDistance: 1.2 });
  const hiss = loopNoise(audio);
  hiss
    .connect(new BiquadFilterNode(ctx, { type: 'highpass', frequency: 500 }))
    .connect(new BiquadFilterNode(ctx, { type: 'lowpass', frequency: 5200 }))
    .connect(new GainNode(ctx, { gain: 0.16 }))
    .connect(output.input);
  let stopped = false;
  const drops = () => {
    if (stopped) return;
    const start = audio.now + 0.02;
    for (let i = 0; i < 6; i++) {
      noiseBurst(audio, output.input, {
        start: start + Math.random() * 0.25,
        duration: 0.004 + Math.random() * 0.01,
        type: 'bandpass',
        frequency: 2500 + Math.random() * 4000,
        q: 2,
        gain: 0.15 + Math.random() * 0.35,
      });
    }
    if (Math.random() < 0.12) drip(audio, output.input, start + Math.random() * 0.2);
    setTimeout(drops, 250);
  };
  drops();
  return {
    stop: (fade = 1) => {
      stopped = true;
      output.release(fade);
      hiss.stop(audio.now + fade + 0.1);
    },
  };
}

function drip(audio: AudioManager, destination: AudioNode, start: number): void {
  const ctx = audio.context;
  const oscillator = new OscillatorNode(ctx, { frequency: 1500 + Math.random() * 600 });
  oscillator.frequency.exponentialRampToValueAtTime(900, start + 0.06);
  const envelope = new GainNode(ctx, { gain: 0 });
  envelope.gain.setValueAtTime(0, start);
  envelope.gain.linearRampToValueAtTime(0.08, start + 0.003);
  envelope.gain.exponentialRampToValueAtTime(0.0001, start + 0.12);
  oscillator.connect(envelope).connect(destination);
  oscillator.start(start);
  oscillator.stop(start + 0.15);
}

/**
 * The fridge in the kitchen through the wall: it shudders on, hums for half a minute, and
 * clunks off again.
 */
export function fridge(audio: AudioManager, at: Point3): SoundHandle {
  const ctx = audio.context;
  const output = audio.output({ bus: 'ambience', volume: 0.55, at, refDistance: 1.5 });
  const wall = new BiquadFilterNode(ctx, { type: 'lowpass', frequency: 260, Q: 0.7 });
  const level = new GainNode(ctx, { gain: 0 });
  wall.connect(output.input);
  level.connect(wall);
  const motors = [50, 100, 150].map((frequency, i) => {
    const oscillator = new OscillatorNode(ctx, { type: i ? 'sine' : 'sawtooth', frequency });
    oscillator.connect(new GainNode(ctx, { gain: [0.25, 0.5, 0.15][i] })).connect(level);
    oscillator.start();
    return oscillator;
  });
  let timer: ReturnType<typeof setTimeout>;
  const cycle = (on: boolean) => {
    const t = audio.now;
    thump(audio, wall, t, on ? 70 : 55, on ? 0.6 : 0.4);
    level.gain.cancelScheduledValues(t);
    level.gain.setValueAtTime(level.gain.value, t);
    level.gain.linearRampToValueAtTime(on ? 0.5 : 0, t + (on ? 0.6 : 0.25));
    const next = on ? 25 + Math.random() * 15 : 30 + Math.random() * 30;
    timer = setTimeout(() => cycle(!on), next * 1000);
  };
  timer = setTimeout(() => cycle(true), 6000 + Math.random() * 8000);
  return {
    stop: (fade = 1) => {
      clearTimeout(timer);
      output.release(fade);
      motors.forEach((motor) => motor.stop(audio.now + fade + 0.1));
    },
  };
}

/** The computer: a fan, a faint mains hum, and the CRT's high whine, quiet enough to half hear. */
export function computerHum(audio: AudioManager, at: Point3): SoundHandle {
  const ctx = audio.context;
  const output = audio.output({ bus: 'ambience', volume: 0.45, at, refDistance: 0.8 });
  const fan = loopNoise(audio);
  fan
    .connect(new BiquadFilterNode(ctx, { type: 'lowpass', frequency: 420, Q: 0.5 }))
    .connect(new GainNode(ctx, { gain: 0.12 }))
    .connect(output.input);
  const hum = new OscillatorNode(ctx, { frequency: 100 });
  hum.connect(new GainNode(ctx, { gain: 0.03 })).connect(output.input);
  // The line frequency of a PAL set, 15.625 kHz.
  const whine = new OscillatorNode(ctx, { frequency: 15625 });
  whine.connect(new GainNode(ctx, { gain: 0.008 })).connect(output.input);
  hum.start();
  whine.start();
  return {
    stop: (fade = 0.3) => {
      output.release(fade);
      [fan, hum, whine].forEach((node) => node.stop(audio.now + fade + 0.1));
    },
  };
}
