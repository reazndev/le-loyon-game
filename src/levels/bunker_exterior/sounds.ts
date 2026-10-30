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
