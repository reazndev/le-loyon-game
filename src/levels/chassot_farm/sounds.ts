import type { AudioManager, Point3, SoundHandle } from '../../engine/audio/audioManager';
import { noiseBurst, thump } from '../../engine/audio/generators';
import { oneShot } from '../../engine/characters/voices';

/** Minet, the hatch and its padlock: the farm's sounds and the cellar's. */

/** A cat's mew, thin and angry: a nasal glide up and down. */
export function mew(audio: AudioManager, at: Point3, volume = 0.5): void {
  oneShot(audio, { at, volume }, 1.2, (out, t) => {
    const ctx = audio.context;
    const length = 0.45 + Math.random() * 0.3;
    const pitch = 0.9 + Math.random() * 0.25;
    const voice = new OscillatorNode(ctx, { type: 'sawtooth' });
    voice.frequency.setValueCurveAtTime(new Float32Array([520, 860, 900, 640, 470].map((f) => f * pitch)), t, length);
    const nose = new BiquadFilterNode(ctx, { type: 'bandpass', frequency: 1500, Q: 2.5 });
    const envelope = new GainNode(ctx, { gain: 0 });
    envelope.gain.setValueCurveAtTime(new Float32Array([0, 0.5, 0.45, 0.3, 0]), t, length);
    voice.connect(nose).connect(envelope).connect(out);
    voice.start(t);
    voice.stop(t + length + 0.05);
  });
}

/** Purring against the reporter's coat while they carry Minet: a low rumble that rises and falls with his breath. */
export function purring(audio: AudioManager): SoundHandle {
  const ctx = audio.context;
  const output = audio.output({ bus: 'sfx', volume: 0.22 });
  const noise = ctx.createBufferSource();
  noise.buffer = audio.noise;
  noise.loop = true;
  const rumble = new GainNode(ctx, { gain: 0.5 });
  const breath = new GainNode(ctx, { gain: 0.6 });
  noise.connect(new BiquadFilterNode(ctx, { type: 'lowpass', frequency: 170 })).connect(rumble).connect(breath).connect(output.input);
  const flutter = new OscillatorNode(ctx, { type: 'square', frequency: 24 });
  flutter.connect(new GainNode(ctx, { gain: 0.45 })).connect(rumble.gain);
  const chest = new OscillatorNode(ctx, { frequency: 0.45 });
  chest.connect(new GainNode(ctx, { gain: 0.35 })).connect(breath.gain);
  [noise, flutter, chest].forEach((s) => s.start());
  return {
    stop: (fade = 1) => {
      output.release(fade);
      [noise, flutter, chest].forEach((s) => s.stop(audio.now + fade + 0.1));
    },
  };
}

/** The padlock shaken on its hasp when the code is wrong: the shackle doesn't move. */
export function lockRattle(audio: AudioManager, at: Point3): void {
  oneShot(audio, { at, volume: 0.6 }, 0.8, (out, t) => {
    [0, 0.08, 0.17].forEach((d) => noiseBurst(audio, out, { start: t + d, duration: 0.03, type: 'bandpass', frequency: 3000 + Math.random() * 800, q: 5, gain: 0.5 }));
  });
}

/** The shackle springing out of the body, and the lock knocking against the boards. */
export function shackleDrop(audio: AudioManager, at: Point3): void {
  oneShot(audio, { at, volume: 0.8 }, 1, (out, t) => {
    noiseBurst(audio, out, { start: t, duration: 0.025, type: 'bandpass', frequency: 3600, q: 6, gain: 0.7 });
    thump(audio, out, t + 0.2, 300, 0.3);
  });
}

/** Old hatch boards lifted on dry hinges, or pushed open from below. */
export function hatchCreak(audio: AudioManager, at: Point3): void {
  oneShot(audio, { at, volume: 0.7 }, 1.6, (out, t) => {
    const ctx = audio.context;
    const hinge = new OscillatorNode(ctx, { type: 'sawtooth', frequency: 190 });
    hinge.frequency.setValueCurveAtTime(new Float32Array([190, 240, 160, 300, 210]), t, 0.9);
    const wood = new BiquadFilterNode(ctx, { type: 'bandpass', frequency: 900, Q: 4 });
    const envelope = new GainNode(ctx, { gain: 0 });
    envelope.gain.setValueCurveAtTime(new Float32Array([0, 0.12, 0.05, 0.14, 0]), t, 0.9);
    hinge.connect(wood).connect(envelope).connect(out);
    hinge.start(t);
    hinge.stop(t + 1);
    thump(audio, out, t + 1, 120, 0.4);
  });
}
