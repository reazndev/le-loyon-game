import type { AudioManager, Point3, SoundHandle } from '../../engine/audio/audioManager';
import { noiseBurst, thump } from '../../engine/audio/generators';
import { oneShot, tone } from '../../engine/characters/voices';
import { breathUrl } from '../../game/breathing';
import type { LevelKit } from '../../game/kit/levelKit';

/** The village's own sounds: the fountain, a television through a wall, engines, the phone box, locks. */

function loopNoise(audio: AudioManager, when = audio.now): AudioBufferSourceNode {
  const source = audio.context.createBufferSource();
  source.buffer = audio.noise;
  source.loop = true;
  source.start(when, Math.random() * 2);
  return source;
}

function lfo(audio: AudioManager, frequency: number, depth: number, target: AudioParam): OscillatorNode {
  const oscillator = new OscillatorNode(audio.context, { frequency });
  oscillator.connect(new GainNode(audio.context, { gain: depth })).connect(target);
  oscillator.start();
  return oscillator;
}

/** Water running from the spout into the basin: a steady splash with a slow wobble. */
export function fountainWater(audio: AudioManager, at: Point3, volume = 0.5): SoundHandle {
  const ctx = audio.context;
  const output = audio.output({ bus: 'ambience', volume, at, refDistance: 1.6 });
  const splash = new BiquadFilterNode(ctx, { type: 'bandpass', frequency: 1300, Q: 0.6 });
  const level = new GainNode(ctx, { gain: 0.5 });
  const low = new BiquadFilterNode(ctx, { type: 'lowpass', frequency: 420 });
  const sources = [loopNoise(audio), loopNoise(audio)];
  sources[0]!.connect(splash).connect(level).connect(output.input);
  sources[1]!.connect(low).connect(new GainNode(ctx, { gain: 0.35 })).connect(output.input);
  const wobble = [lfo(audio, 3.7, 300, splash.frequency), lfo(audio, 0.23, 0.12, level.gain)];
  return {
    stop: (fade = 1) => {
      output.release(fade);
      [...sources, ...wobble].forEach((s) => s.stop(audio.now + fade + 0.1));
    },
  };
}

/**
 * A television through a wall: muffled voices in syllables, a jingle now and then. The wall
 * takes everything above 700 Hz.
 */
export function televisionThroughWall(audio: AudioManager, at: Point3): SoundHandle {
  const ctx = audio.context;
  const output = audio.output({ bus: 'ambience', volume: 0.45, at, refDistance: 1.5 });
  const wall = new BiquadFilterNode(ctx, { type: 'lowpass', frequency: 700 });
  wall.connect(output.input);
  let stopped = false;
  const syllables = () => {
    if (stopped) return;
    const start = audio.now + 0.02;
    const count = 3 + Math.floor(Math.random() * 8);
    const pitch = Math.random() < 0.5 ? 120 : 190;
    for (let i = 0; i < count; i++) {
      const s = start + i * (0.13 + Math.random() * 0.1);
      tone(audio, wall, { type: 'sawtooth', frequency: pitch * (0.9 + Math.random() * 0.25), start: s, duration: 0.12, gain: 0.05, attack: 0.02 });
      noiseBurst(audio, wall, { start: s, duration: 0.1, type: 'bandpass', frequency: 500 + Math.random() * 300, q: 2, gain: 0.25, attack: 0.02 });
    }
    setTimeout(syllables, (count * 0.2 + 0.2 + Math.random() * 0.9) * 1000);
  };
  syllables();
  return {
    stop: (fade = 0.5) => {
      stopped = true;
      output.release(fade);
    },
  };
}

export interface MovingSound extends SoundHandle {
  moveTo(at: Point3): void;
  /** Engine speed, 0 is idle and 1 is pulling hard. */
  throttle(amount: number): void;
}

/** Ties a moving sound to the scene, so it stops when the scene ends, and keeps its controls. */
export function scoped(kit: LevelKit, sound: MovingSound): MovingSound {
  const { stop } = kit.use((k) => k.world.sounds.track(sound));
  return { ...sound, stop };
}

/**
 * A diesel engine: the bus or a tractor. A low sawtooth pulse through a muffler filter, with
 * a rattle on top. `rate` is the idle firing frequency in Hz.
 */
export function diesel(audio: AudioManager, at: Point3, options: { volume?: number; rate?: number; bus?: 'ambience' | 'sfx' } = {}): MovingSound {
  const ctx = audio.context;
  const output = audio.output({ bus: options.bus ?? 'sfx', volume: options.volume ?? 0.6, at, refDistance: 3 });
  const rate = options.rate ?? 28;
  const muffler = new BiquadFilterNode(ctx, { type: 'lowpass', frequency: 260, Q: 1.5 });
  const body = new OscillatorNode(ctx, { type: 'sawtooth', frequency: rate });
  const pulse = new GainNode(ctx, { gain: 0.5 });
  body.connect(pulse).connect(muffler).connect(output.input);
  body.start();
  const chug = lfo(audio, rate / 4, 0.35, pulse.gain);
  const rattle = new BiquadFilterNode(ctx, { type: 'bandpass', frequency: 1800, Q: 1 });
  const rattleLevel = new GainNode(ctx, { gain: 0.04 });
  const noise = loopNoise(audio);
  noise.connect(rattle).connect(rattleLevel).connect(output.input);
  const rattleChug = lfo(audio, rate / 2, 0.03, rattleLevel.gain);
  return {
    moveTo: (p) => {
      output.panner?.positionX.setTargetAtTime(p.x, audio.now, 0.05);
      output.panner?.positionY.setTargetAtTime(p.y, audio.now, 0.05);
      output.panner?.positionZ.setTargetAtTime(p.z, audio.now, 0.05);
    },
    throttle: (amount) => {
      const f = rate * (1 + amount * 0.8);
      body.frequency.setTargetAtTime(f, audio.now, 0.6);
      chug.frequency.setTargetAtTime(f / 4, audio.now, 0.6);
      muffler.frequency.setTargetAtTime(260 + amount * 260, audio.now, 0.6);
    },
    stop: (fade = 1) => {
      output.release(fade);
      [body, chug, noise, rattleChug].forEach((s) => s.stop(audio.now + fade + 0.1));
    },
  };
}

/** The PostBus horn, three notes from William Tell, as every Swiss child knows them. */
export function postHorn(audio: AudioManager, at: Point3): void {
  oneShot(audio, { at, volume: 0.9 }, 2.4, (out, t) => {
    const ctx = audio.context;
    const brass = new BiquadFilterNode(ctx, { type: 'lowpass', frequency: 1900, Q: 2 });
    brass.connect(out);
    [554.4, 329.6, 440].forEach((frequency, i) => {
      const start = t + i * 0.42;
      const length = i === 2 ? 0.9 : 0.36;
      tone(audio, brass, { type: 'sawtooth', frequency, start, duration: length, gain: 0.18, attack: 0.03 });
      tone(audio, brass, { type: 'square', frequency: frequency * 1.002, start, duration: length, gain: 0.07, attack: 0.03 });
    });
  });
}

/** A shutter blown open against the wall: the hinge, the slam of the leaf, and a rattle as it settles. */
export function shutterBang(audio: AudioManager, at: Point3): void {
  oneShot(audio, { at, volume: 1.2 }, 2, (out, t) => {
    tone(audio, out, { type: 'sawtooth', frequency: 340, to: 260, start: t, duration: 0.25, gain: 0.03, attack: 0.08 });
    thump(audio, out, t + 0.3, 130, 1);
    noiseBurst(audio, out, { start: t + 0.3, duration: 0.12, type: 'lowpass', frequency: 1400, gain: 0.9 });
    [0.48, 0.6, 0.68].forEach((s, i) => thump(audio, out, t + s, 160, 0.35 / (i + 1)));
  });
}

/** The phone box bell: one ring, a fast hammering on two small bells, then it stops. */
export function phoneRing(audio: AudioManager, at: Point3): void {
  oneShot(audio, { at, volume: 0.8 }, 1.6, (out, t) => {
    for (let i = 0; i < 22; i++) {
      const s = t + i * 0.05;
      [1240, 1610].forEach((f, n) => tone(audio, out, { frequency: f, start: s + n * 0.025, duration: 0.09, gain: 0.07, attack: 0.002 }));
    }
  });
}

/** A Swiss dial tone, 425 Hz, for a few seconds. */
export function dialTone(audio: AudioManager, seconds: number): void {
  oneShot(audio, { volume: 0.25 }, seconds + 0.2, (out, t) => tone(audio, out, { frequency: 425, start: t, duration: seconds, gain: 0.3, attack: 0.01 }));
}

/** A key turned in an old lock, twice. */
export function lockTwice(audio: AudioManager, at: Point3): void {
  oneShot(audio, { at, volume: 0.9 }, 1.4, (out, t) => {
    [0, 0.55].forEach((delay) => {
      thump(audio, out, t + delay, 260, 0.25);
      noiseBurst(audio, out, { start: t + delay, duration: 0.03, type: 'bandpass', frequency: 2600, q: 4, gain: 0.6 });
      noiseBurst(audio, out, { start: t + delay + 0.09, duration: 0.025, type: 'bandpass', frequency: 1900, q: 5, gain: 0.45 });
    });
  });
}

/** A two-stroke moped idling out of sight, buzzing and spitting. */
export function moped(audio: AudioManager, at: Point3): MovingSound {
  const ctx = audio.context;
  const output = audio.output({ bus: 'sfx', volume: 0.35, at, refDistance: 3 });
  const buzz = new OscillatorNode(ctx, { type: 'sawtooth', frequency: 46 });
  const level = new GainNode(ctx, { gain: 0.35 });
  const band = new BiquadFilterNode(ctx, { type: 'bandpass', frequency: 900, Q: 0.7 });
  buzz.connect(level).connect(band).connect(output.input);
  buzz.start();
  const sputter = lfo(audio, 7.3, 0.2, level.gain);
  return {
    moveTo: (p) => {
      output.panner?.positionX.setTargetAtTime(p.x, audio.now, 0.1);
      output.panner?.positionZ.setTargetAtTime(p.z, audio.now, 0.1);
    },
    throttle: (amount) => {
      buzz.frequency.setTargetAtTime(46 + amount * 70, audio.now, 0.3);
      band.frequency.setTargetAtTime(900 + amount * 1100, audio.now, 0.3);
    },
    stop: (fade = 1) => {
      output.release(fade);
      [buzz, sputter].forEach((s) => s.stop(audio.now + fade + 0.1));
    },
  };
}

/** A house doorbell: two soft chimes, high then low. */
export function doorBell(audio: AudioManager, at: Point3): void {
  oneShot(audio, { at, volume: 0.6 }, 2.4, (out, t) => {
    [
      [659, 0],
      [523, 0.55],
    ].forEach(([frequency, delay]) => {
      tone(audio, out, { frequency: frequency!, start: t + delay!, duration: 1.6, gain: 0.22, attack: 0.004 });
      tone(audio, out, { frequency: frequency! * 2.76, start: t + delay!, duration: 0.5, gain: 0.04, attack: 0.004 });
    });
  });
}

/** A van door: the latch, then the door swinging open, or slammed shut on its rubber. */
export function vanDoor(audio: AudioManager, at: Point3, shut: boolean): void {
  oneShot(audio, { at, volume: 0.7 }, 1, (out, t) => {
    noiseBurst(audio, out, { start: t, duration: 0.03, type: 'bandpass', frequency: 2400, q: 3, gain: 0.5 });
    if (shut) thump(audio, out, t + 0.02, 140, 0.6);
    else noiseBurst(audio, out, { start: t + 0.05, duration: 0.35, type: 'bandpass', frequency: 700, q: 2, gain: 0.12, attack: 0.1 });
  });
}

/** Letters riffled and squared in a tray. */
export function paperRustle(audio: AudioManager, at: Point3): void {
  oneShot(audio, { at, volume: 0.35 }, 1.2, (out, t) => {
    for (let i = 0; i < 5; i++) noiseBurst(audio, out, { start: t + i * 0.09 + Math.random() * 0.04, duration: 0.07, type: 'highpass', frequency: 3200, gain: 0.25, attack: 0.01 });
  });
}

/** A taxcard pushed into the slot, or pushed back out, and the phone's two-tone beep as it reads it. */
export function taxcard(audio: AudioManager, at: Point3, out: boolean): void {
  oneShot(audio, { at, volume: 0.6 }, 1.4, (dest, t) => {
    noiseBurst(audio, dest, { start: t, duration: 0.18, type: 'bandpass', frequency: out ? 1700 : 1300, q: 3, gain: 0.25, attack: 0.05 });
    noiseBurst(audio, dest, { start: t + 0.2, duration: 0.02, type: 'bandpass', frequency: 2600, q: 4, gain: 0.5 });
    [880, 1320].forEach((frequency, i) => tone(audio, dest, { type: 'square', frequency, start: t + 0.45 + i * 0.16, duration: 0.14, gain: 0.04, attack: 0.005 }));
  });
}

/** The Swiss ringing tone in the receiver: 425 Hz, one second on, four off, until stopped. */
export function ringTone(audio: AudioManager): SoundHandle {
  const output = audio.output({ volume: 0.18 });
  const gate = new GainNode(audio.context, { gain: 0 });
  const oscillator = new OscillatorNode(audio.context, { frequency: 425 });
  oscillator.connect(gate).connect(output.input);
  const start = audio.now + 0.4;
  for (let ring = 0; ring < 24; ring++) {
    gate.gain.setValueAtTime(1, start + ring * 5);
    gate.gain.setValueAtTime(0, start + ring * 5 + 1);
  }
  oscillator.start();
  return {
    stop: (fade = 0) => {
      output.release(fade);
      oscillator.stop(audio.now + fade + 0.1);
    },
  };
}

/** The far end picking up: a hard click and a breath of line noise. */
export function pickUp(audio: AudioManager): void {
  oneShot(audio, { volume: 0.5 }, 0.8, (out, t) => {
    noiseBurst(audio, out, { start: t, duration: 0.015, type: 'bandpass', frequency: 1800, q: 2, gain: 0.9 });
    noiseBurst(audio, out, { start: t + 0.02, duration: 0.4, type: 'bandpass', frequency: 1100, q: 0.7, gain: 0.05, attack: 0.05 });
  });
}

/** The reporter's own slow breathing, close, as if the receiver were picking it up. */
export function breathOnTheLine(audio: AudioManager): SoundHandle {
  return audio.play(breathUrl('tired'), { bus: 'sfx', volume: 0.32, loop: true, rate: 0.82 });
}
