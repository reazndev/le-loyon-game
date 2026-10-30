/** Average seconds between short stutters, and between the rare times it dies outright. */
const STUTTER_EVERY = 28;
const DROPOUT_EVERY = 75;
/** How long a dropout stays dark, in seconds. */
const DARK = [1.5, 4] as const;
/** The stutter before it dies and after it catches again. */
const LEAD = 0.6;
const CATCH = 0.5;
/** Stutter steps per second: fast enough to read as a bad contact, slow enough to see. */
const STEPS = 18;

/**
 * A cheap torch with a loose contact. Steady most of the time; now and then it stutters for a
 * moment; rarely it dies for a few seconds, then sputters back on. `level(time)` is the
 * brightness to multiply the beam by.
 */
export class FlashlightFault {
  private nextStutter: number | null = null;
  private nextDropout = 0;
  private stutterUntil = -1;
  private darkFrom = -1;
  private darkUntil = -1;
  private step = -1;
  private stepLevel = 1;

  constructor(private readonly random: () => number = Math.random) {}

  level(time: number): number {
    if (this.nextStutter === null) {
      this.nextStutter = time + this.gap(STUTTER_EVERY);
      this.nextDropout = time + this.gap(DROPOUT_EVERY);
    }
    if (time >= this.nextDropout) {
      this.darkFrom = time + LEAD;
      this.darkUntil = this.darkFrom + DARK[0] + this.random() * (DARK[1] - DARK[0]);
      this.stutterUntil = this.darkFrom;
      this.nextDropout = this.darkUntil + this.gap(DROPOUT_EVERY);
      this.nextStutter = Math.max(this.nextStutter, this.darkUntil + this.gap(STUTTER_EVERY));
    } else if (time >= this.nextStutter) {
      this.stutterUntil = time + 0.2 + this.random() * 0.9;
      this.nextStutter = time + this.gap(STUTTER_EVERY);
    }
    if (time >= this.darkFrom && time < this.darkUntil) return 0;
    const catching = time >= this.darkUntil && time < this.darkUntil + CATCH;
    return time < this.stutterUntil || catching ? this.stutter(time) : 1;
  }

  /** Mostly on, dipping to almost nothing on a third of the steps. */
  private stutter(time: number): number {
    const step = Math.floor(time * STEPS);
    if (step !== this.step) {
      this.step = step;
      const roll = this.random();
      this.stepLevel = roll < 0.35 ? roll * 0.3 : 1;
    }
    return this.stepLevel;
  }

  /** Exponential gaps arrive in uneven clumps; the floor of a third keeps them from piling up. */
  private gap(mean: number): number {
    return -Math.log(1 - this.random()) * mean + mean / 3;
  }
}
