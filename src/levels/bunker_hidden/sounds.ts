import type { AudioManager, Point3, SoundHandle } from '../../engine/audio/audioManager';
import { tvMurmur } from '../inn/sounds';

/**
 * A transistor radio left on, almost between stations: static that swells and thins as the
 * signal drifts, and under it a voice or two too far off to make out. Under a metre of concrete
 * it never quite tunes in.
 */
export function radioStatic(audio: AudioManager, at: Point3, volume = 0.1): SoundHandle {
  const ctx = audio.context;
  const output = audio.output({ bus: 'ambience', volume, at, refDistance: 0.6 });
  const noise = ctx.createBufferSource();
  noise.buffer = audio.noise;
  noise.loop = true;
  noise.start(audio.now, Math.random() * 2);
  const band = new BiquadFilterNode(ctx, { type: 'bandpass', frequency: 1800, Q: 0.8 });
  const level = new GainNode(ctx, { gain: 0.35 });
  noise.connect(band).connect(level).connect(output.input);
  // Two slow, unrelated drifts so the static never settles into a pattern.
  const drift = (frequency: number, depth: number, target: AudioParam) => {
    const oscillator = new OscillatorNode(ctx, { frequency });
    oscillator.connect(new GainNode(ctx, { gain: depth })).connect(target);
    oscillator.start();
    return oscillator;
  };
  const drifts = [drift(0.05, 0.2, level.gain), drift(0.13, 600, band.frequency)];
  const voices = tvMurmur(audio, at, volume * 0.5);
  return {
    stop: (fade = 1) => {
      voices.stop(fade);
      output.release(fade);
      [noise, ...drifts].forEach((node) => node.stop(audio.now + fade + 0.1));
    },
  };
}
