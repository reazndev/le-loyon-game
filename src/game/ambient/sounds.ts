import type { AudioManager, Point3, SoundHandle } from '../../engine/audio/audioManager';
import { noiseBurst, thump } from '../../engine/audio/generators';
import { oneShot, tone } from '../../engine/characters/voices';

/**
 * Procedural ambient sounds any scene can use: weather, appliances, small animals, distant
 * traffic and bells. Loops return a handle; start them through `loop` in `soundscape.ts` so they
 * stop with the scene. One-shots play once and clean up after themselves.
 */

const vary = (value: number, amount = 0.1) => value * (1 + (Math.random() - 0.5) * 2 * amount);

function loopNoise(audio: AudioManager): AudioBufferSourceNode {
  const source = audio.context.createBufferSource();
  source.buffer = audio.noise;
  source.loop = true;
  source.start(audio.now, Math.random() * 2);
  return source;
}

function wobble(audio: AudioManager, frequency: number, depth: number, target: AudioParam): OscillatorNode {
  const oscillator = new OscillatorNode(audio.context, { frequency });
  oscillator.connect(new GainNode(audio.context, { gain: depth })).connect(target);
  oscillator.start();
  return oscillator;
}

function stopping(audio: AudioManager, release: (fade: number) => void, nodes: AudioScheduledSourceNode[], extra: () => void = () => undefined): SoundHandle {
  return {
    stop: (fade = 1) => {
      extra();
      release(fade);
      nodes.forEach((node) => node.stop(audio.now + fade + 0.1));
    },
  };
}

/** A drop of water landing on glass, a sill, or a puddle. */
function plip(audio: AudioManager, destination: AudioNode, start: number, gain = 0.08): void {
  const ctx = audio.context;
  const pitch = vary(1500, 0.25);
  const oscillator = new OscillatorNode(ctx, { frequency: pitch });
  oscillator.frequency.exponentialRampToValueAtTime(pitch * 0.6, start + 0.06);
  const envelope = new GainNode(ctx, { gain: 0 });
  envelope.gain.setValueAtTime(0, start);
  envelope.gain.linearRampToValueAtTime(gain, start + 0.003);
  envelope.gain.exponentialRampToValueAtTime(0.0001, start + 0.12);
  oscillator.connect(envelope).connect(destination);
  oscillator.start(start);
  oscillator.stop(start + 0.15);
}

/** One drop of water falling from a ceiling or a branch into a puddle. */
export function waterDrop(audio: AudioManager, at: Point3, volume = 0.4): void {
  oneShot(audio, { at, volume, bus: 'ambience' }, 0.6, (out, t) => {
    plip(audio, out, t, 0.35);
    noiseBurst(audio, out, { start: t, duration: 0.02, type: 'highpass', frequency: 3500, gain: 0.2 });
  });
}

/**
 * Rain on something close: steady hiss with single drops. `surface` sets the character: glass
 * ticks high, a tin roof drums low and loud, leaves patter soft. Without `at` it is all around.
 */
export function rain(audio: AudioManager, options: { at?: Point3; volume?: number; surface?: 'glass' | 'tin' | 'leaves' } = {}): SoundHandle {
  const ctx = audio.context;
  const surface = options.surface ?? 'glass';
  const output = audio.output({ bus: 'ambience', volume: options.volume ?? 0.5, ...(options.at ? { at: options.at, refDistance: surface === 'tin' ? 2.5 : 1.2 } : {}) });
  const band = { glass: [500, 5200, 4000], tin: [250, 2600, 1300], leaves: [900, 7000, 5000] }[surface];
  const hiss = loopNoise(audio);
  hiss
    .connect(new BiquadFilterNode(ctx, { type: 'highpass', frequency: band[0] }))
    .connect(new BiquadFilterNode(ctx, { type: 'lowpass', frequency: band[1] }))
    .connect(new GainNode(ctx, { gain: surface === 'tin' ? 0.22 : 0.16 }))
    .connect(output.input);
  let timer: ReturnType<typeof setTimeout>;
  const drops = () => {
    const start = audio.now + 0.02;
    for (let i = 0; i < 6; i++) {
      noiseBurst(audio, output.input, {
        start: start + Math.random() * 0.25,
        duration: surface === 'tin' ? 0.01 + Math.random() * 0.02 : 0.004 + Math.random() * 0.01,
        type: 'bandpass',
        frequency: band[2]! * (0.6 + Math.random() * 0.9),
        q: 2,
        gain: 0.15 + Math.random() * 0.35,
      });
    }
    if (Math.random() < 0.12) plip(audio, output.input, start + Math.random() * 0.2);
    timer = setTimeout(drops, 250);
  };
  drops();
  return stopping(audio, (fade) => output.release(fade), [hiss], () => clearTimeout(timer));
}

/**
 * A fridge through a wall or across a room: it shudders on, hums for half a minute, and clunks
 * off again. `wall` muffles it more.
 */
export function fridgeHum(audio: AudioManager, at: Point3, options: { volume?: number; wall?: boolean } = {}): SoundHandle {
  const ctx = audio.context;
  const output = audio.output({ bus: 'ambience', volume: options.volume ?? 0.55, at, refDistance: 1.5 });
  const muffle = new BiquadFilterNode(ctx, { type: 'lowpass', frequency: options.wall === false ? 900 : 260, Q: 0.7 });
  const level = new GainNode(ctx, { gain: 0 });
  muffle.connect(output.input);
  level.connect(muffle);
  const motors = [50, 100, 150].map((frequency, i) => {
    const oscillator = new OscillatorNode(ctx, { type: i ? 'sine' : 'sawtooth', frequency });
    oscillator.connect(new GainNode(ctx, { gain: [0.25, 0.5, 0.15][i] })).connect(level);
    oscillator.start();
    return oscillator;
  });
  let timer: ReturnType<typeof setTimeout>;
  const cycle = (on: boolean) => {
    const t = audio.now;
    thump(audio, muffle, t, on ? 70 : 55, on ? 0.6 : 0.4);
    level.gain.cancelScheduledValues(t);
    level.gain.setValueAtTime(level.gain.value, t);
    level.gain.linearRampToValueAtTime(on ? 0.5 : 0, t + (on ? 0.6 : 0.25));
    timer = setTimeout(() => cycle(!on), (on ? 25 + Math.random() * 15 : 30 + Math.random() * 30) * 1000);
  };
  timer = setTimeout(() => cycle(true), 6000 + Math.random() * 8000);
  return stopping(audio, (fade) => output.release(fade), motors, () => clearTimeout(timer));
}

/**
 * Wind through the tops of trees: the leaves' hiss rising and falling with the gusts. Lay it over
 * `kit.ambience('wind')`; `strength` 0 to 1 goes from a stir to a steady roar.
 */
export function leafRustle(audio: AudioManager, strength = 0.5): SoundHandle {
  const ctx = audio.context;
  const output = audio.output({ bus: 'ambience', volume: 0.1 + strength * 0.35 });
  const band = new BiquadFilterNode(ctx, { type: 'bandpass', frequency: 3200, Q: 0.4 });
  const level = new GainNode(ctx, { gain: 0.25 });
  const noise = loopNoise(audio);
  noise.connect(band).connect(level).connect(output.input);
  // Gusts: two slow swells that drift in and out of step, faster as the wind rises.
  const gusts = [wobble(audio, 0.06 + strength * 0.08, 0.2, level.gain), wobble(audio, 0.023 + strength * 0.03, 0.12, level.gain), wobble(audio, 0.09, 900, band.frequency)];
  return stopping(audio, (fade) => output.release(fade), [noise, ...gusts]);
}

/** A trunk leaning in the wind: a long, low groan of wood, now and then a second one higher up. */
export function trunkCreak(audio: AudioManager, at: Point3, volume = 0.45): void {
  oneShot(audio, { at, volume, bus: 'ambience' }, 3.5, (out, t) => {
    const f = vary(70, 0.3);
    const length = vary(1.4, 0.4);
    tone(audio, out, { type: 'sawtooth', frequency: f, to: f * vary(1.25, 0.1), start: t, duration: length, gain: 0.05, attack: length * 0.4 });
    noiseBurst(audio, out, { start: t, duration: length, type: 'bandpass', frequency: vary(420, 0.3), q: 18, gain: 0.3, attack: length * 0.45 });
    if (Math.random() < 0.4) noiseBurst(audio, out, { start: t + length + 0.3, duration: 0.6, type: 'bandpass', frequency: vary(800, 0.2), q: 14, gain: 0.15, attack: 0.25 });
  });
}

/** Claws on lath and plaster inside a wall: a burst of scratching, a pause, a few more. */
export function mouseScratch(audio: AudioManager, at: Point3, volume = 0.35): void {
  const bursts = 1 + Math.floor(Math.random() * 3);
  oneShot(audio, { at, volume, bus: 'ambience' }, bursts * 1.2 + 0.5, (out, t) => {
    for (let b = 0; b < bursts; b++) {
      const start = t + b * vary(0.9, 0.4);
      const scratches = 4 + Math.floor(Math.random() * 8);
      for (let i = 0; i < scratches; i++) {
        noiseBurst(audio, out, { start: start + i * vary(0.045, 0.4), duration: 0.02, type: 'bandpass', frequency: vary(3800, 0.3), q: 3, gain: 0.3 });
      }
    }
    // Sometimes the small knock of it running along a joist.
    if (Math.random() < 0.3) [0, 0.09, 0.17].forEach((d) => thump(audio, out, t + bursts + d, 240, 0.08));
  });
}

/** Flies over something left out: a thin buzz that comes and goes as they land and lift. */
export function flyBuzz(audio: AudioManager, at: Point3, volume = 0.18): SoundHandle {
  const ctx = audio.context;
  const output = audio.output({ bus: 'ambience', volume, at, refDistance: 0.6 });
  const wings = new OscillatorNode(ctx, { type: 'sawtooth', frequency: 190 });
  const band = new BiquadFilterNode(ctx, { type: 'bandpass', frequency: 600, Q: 2 });
  const level = new GainNode(ctx, { gain: 0.15 });
  wings.connect(band).connect(level).connect(output.input);
  wings.start();
  const drift = [wobble(audio, 0.9, 25, wings.frequency), wobble(audio, 0.31, 0.15, level.gain), wobble(audio, 0.13, 0.08, level.gain)];
  return stopping(audio, (fade) => output.release(fade), [wings, ...drift]);
}

/** A fluorescent tube's ballast: the 100 Hz hum and a thin high buzz. */
export function tubeHum(audio: AudioManager, at: Point3, volume = 0.2): SoundHandle {
  const ctx = audio.context;
  const output = audio.output({ bus: 'ambience', volume, at, refDistance: 1 });
  const hum = new OscillatorNode(ctx, { type: 'triangle', frequency: 100 });
  const buzz = new OscillatorNode(ctx, { type: 'square', frequency: 200 });
  hum.connect(new GainNode(ctx, { gain: 0.25 })).connect(output.input);
  buzz.connect(new BiquadFilterNode(ctx, { type: 'bandpass', frequency: 3000, Q: 3 })).connect(new GainNode(ctx, { gain: 0.04 })).connect(output.input);
  hum.start();
  buzz.start();
  return stopping(audio, (fade) => output.release(fade), [hum, buzz]);
}

/** The tick of a fluorescent tube's starter as it fails to catch. */
export function tubeTick(audio: AudioManager, at: Point3, volume = 0.35): void {
  oneShot(audio, { at, volume, bus: 'ambience' }, 0.4, (out, t) => {
    noiseBurst(audio, out, { start: t, duration: 0.008, type: 'bandpass', frequency: 4200, q: 4, gain: 0.6 });
    thump(audio, out, t, 300, 0.05);
  });
}

/**
 * A car or a tractor on a road the player never sees, from `from` to `to` over `seconds`. The
 * position glides on the audio clock, so it costs nothing per frame.
 */
export function passingEngine(audio: AudioManager, from: Point3, to: Point3, options: { seconds?: number; kind?: 'car' | 'tractor'; volume?: number } = {}): void {
  const kind = options.kind ?? 'car';
  const seconds = options.seconds ?? (kind === 'car' ? 9 : 22);
  const ctx = audio.context;
  const output = audio.output({ bus: 'ambience', volume: options.volume ?? 0.5, at: from, refDistance: 8 });
  const t = audio.now + 0.05;
  const panner = output.panner!;
  panner.positionX.setValueAtTime(from.x, t);
  panner.positionY.setValueAtTime(from.y, t);
  panner.positionZ.setValueAtTime(from.z, t);
  panner.positionX.linearRampToValueAtTime(to.x, t + seconds);
  panner.positionY.linearRampToValueAtTime(to.y, t + seconds);
  panner.positionZ.linearRampToValueAtTime(to.z, t + seconds);

  const envelope = new GainNode(ctx, { gain: 0 });
  envelope.gain.setValueAtTime(0, t);
  envelope.gain.linearRampToValueAtTime(1, t + seconds * 0.3);
  envelope.gain.setValueAtTime(1, t + seconds * 0.7);
  envelope.gain.linearRampToValueAtTime(0, t + seconds);
  const muffle = new BiquadFilterNode(ctx, { type: 'lowpass', frequency: kind === 'car' ? 420 : 300, Q: 0.7 });
  envelope.connect(muffle).connect(output.input);

  const firing = kind === 'car' ? vary(38, 0.15) : vary(22, 0.1);
  const engine = new OscillatorNode(ctx, { type: 'sawtooth', frequency: firing });
  const knock = new OscillatorNode(ctx, { type: 'square', frequency: firing / 2 });
  // Tyres on wet tarmac for the car, the tractor's slow rattle.
  const road = loopNoise(audio);
  engine.connect(new GainNode(ctx, { gain: 0.3 })).connect(envelope);
  knock.connect(new GainNode(ctx, { gain: kind === 'car' ? 0.05 : 0.2 })).connect(envelope);
  road.connect(new BiquadFilterNode(ctx, { type: 'bandpass', frequency: kind === 'car' ? 900 : 200, Q: 0.6 })).connect(new GainNode(ctx, { gain: kind === 'car' ? 0.5 : 0.25 })).connect(envelope);
  // A little Doppler: the note sags as it goes past.
  engine.frequency.setValueAtTime(firing * 1.04, t);
  engine.frequency.linearRampToValueAtTime(firing * 0.96, t + seconds);
  [engine, knock].forEach((node) => {
    node.start(t);
    node.stop(t + seconds + 0.1);
  });
  road.stop(t + seconds + 0.1);
  setTimeout(() => output.release(0.1), (seconds + 0.5) * 1000);
}

/**
 * A church bell heard from far off across fields and through fog: the hum and the strike, the
 * highs gone, `strokes` slow strokes.
 */
export function distantBell(audio: AudioManager, at: Point3, strokes: number, volume = 0.5): void {
  oneShot(audio, { at, volume, bus: 'ambience' }, 1 + strokes * 2.4 + 6, (out, t) => {
    const ctx = audio.context;
    const far = new BiquadFilterNode(ctx, { type: 'lowpass', frequency: 900, Q: 0.5 });
    far.connect(out);
    for (let i = 0; i < strokes; i++) {
      const s = t + 0.5 + i * 2.4;
      [
        [196, 0.32, 6],
        [392, 0.36, 4.5],
        [466, 0.18, 3.5],
        [587, 0.1, 2.5],
      ].forEach(([frequency, gain, duration]) => tone(audio, far, { frequency: frequency!, start: s, duration: duration!, gain: gain!, attack: 0.004 }));
    }
  });
}
