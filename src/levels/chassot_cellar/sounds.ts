import type { AudioManager, Point3 } from '../../engine/audio/audioManager';
import { noiseBurst, thump } from '../../engine/audio/generators';
import { oneShot } from '../../engine/characters/voices';

/** The hatch falling shut: a low wooden boom, the boards settling, and grit pattering down the steps. */
export function hatchSlam(audio: AudioManager, at: Point3): void {
  oneShot(audio, { at, volume: 1.4 }, 3, (out, t) => {
    thump(audio, out, t, 90, 1);
    thump(audio, out, t + 0.01, 160, 0.6);
    noiseBurst(audio, out, { start: t, duration: 0.25, type: 'lowpass', frequency: 400, gain: 0.8 });
    noiseBurst(audio, out, { start: t + 0.12, duration: 0.05, type: 'bandpass', frequency: 1200, q: 3, gain: 0.3 });
    for (let i = 0; i < 14; i++) {
      noiseBurst(audio, out, { start: t + 0.3 + i * 0.06 + Math.random() * 0.05, duration: 0.012, type: 'highpass', frequency: 4000, gain: 0.12 });
    }
  });
}
