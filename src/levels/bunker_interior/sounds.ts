import type { AudioManager, Point3 } from '../../engine/audio/audioManager';
import { oneShot } from '../../engine/characters/voices';

/**
 * Wind drawing through an air shaft somewhere above: a low hollow moan that swells and falls
 * over a few seconds, with the note of the shaft in it. `strength` 0 to 1 lifts it.
 */
export function shaftMoan(audio: AudioManager, at: Point3, strength = 0.4, volume = 0.3): void {
  const seconds = 3.5 + Math.random() * 3;
  oneShot(audio, { at, volume, bus: 'ambience' }, seconds + 0.3, (out, t) => {
    const ctx = audio.context;
    const source = ctx.createBufferSource();
    source.buffer = audio.noise;
    source.loop = true;
    const pitch = 160 + Math.random() * 70;
    const shaft = new BiquadFilterNode(ctx, { type: 'bandpass', frequency: pitch, Q: 9 + strength * 6 });
    shaft.frequency.setValueAtTime(pitch * 0.85, t);
    shaft.frequency.linearRampToValueAtTime(pitch * (1.05 + strength * 0.2), t + seconds * 0.45);
    shaft.frequency.linearRampToValueAtTime(pitch * 0.8, t + seconds);
    const swell = new GainNode(ctx, { gain: 0 });
    swell.gain.setValueAtTime(0, t);
    swell.gain.linearRampToValueAtTime(0.6 + strength * 0.6, t + seconds * 0.4);
    swell.gain.linearRampToValueAtTime(0, t + seconds);
    source.connect(shaft).connect(swell).connect(out);
    source.start(t, Math.random() * 1.5);
    source.stop(t + seconds + 0.1);
  });
}
