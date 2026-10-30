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
