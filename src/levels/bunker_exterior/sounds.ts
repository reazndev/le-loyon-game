import type { AudioManager, Point3 } from '../../engine/audio/audioManager';
import { noiseBurst } from '../../engine/audio/generators';
import { oneShot } from '../../engine/characters/voices';

/** A loose corner of tarpaulin lifting in a gust and slapping back down: two to four soft cracks. */
export function tarpFlap(audio: AudioManager, at: Point3, volume = 0.35): void {
  const flaps = 2 + Math.floor(Math.random() * 3);
  oneShot(audio, { at, volume, bus: 'ambience' }, flaps * 0.4 + 1, (out, t) => {
    let start = t;
    for (let i = 0; i < flaps; i++) {
      noiseBurst(audio, out, { start, duration: 0.07, type: 'lowpass', frequency: 650 + Math.random() * 300, gain: 0.55 - i * 0.08, attack: 0.01 });
      noiseBurst(audio, out, { start: start + 0.02, duration: 0.18, type: 'bandpass', frequency: 1400 + Math.random() * 600, q: 0.9, gain: 0.12, attack: 0.03 });
      start += 0.16 + Math.random() * 0.3;
    }
  });
}

/**
 * A siren test down in the valley: one long tone climbing, holding, and sinking away, dulled
 * by the distance and carried in and out by the wind, with its echo off the far slope.
 */
export function sirenWail(audio: AudioManager, volume = 0.25): void {
  const [rise, hold, fall] = [5, 4, 6];
  const length = rise + hold + fall;
  oneShot(audio, { volume }, length + 2, (out, t) => {
    const ctx = audio.context;
    const horn = new OscillatorNode(ctx, { type: 'square', frequency: 160 });
    horn.frequency.setValueAtTime(160, t);
    horn.frequency.linearRampToValueAtTime(430, t + rise);
    horn.frequency.setValueAtTime(430, t + rise + hold);
    horn.frequency.linearRampToValueAtTime(150, t + length);
    const envelope = new GainNode(ctx, { gain: 0 });
    envelope.gain.setValueAtTime(0, t);
    envelope.gain.linearRampToValueAtTime(0.3, t + rise);
    envelope.gain.setValueAtTime(0.3, t + rise + hold);
    envelope.gain.linearRampToValueAtTime(0, t + length);
    const wind = new GainNode(ctx, { gain: 0.8 });
    const gust = new OscillatorNode(ctx, { frequency: 0.23 });
    gust.connect(new GainNode(ctx, { gain: 0.2 })).connect(wind.gain);
    horn.connect(new BiquadFilterNode(ctx, { type: 'lowpass', frequency: 1100 })).connect(envelope).connect(wind).connect(out);
    wind.connect(new DelayNode(ctx, { delayTime: 0.8 })).connect(new GainNode(ctx, { gain: 0.3 })).connect(out);
    [horn, gust].forEach((node) => {
      node.start(t);
      node.stop(t + length + 0.1);
    });
  });
}
