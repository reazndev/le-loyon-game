import type { AudioManager, Output } from '../engine/audio/audioManager';

const url = (name: string) => `${import.meta.env.BASE_URL}assets/audio/breath/${name}.ogg`;

/** Breathing loops from a little out of breath to gasping. They play together, faded by how winded the reporter is. */
const LOOPS = ['tired', 'fast', 'faster'] as const;
/** Takes for the cold. */
const SHIVERS = 4;
const SNIFFS = 4;

/** Seconds of running from rested to fully winded, and from winded back to rested. */
const WINDED_AFTER = 12;
const RESTED_AFTER = 18;
/** Winded enough to hear it, and calm enough to stop. About five seconds of running starts it. */
const START = 0.4;
const STOP = 0.12;
const LOUDEST = 0.45;
/** How far into the gasping loop full wind goes: 1 stops at fast breathing, 2 is all gasping. */
const HARDEST = 1.35;
/** Average seconds between cold breaths, when not out of breath. */
const COLD_EVERY = 14;

const pick = (count: number) => 1 + Math.floor(Math.random() * count);

/**
 * The reporter's own breathing, from recordings. Running hard for a while winds them: the
 * breathing comes in and gets faster and heavier the longer they run, then slows and fades as
 * they walk it off. Out in the cold, now and then a shivering breath or a sniff.
 */
export class Breathing {
  private wind = 0;
  private panting = false;
  private loops: Output[] | null = null;
  private nextCold = COLD_EVERY;

  constructor(private readonly audio: AudioManager) {}

  update(dt: number, running: boolean, cold: boolean): void {
    this.wind = running ? Math.min(1, this.wind + dt / WINDED_AFTER) : Math.max(0, this.wind - dt / RESTED_AFTER);
    if (!this.panting && this.wind > START) this.panting = true;
    if (this.panting && this.wind < STOP) this.panting = false;
    if (this.panting && !this.loops) this.loops = this.startLoops();
    if (this.loops) this.mix(this.loops);

    this.nextCold -= dt;
    if (this.nextCold > 0) return;
    this.nextCold = COLD_EVERY * (0.5 + Math.random());
    if (!cold || this.panting) return;
    const shiver = Math.random() < 0.55;
    this.audio.play(url(shiver ? `shiver_${pick(SHIVERS)}` : `sniff_${pick(SNIFFS)}`), { bus: 'sfx', volume: shiver ? 0.3 : 0.25 });
  }

  /** Starts all three loops silent, each from a random point so they never line up. */
  private startLoops(): Output[] {
    return LOOPS.map((name) => {
      const output = this.audio.output({ bus: 'sfx', volume: 0 });
      void this.audio.load(url(name)).then((buffer) => {
        const source = this.audio.context.createBufferSource();
        source.buffer = buffer;
        source.loop = true;
        source.connect(output.input);
        source.start(0, Math.random() * buffer.duration);
      });
      return output;
    });
  }

  /** Light breathing first, then fast, then a touch of gasping, by how far past the start the reporter is. */
  private mix(loops: Output[]): void {
    const level = this.panting ? Math.min(1, (this.wind - STOP) / (START - STOP)) * LOUDEST : 0;
    const p = Math.max(0, (this.wind - START) / (1 - START)) * HARDEST;
    const weights = [Math.max(0, 1 - p), Math.max(0, 1 - Math.abs(p - 1)), Math.max(0, p - 1)];
    loops.forEach((output, i) => output.input.gain.setTargetAtTime(level * weights[i]!, this.audio.now, 0.4));
  }
}
