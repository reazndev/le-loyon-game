import type { AudioManager, Point3, SoundHandle } from '../../engine/audio/audioManager';
import { playSound } from '../../game/scares/sounds';
import { radio } from '../inn/sounds';

const VOLUME = 0.2;

/**
 * The garage radio as one sound the scene can own: it plays the inn's radio and can lose the
 * station to static for a few seconds and find it again. Track it with `loopSound` so it stops
 * with the scene.
 */
export class ShelfRadio implements SoundHandle {
  private station: SoundHandle | null = null;

  constructor(
    private readonly audio: AudioManager,
    private readonly at: Point3,
  ) {}

  on(): this {
    this.station ??= radio(this.audio, this.at, VOLUME);
    return this;
  }

  /** The music sinks under a hiss; call `on` to bring the station back. */
  toStatic(): void {
    this.stop(0.6);
    playSound(this.audio, 'sfx_static', { at: this.at, volume: 0.35 });
  }

  stop(fade = 0.5): void {
    this.station?.stop(fade);
    this.station = null;
  }
}
