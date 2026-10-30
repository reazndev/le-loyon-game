import type { AudioManager, Point3 } from '../../engine/audio/audioManager';
import { noiseBurst } from '../../engine/audio/generators';
import { oneShot, tone } from '../../engine/characters/voices';

/** One drop of oil from the sump into the tray: a dull tick and a short, thick plop. */
export function oilDrip(audio: AudioManager, at: Point3, volume = 0.35): void {
  oneShot(audio, { at, volume, bus: 'ambience' }, 0.5, (out, t) => {
    const pitch = 700 + Math.random() * 300;
    tone(audio, out, { frequency: pitch, to: pitch * 1.6, start: t, duration: 0.06, gain: 0.08 });
    noiseBurst(audio, out, { start: t, duration: 0.03, type: 'bandpass', frequency: 1200, q: 4, gain: 0.15 });
  });
}
