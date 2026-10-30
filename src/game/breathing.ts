import type { AudioManager } from '../engine/audio/audioManager';
import { coldGasp, pant, shiver } from './breathSounds';

/** Seconds of running from rested to fully winded, and from winded back to rested. */
const WINDED_AFTER = 12;
const RESTED_AFTER = 18;
/** Winded enough to hear it, and calm enough to stop. About five seconds of running starts it. */
const START = 0.4;
const STOP = 0.12;
/** Average seconds between cold breaths, when not out of breath. */
const COLD_EVERY = 14;

/**
 * The reporter's own breathing. Running hard for a while winds them: breaths get faster and
 * louder the longer they run, then slow and fade as they walk it off. Out in the cold, now and
 * then a shaky breath out, a sniff, or a breath in through the teeth.
 */
export class Breathing {
  private wind = 0;
  private panting = false;
  private nextBreath = 0;
  private nextCold = COLD_EVERY;

  constructor(private readonly audio: AudioManager) {}

  update(dt: number, running: boolean, cold: boolean): void {
    this.wind = running ? Math.min(1, this.wind + dt / WINDED_AFTER) : Math.max(0, this.wind - dt / RESTED_AFTER);
    if (!this.panting && this.wind > START) this.panting = true;
    if (this.panting && this.wind < STOP) this.panting = false;

    this.nextBreath -= dt;
    if (this.panting && this.nextBreath <= 0) {
      const seconds = 2.6 - this.wind * 1.7;
      pant(this.audio, this.wind, seconds);
      this.nextBreath = seconds * (0.95 + Math.random() * 0.15);
    }

    this.nextCold -= dt;
    if (this.nextCold > 0) return;
    this.nextCold = COLD_EVERY * (0.5 + Math.random());
    if (!cold || this.panting) return;
    if (Math.random() < 0.55) shiver(this.audio);
    else coldGasp(this.audio);
  }
}
