import type { AudioManager, Output, Point3, SoundHandle } from '../../engine/audio/audioManager';
import { noiseBurst, thump } from '../../engine/audio/generators';
import { oneShot, tone } from '../../engine/characters/voices';

/** The tower clock's escapement letting go: one heavy mechanical click through the vault. */
export function towerClick(audio: AudioManager, at: Point3): void {
  oneShot(audio, { at, volume: 0.9 }, 2.5, (out, t) => {
    thump(audio, out, t, 70, 0.9);
    noiseBurst(audio, out, { start: t, duration: 0.03, type: 'bandpass', frequency: 900, q: 3, gain: 0.9 });
    noiseBurst(audio, out, { start: t + 0.04, duration: 0.02, type: 'bandpass', frequency: 1500, q: 4, gain: 0.4 });
    // The nave rings faintly after it.
    noiseBurst(audio, out, { start: t + 0.05, duration: 1.6, type: 'bandpass', frequency: 420, q: 6, gain: 0.05, attack: 0.05 });
  });
}

/** The hour bell: a click, then `strokes` slow strokes, loud, with a long hum under each. */
export function towerBell(audio: AudioManager, at: Point3, strokes: number): void {
  towerClick(audio, at);
  oneShot(audio, { at, volume: 1.6 }, 2 + strokes * 2.2 + 6, (out, t) => {
    for (let i = 0; i < strokes; i++) {
      const s = t + 1.6 + i * 2.2;
      noiseBurst(audio, out, { start: s, duration: 0.04, type: 'bandpass', frequency: 2400, q: 2, gain: 0.5 });
      // A church bell's partials: hum, prime, minor third, fifth, octave.
      [
        [196, 0.32, 6],
        [392, 0.4, 4.5],
        [466, 0.22, 3.5],
        [587, 0.14, 2.5],
        [784, 0.12, 2],
      ].forEach(([frequency, gain, duration]) => tone(audio, out, { frequency: frequency!, start: s, duration: duration!, gain: gain!, attack: 0.003 }));
    }
  });
}

/** Old wood taking someone's weight: a slow creak and a settle. */
export function woodCreak(audio: AudioManager, at: Point3): void {
  oneShot(audio, { at, volume: 0.55 }, 2, (out, t) => {
    tone(audio, out, { type: 'sawtooth', frequency: 92, to: 71, start: t, duration: 0.55, gain: 0.05, attack: 0.15 });
    noiseBurst(audio, out, { start: t, duration: 0.5, type: 'bandpass', frequency: 640, q: 14, gain: 0.25, attack: 0.18 });
    noiseBurst(audio, out, { start: t + 0.62, duration: 0.05, type: 'lowpass', frequency: 300, gain: 0.35 });
  });
}

/**
 * One beat of the tower clock's pendulum, heard through the wall over the main door: a dull
 * wooden knock with the high end taken off by the stone.
 */
export function pendulumBeat(audio: AudioManager, at: Point3, volume = 0.4): void {
  oneShot(audio, { at, volume, bus: 'ambience' }, 0.6, (out, t) => {
    thump(audio, out, t, 85, 0.35);
    noiseBurst(audio, out, { start: t, duration: 0.025, type: 'bandpass', frequency: 520, q: 5, gain: 0.25 });
  });
}

/**
 * The office's dot-matrix printer: nine lines, each a screech of the head across the paper and a
 * clunk as the carriage comes back. About six seconds.
 */
export function dotMatrixPrint(audio: AudioManager, at: Point3): void {
  oneShot(audio, { at, volume: 0.8 }, 7.5, (out, t) => {
    for (let line = 0; line < 9; line++) {
      const s = t + line * 0.68;
      for (let pin = 0; pin < 26; pin++) {
        noiseBurst(audio, out, { start: s + pin * 0.019, duration: 0.012, type: 'bandpass', frequency: 2600, q: 1.5, gain: 0.32 });
      }
      tone(audio, out, { type: 'sawtooth', frequency: 1450, start: s, duration: 0.5, gain: 0.035, attack: 0.01 });
      thump(audio, out, s + 0.55, 110, 0.35);
      noiseBurst(audio, out, { start: s + 0.55, duration: 0.06, type: 'lowpass', frequency: 500, gain: 0.4 });
    }
  });
}

const BEAT = 0.9;
/** The bass note that sticks when the church is damp: A2. */
const LOW_A = 45;
/**
 * Saturday's hymn, invented: four voices as MIDI notes, bass first, and how many beats each chord
 * holds. Two phrases in A minor, about thirty seconds.
 */
const HYMN: [number[], number][] = [
  [[45, 57, 60, 64], 2],
  [[50, 57, 62, 65], 2],
  [[45, 57, 60, 64], 2],
  [[52, 56, 59, 62], 2],
  [[45, 52, 57, 60], 2],
  [[50, 53, 57, 62], 2],
  [[40, 52, 56, 59], 2],
  [[45, 48, 52, 57], 4],
  [[48, 55, 60, 64], 2],
  [[53, 57, 60, 65], 2],
  [[48, 55, 60, 67], 2],
  [[43, 55, 59, 62], 2],
  [[45, 57, 60, 64], 2],
  [[50, 57, 62, 65], 2],
  [[52, 56, 59, 64], 2],
  [[45, 52, 57, 64], 2],
];
const HYMN_SECONDS = HYMN.reduce((sum, [, beats]) => sum + beats * BEAT, 0);

const pitch = (note: number) => 440 * 2 ** ((note - 69) / 12);

/**
 * One reed: two square voices a few cents apart, so they beat slowly, through a low-pass. With
 * `sag`, the bellows run out under it: the note fades over its length and goes a little flat.
 */
function reed(audio: AudioManager, out: AudioNode, note: number, start: number, duration: number, gain: number, sag = false): void {
  const ctx = audio.context;
  const frequency = pitch(note);
  const end = start + duration;
  const filter = new BiquadFilterNode(ctx, { type: 'lowpass', frequency: Math.min(frequency * 4, 1800), Q: 0.7 });
  const envelope = new GainNode(ctx, { gain: 0 });
  envelope.gain.setValueAtTime(0, start);
  envelope.gain.linearRampToValueAtTime(gain, start + 0.09);
  if (sag) {
    envelope.gain.exponentialRampToValueAtTime(0.0001, end);
  } else {
    envelope.gain.setValueAtTime(gain, end - 0.12);
    envelope.gain.linearRampToValueAtTime(0, end);
  }
  filter.connect(envelope).connect(out);
  [1, 1.004].forEach((detune) => {
    const voice = new OscillatorNode(ctx, { type: 'square', frequency: frequency * detune });
    if (sag) voice.frequency.linearRampToValueAtTime(frequency * detune * 0.985, end);
    voice.connect(filter);
    voice.start(start);
    voice.stop(end + 0.05);
  });
}

/** The bellows under the reeds: looped noise breathing with the treadles. Returns its level. */
function wheeze(audio: AudioManager, out: AudioNode, start: number, level: number): { gain: GainNode; sources: AudioScheduledSourceNode[] } {
  const ctx = audio.context;
  const noise = new AudioBufferSourceNode(ctx, { buffer: audio.noise, loop: true });
  const pump = new GainNode(ctx, { gain: 1 });
  const gain = new GainNode(ctx, { gain: level });
  noise.connect(new BiquadFilterNode(ctx, { type: 'bandpass', frequency: 620, Q: 0.8 })).connect(pump).connect(gain).connect(out);
  const treadle = new OscillatorNode(ctx, { frequency: 0.55 });
  treadle.connect(new GainNode(ctx, { gain: 0.6 })).connect(pump.gain);
  noise.start(start);
  treadle.start(start);
  return { gain, sources: [noise, treadle] };
}

interface Hymn {
  output: Output;
  sources: AudioScheduledSourceNode[];
  timer?: ReturnType<typeof setTimeout>;
}

/**
 * Simone's harmonium, from where it stands. `play` loops the hymn until `stop`; `stickLowA`
 * breaks off mid-phrase and leaves the low A sounding as the bellows empty (A3).
 */
export class Harmonium implements SoundHandle {
  private hymn: Hymn | null = null;

  constructor(
    private readonly audio: AudioManager,
    private readonly at: Point3,
  ) {}

  play(): void {
    if (this.hymn) return;
    const output = this.audio.output({ at: this.at, volume: 0.5, refDistance: 2.5 });
    const start = this.audio.now + 0.05;
    const { sources } = wheeze(this.audio, output.input, start, 0.035);
    const hymn: Hymn = { output, sources };
    const pass = (from: number) => {
      let t = from;
      HYMN.forEach(([chord, beats]) => {
        chord.forEach((note) => reed(this.audio, output.input, note, t, beats * BEAT, 0.07));
        t += beats * BEAT;
      });
      hymn.timer = setTimeout(() => pass(from + HYMN_SECONDS), (from + HYMN_SECONDS - 1 - this.audio.now) * 1000);
    };
    pass(start);
    this.hymn = hymn;
  }

  stop(fade = 0.4): void {
    if (!this.hymn) return;
    const { output, sources, timer } = this.hymn;
    clearTimeout(timer);
    output.release(fade);
    sources.forEach((source) => source.stop(this.audio.now + fade + 0.1));
    this.hymn = null;
  }

  stickLowA(seconds: number): void {
    this.stop(0.15);
    oneShot(this.audio, { at: this.at, volume: 0.5 }, seconds + 0.5, (out, t) => {
      reed(this.audio, out, LOW_A, t, seconds, 0.1, true);
      const { gain, sources } = wheeze(this.audio, out, t, 0.03);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + seconds);
      sources.forEach((source) => source.stop(t + seconds + 0.1));
    });
  }
}

/**
 * A draft from the side door through the harmonium with nobody at the keys: the low reeds catch
 * it and sound a breathy chord that swells, wavers, and sinks flat as the gust passes. Six seconds.
 */
export function harmoniumDraft(audio: AudioManager, at: Point3): void {
  const seconds = 6;
  oneShot(audio, { at, volume: 0.6 }, seconds + 0.5, (out, t) => {
    const ctx = audio.context;
    const swell = new GainNode(ctx, { gain: 0 });
    swell.gain.setValueAtTime(0, t);
    swell.gain.linearRampToValueAtTime(1, t + 1.6);
    swell.gain.linearRampToValueAtTime(0, t + seconds);
    swell.connect(out);
    // The gust is uneven, so the reeds catch it and lose it again.
    const waver = new GainNode(ctx, { gain: 0.7 });
    const gust = new OscillatorNode(ctx, { frequency: 0.8 });
    gust.connect(new GainNode(ctx, { gain: 0.3 })).connect(waver.gain);
    waver.connect(swell);
    [LOW_A - 12, LOW_A, LOW_A + 3].forEach((note) => reed(audio, waver, note, t, seconds, 0.09, true));
    const { sources } = wheeze(audio, swell, t, 0.06);
    gust.start(t);
    [gust, ...sources].forEach((source) => source.stop(t + seconds + 0.1));
  });
}

/** A wick drowning in its own wax: a few spits, then a short hiss. */
export function wickHiss(audio: AudioManager, at: Point3): void {
  oneShot(audio, { at, volume: 0.7 }, 1.5, (out, t) => {
    [0, 0.21, 0.36, 0.5].forEach((d) => noiseBurst(audio, out, { start: t + d, duration: 0.02, type: 'highpass', frequency: 3000, gain: 0.3 }));
    noiseBurst(audio, out, { start: t + 0.6, duration: 0.45, type: 'highpass', frequency: 4500, gain: 0.25, attack: 0.02 });
  });
}

/** A heavy wooden door blown shut: a deep thud, the latch, and the stone answering. */
export function doorSlam(audio: AudioManager, at: Point3): void {
  oneShot(audio, { at, volume: 1.3 }, 2.5, (out, t) => {
    thump(audio, out, t, 60, 1);
    noiseBurst(audio, out, { start: t, duration: 0.08, type: 'lowpass', frequency: 500, gain: 0.8 });
    noiseBurst(audio, out, { start: t + 0.03, duration: 0.03, type: 'bandpass', frequency: 2200, q: 4, gain: 0.35 });
    noiseBurst(audio, out, { start: t + 0.06, duration: 1.4, type: 'bandpass', frequency: 300, q: 4, gain: 0.07, attack: 0.04 });
  });
}
