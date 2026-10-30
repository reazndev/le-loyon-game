import type { AudioManager, Point3, SoundHandle } from '../../engine/audio/audioManager';

/** The flat's own sound: the computer. Rain and the fridge come from `src/game/ambient`. */

function loopNoise(audio: AudioManager): AudioBufferSourceNode {
  const source = audio.context.createBufferSource();
  source.buffer = audio.noise;
  source.loop = true;
  source.start(audio.now, Math.random() * 2);
  return source;
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

/** A car idling in the street below, through the glass: a low, loping burble that fades in. */
export function carIdle(audio: AudioManager, at: Point3, volume = 0.3): SoundHandle {
  const ctx = audio.context;
  const output = audio.output({ bus: 'ambience', volume, at, refDistance: 6 });
  output.input.gain.setValueAtTime(0, audio.now);
  output.input.gain.linearRampToValueAtTime(volume, audio.now + 2);
  const engine = new OscillatorNode(ctx, { type: 'sawtooth', frequency: 27 });
  const lope = new OscillatorNode(ctx, { frequency: 1.3 });
  lope.connect(new GainNode(ctx, { gain: 1.5 })).connect(engine.frequency);
  engine
    .connect(new GainNode(ctx, { gain: 0.4 }))
    .connect(new BiquadFilterNode(ctx, { type: 'lowpass', frequency: 260, Q: 0.7 }))
    .connect(output.input);
  [engine, lope].forEach((node) => node.start());
  return {
    stop: (fade = 0.5) => {
      output.release(fade);
      [engine, lope].forEach((node) => node.stop(audio.now + fade + 0.1));
    },
  };
}
