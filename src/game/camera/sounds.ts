import type { AudioManager } from '../../engine/audio/audioManager';
import { noiseBurst, thump } from '../../engine/audio/generators';

/** Procedural sounds of a late-80s Polaroid 600: the flash charging, the shutter, and the film motor. */

/** The thin rising whine of the flash capacitor charging when the camera comes up. */
export function flashCharge(audio: AudioManager): void {
  const ctx = audio.context;
  const output = audio.output({ bus: 'sfx', volume: 0.05 });
  const tone = new OscillatorNode(ctx, { type: 'sine', frequency: 2400 });
  const envelope = new GainNode(ctx, { gain: 0 });
  const t = audio.now;
  tone.frequency.exponentialRampToValueAtTime(7200, t + 1.1);
  envelope.gain.linearRampToValueAtTime(1, t + 0.15);
  envelope.gain.setValueAtTime(1, t + 0.9);
  envelope.gain.linearRampToValueAtTime(0, t + 1.2);
  tone.connect(envelope).connect(output.input);
  tone.start(t);
  tone.stop(t + 1.25);
  setTimeout(() => output.release(0), 1400);
}

/** The shutter: a hard plastic snap, then the flash tube's tick. */
export function shutter(audio: AudioManager): void {
  const output = audio.output({ bus: 'sfx', volume: 0.7 });
  const t = audio.now;
  noiseBurst(audio, output.input, { start: t, duration: 0.018, type: 'bandpass', frequency: 2600, q: 1.6, gain: 1 });
  noiseBurst(audio, output.input, { start: t + 0.012, duration: 0.05, type: 'lowpass', frequency: 900, gain: 0.5 });
  thump(audio, output.input, t + 0.004, 220, 0.35);
  noiseBurst(audio, output.input, { start: t + 0.03, duration: 0.008, type: 'highpass', frequency: 6000, gain: 0.35 });
  setTimeout(() => output.release(0), 400);
}

/**
 * The motor pushing the print out of the slot: a geared buzz that rises as it starts, a scrape of
 * paper on the rollers, and a clunk when the print drops free.
 */
export function filmMotor(audio: AudioManager, seconds = 1.3): void {
  const ctx = audio.context;
  const output = audio.output({ bus: 'sfx', volume: 0.32 });
  const t = audio.now;
  const end = t + seconds;

  const gearFilter = new BiquadFilterNode(ctx, { type: 'bandpass', frequency: 900, Q: 1.2 });
  const level = new GainNode(ctx, { gain: 0 });
  gearFilter.connect(level).connect(output.input);
  level.gain.linearRampToValueAtTime(0.9, t + 0.08);
  level.gain.setValueAtTime(0.9, end - 0.12);
  level.gain.linearRampToValueAtTime(0, end);

  const motor = new OscillatorNode(ctx, { type: 'sawtooth', frequency: 70 });
  motor.frequency.linearRampToValueAtTime(118, t + 0.25);
  motor.frequency.linearRampToValueAtTime(124, end);
  const teeth = new OscillatorNode(ctx, { type: 'square', frequency: 520 });
  teeth.frequency.linearRampToValueAtTime(860, t + 0.25);
  const teethLevel = new GainNode(ctx, { gain: 0.18 });
  motor.connect(gearFilter);
  teeth.connect(teethLevel).connect(gearFilter);
  // The gear noise wavers a little, as a cheap motor does under load.
  const wobble = new OscillatorNode(ctx, { frequency: 13 });
  wobble.connect(new GainNode(ctx, { gain: 0.25 })).connect(level.gain);
  [motor, teeth, wobble].forEach((node) => {
    node.start(t);
    node.stop(end + 0.05);
  });

  noiseBurst(audio, output.input, { start: t + 0.1, duration: seconds - 0.2, type: 'bandpass', frequency: 3200, q: 0.8, gain: 0.12, attack: 0.1 });
  thump(audio, output.input, end, 140, 0.6);
  noiseBurst(audio, output.input, { start: end, duration: 0.03, type: 'bandpass', frequency: 1400, q: 2, gain: 0.5 });
  setTimeout(() => output.release(0), (seconds + 0.5) * 1000);
}
