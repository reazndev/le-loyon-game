import type { AudioManager, Output, Point3, SoundHandle } from '../../engine/audio/audioManager';
import { noiseBurst, thump } from '../../engine/audio/generators';
import { oneShot, tone } from '../../engine/characters/voices';

/**
 * Sounds of the village interiors, all synthesized: clocks, a television and a radio through a
 * wall, cutlery, old wood settling, the radiator, the phone. Loops return a handle; start them
 * with `loopSound` so they stop with the scene.
 */

const vary = (value: number, amount = 0.1) => value * (1 + (Math.random() - 0.5) * 2 * amount);
const pick = <T>(list: readonly T[]): T => list[Math.floor(Math.random() * list.length)]!;

/**
 * Calls `step` with the audio time of each event, scheduled a little ahead on a timer, until
 * stopped. `step` returns the seconds to the next event.
 */
function schedule(audio: AudioManager, step: (t: number) => number): () => void {
  let next = audio.now + 0.1;
  let stopped = false;
  let timer: ReturnType<typeof setTimeout>;
  const run = () => {
    if (stopped) return;
    while (next < audio.now + 0.4) next += Math.max(0.03, step(Math.max(next, audio.now + 0.02)));
    timer = setTimeout(run, 150);
  };
  run();
  return () => {
    stopped = true;
    clearTimeout(timer);
  };
}

function looping(output: Output, stop: () => void, extra: () => void = () => undefined): SoundHandle {
  return {
    stop: (fade = 0.5) => {
      stop();
      extra();
      output.release(fade);
    },
  };
}

/** A wall clock: tick and tock, one a second, the tock a little lower. */
export function clockTick(audio: AudioManager, at: Point3, volume = 0.35): SoundHandle {
  const output = audio.output({ bus: 'ambience', volume, at, refDistance: 0.9 });
  let tock = false;
  const stop = schedule(audio, (t) => {
    tock = !tock;
    noiseBurst(audio, output.input, { start: t, duration: 0.012, type: 'bandpass', frequency: tock ? 2300 : 3100, q: 6, gain: 0.5 });
    thump(audio, output.input, t, tock ? 420 : 520, 0.06);
    return 1;
  });
  return looping(output, stop);
}

/**
 * Speech heard through a wall: a voiced buzz through two moving formants, in syllables and
 * phrases, with the highs taken off by the wall. `pitch` is the speaker's voice in Hz.
 */
function murmur(audio: AudioManager, output: Output, pitch: () => number, wall = 700): () => void {
  const ctx = audio.context;
  const muffle = new BiquadFilterNode(ctx, { type: 'lowpass', frequency: wall, Q: 0.6 });
  muffle.connect(output.input);
  let left = 0;
  return schedule(audio, (t) => {
    if (left <= 0) {
      left = 3 + Math.floor(Math.random() * 9);
      return 0.25 + Math.random() * 0.9;
    }
    left -= 1;
    const length = vary(0.16, 0.45);
    const f0 = pitch();
    const voice = new OscillatorNode(ctx, { type: 'sawtooth', frequency: f0 });
    voice.frequency.linearRampToValueAtTime(f0 * vary(0.92, 0.06), t + length);
    const envelope = new GainNode(ctx, { gain: 0 });
    envelope.gain.setValueAtTime(0, t);
    envelope.gain.linearRampToValueAtTime(0.12, t + 0.03);
    envelope.gain.linearRampToValueAtTime(0, t + length);
    [vary(650, 0.35), vary(1500, 0.3)].forEach((formant, i) => {
      const band = new BiquadFilterNode(ctx, { type: 'bandpass', frequency: formant, Q: 5 });
      voice.connect(band).connect(new GainNode(ctx, { gain: i ? 0.5 : 1 })).connect(envelope);
    });
    envelope.connect(muffle);
    voice.start(t);
    voice.stop(t + length + 0.05);
    if (Math.random() < 0.3) noiseBurst(audio, muffle, { start: t, duration: 0.05, type: 'bandpass', frequency: 3000, q: 1, gain: 0.05 });
    return length + vary(0.05, 0.6);
  });
}

/** A television in another room: two or three voices talking, a laugh of music now and then. */
export function tvMurmur(audio: AudioManager, at: Point3, volume = 0.3): SoundHandle {
  const output = audio.output({ bus: 'ambience', volume, at, refDistance: 1.2 });
  const voices = [105, 190, 140];
  let speaker = 0;
  let said = 0;
  const stop = murmur(audio, output, () => {
    if (++said > 14) {
      said = 0;
      speaker = (speaker + 1) % voices.length;
    }
    return vary(voices[speaker]!, 0.08);
  }, 520);
  return looping(output, stop);
}

const chords = [
  [220, 277, 330],
  [185, 220, 277],
  [147, 185, 220],
  [165, 208, 247],
];
const tune = [440, 494, 554, 659, 740];

/**
 * A small radio on a shelf, turned low: a cheerful band with a tune, then a presenter talking,
 * then the band again. The cone is cheap and the room takes the rest.
 */
export function radio(audio: AudioManager, at: Point3, volume = 0.22): SoundHandle {
  const ctx = audio.context;
  const output = audio.output({ bus: 'ambience', volume, at, refDistance: 1 });
  const speaker = new BiquadFilterNode(ctx, { type: 'bandpass', frequency: 1100, Q: 0.5 });
  speaker.connect(output.input);
  const hiss = ctx.createBufferSource();
  hiss.buffer = audio.noise;
  hiss.loop = true;
  hiss.connect(new BiquadFilterNode(ctx, { type: 'highpass', frequency: 3000 })).connect(new GainNode(ctx, { gain: 0.012 })).connect(output.input);
  hiss.start();

  const talk = audio.output({ bus: 'ambience', volume: 0, at, refDistance: 1 });
  const stopTalk = murmur(audio, talk, () => vary(120, 0.1), 1800);
  let beat = 0;
  const stopBand = schedule(audio, (t) => {
    beat += 1;
    // Sixty-four beats of music, then thirty-two of talk.
    const playing = beat % 96 < 64;
    talk.input.gain.setTargetAtTime(playing ? 0 : volume * 1.4, t, 0.3);
    if (!playing) return 0.6;
    const chord = chords[Math.floor(beat / 4) % chords.length]!;
    if (beat % 2 === 0) chord.forEach((f) => tone(audio, speaker, { type: 'triangle', frequency: f, start: t, duration: 0.5, gain: 0.06 }));
    tone(audio, speaker, { type: 'square', frequency: chord[0]! / 2, start: t, duration: 0.25, gain: 0.05 });
    noiseBurst(audio, speaker, { start: t + 0.3, duration: 0.03, type: 'highpass', frequency: 6000, gain: 0.05 });
    if (Math.random() < 0.6) tone(audio, speaker, { type: 'sine', frequency: pick(tune), start: t, duration: 0.28, gain: 0.07 });
    return 0.6;
  });
  return looping(output, stopBand, () => {
    stopTalk();
    talk.release(0.3);
    hiss.stop(audio.now + 0.6);
  });
}

/** A fork or spoon set down on a plate somewhere, and the scrape of a chair. */
export function cutlery(audio: AudioManager, at: Point3, volume = 0.4): void {
  oneShot(audio, { at, volume, bus: 'ambience' }, 1.2, (out, t) => {
    const hits = 1 + Math.floor(Math.random() * 3);
    for (let i = 0; i < hits; i++) {
      const s = t + i * vary(0.12, 0.5);
      [vary(3200, 0.15), vary(5100, 0.1), vary(7400, 0.1)].forEach((f, n) => tone(audio, out, { frequency: f, start: s, duration: 0.18 - n * 0.04, gain: 0.05 / (n + 1) }));
    }
    if (Math.random() < 0.3) noiseBurst(audio, out, { start: t + 0.5, duration: 0.25, type: 'bandpass', frequency: 420, q: 4, gain: 0.12, attack: 0.05 });
  });
}

/** Old wood taking weight somewhere in the house: a floorboard, a beam, a stair tread. */
export function houseCreak(audio: AudioManager, at: Point3, volume = 0.5): void {
  oneShot(audio, { at, volume, bus: 'ambience' }, 2.2, (out, t) => {
    const f = vary(110, 0.25);
    tone(audio, out, { type: 'sawtooth', frequency: f, to: f * vary(0.75, 0.1), start: t, duration: vary(0.5, 0.4), gain: 0.04, attack: 0.12 });
    noiseBurst(audio, out, { start: t, duration: vary(0.45, 0.3), type: 'bandpass', frequency: vary(700, 0.3), q: 16, gain: 0.25, attack: 0.15 });
    if (Math.random() < 0.5) noiseBurst(audio, out, { start: t + 0.6, duration: 0.05, type: 'lowpass', frequency: 260, gain: 0.3 });
  });
}

/** One knock of a radiator pipe: a metallic clank with a short ring. */
export function radiatorKnock(audio: AudioManager, at: Point3, volume = 0.8): void {
  oneShot(audio, { at, volume }, 1.2, (out, t) => {
    thump(audio, out, t, 160, 0.5);
    noiseBurst(audio, out, { start: t, duration: 0.03, type: 'bandpass', frequency: 1800, q: 5, gain: 0.6 });
    [612, 1190, 1730].forEach((f, n) => tone(audio, out, { frequency: f, start: t, duration: 0.5 - n * 0.12, gain: 0.05 / (n + 1) }));
  });
}

/**
 * Steam pushing through a radiator's bleed valve: a hiss that swells and falls twice, a spit of
 * water, then a knock in the pipe. From across a dark room the two swells are a breath in and out.
 */
export function radiatorHiss(audio: AudioManager, at: Point3, volume = 0.5): void {
  oneShot(audio, { at, volume }, 4, (out, t) => {
    noiseBurst(audio, out, { start: t, duration: 1.2, type: 'highpass', frequency: 3600, gain: 0.22, attack: 0.5 });
    noiseBurst(audio, out, { start: t + 1.6, duration: 1.1, type: 'bandpass', frequency: 4400, q: 1.5, gain: 0.16, attack: 0.3 });
    [2.9, 3.0, 3.16].forEach((s) => noiseBurst(audio, out, { start: t + s, duration: 0.03, type: 'bandpass', frequency: vary(2600, 0.2), q: 4, gain: 0.3 }));
  });
  setTimeout(() => radiatorKnock(audio, at, volume), 3400);
}

/** An old fridge's compressor kicking in: a heavy knock, the motor shuddering up, and the bottles in the door rattling. */
export function fridgeKick(audio: AudioManager, at: Point3, volume = 1): void {
  oneShot(audio, { at, volume }, 2.5, (out, t) => {
    thump(audio, out, t, 75, 1);
    noiseBurst(audio, out, { start: t, duration: 0.15, type: 'lowpass', frequency: 300, gain: 0.7 });
    tone(audio, out, { type: 'sawtooth', frequency: 38, to: 50, start: t + 0.05, duration: 1.6, gain: 0.12, attack: 0.05 });
    [0.08, 0.15, 0.24, 0.36].forEach((s, i) => tone(audio, out, { frequency: vary(2400, 0.2), start: t + s, duration: 0.12, gain: 0.05 / (i + 1) }));
  });
}

/** The Swiss PTT ring: two short bursts of the bell, then a pause. Rings until stopped. */
export function phoneRing(audio: AudioManager, at: Point3, volume = 0.7): SoundHandle {
  const output = audio.output({ bus: 'sfx', volume, at, refDistance: 1.4 });
  const stop = schedule(audio, (t) => {
    [0, 0.45].forEach((offset) => {
      for (let i = 0; i < 16; i++) {
        const s = t + offset + i * 0.025;
        tone(audio, output.input, { type: 'square', frequency: 1020, start: s, duration: 0.02, gain: 0.04 });
        tone(audio, output.input, { frequency: 2050, start: s, duration: 0.03, gain: 0.03 });
      }
    });
    return 3.2;
  });
  return looping(output, stop);
}

/** The receiver lifted off the hook: a clack and the rattle of the cradle. */
export function receiverUp(audio: AudioManager, at: Point3): void {
  oneShot(audio, { at, volume: 0.6 }, 0.6, (out, t) => {
    noiseBurst(audio, out, { start: t, duration: 0.04, type: 'bandpass', frequency: 1400, q: 3, gain: 0.5 });
    noiseBurst(audio, out, { start: t + 0.07, duration: 0.03, type: 'bandpass', frequency: 2400, q: 4, gain: 0.25 });
  });
}

/** The dial tone of a Swiss line, 425 Hz, held until the receiver goes down. */
export function dialTone(audio: AudioManager, at: Point3): SoundHandle {
  const output = audio.output({ bus: 'sfx', volume: 0.12, at, refDistance: 0.4 });
  const hum = new OscillatorNode(audio.context, { frequency: 425 });
  hum.connect(output.input);
  hum.start();
  return { stop: (fade = 0.05) => (output.release(fade), hum.stop(audio.now + fade + 0.05)) };
}

/** The low room tone of a quiet house: almost nothing, a warm hum under everything. */
export function roomTone(audio: AudioManager, volume = 0.12): SoundHandle {
  const ctx = audio.context;
  const output = audio.output({ bus: 'ambience', volume });
  const air = ctx.createBufferSource();
  air.buffer = audio.noise;
  air.loop = true;
  air.connect(new BiquadFilterNode(ctx, { type: 'lowpass', frequency: 180 })).connect(new GainNode(ctx, { gain: 0.3 })).connect(output.input);
  air.start();
  return { stop: (fade = 0.5) => (output.release(fade), air.stop(audio.now + fade + 0.05)) };
}

/** Runs `play` now and then, such as a creak or cutlery; `every` is the average gap in seconds. */
export function nowAndThen(every: number, play: () => void): SoundHandle {
  let timer: ReturnType<typeof setTimeout>;
  const wait = () => {
    timer = setTimeout(() => {
      play();
      wait();
    }, vary(every, 0.6) * 1000);
  };
  wait();
  return { stop: () => clearTimeout(timer) };
}

/** A door along the corridor pulled shut: the latch, then the leaf against the frame. */
export function doorShut(audio: AudioManager, at: Point3, volume = 0.6): void {
  oneShot(audio, { at, volume }, 1, (out, t) => {
    noiseBurst(audio, out, { start: t, duration: 0.03, type: 'bandpass', frequency: 2600, q: 4, gain: 0.3 });
    thump(audio, out, t + 0.06, 90, 0.7);
    noiseBurst(audio, out, { start: t + 0.06, duration: 0.15, type: 'lowpass', frequency: 500, gain: 0.4 });
  });
}
