import type { AudioManager, Point3 } from '../../engine/audio/audioManager';
import { playFootstep } from '../../engine/audio/footsteps';
import { noiseBurst, thump } from '../../engine/audio/generators';
import type { Surface } from '../../engine/physics/ground';
import { bark, collarBell, growl, oneShot, tone, type OneShot } from '../../engine/characters/voices';

/**
 * The sound palette from docs/script/07-scares.md, synthesized. Every sound plays once, from a
 * point when `at` is given.
 */

const vary = (value: number, amount = 0.1) => value * (1 + (Math.random() - 0.5) * 2 * amount);

/** A heavy branch snapping somewhere in the trees: a crack, a split, and leaves settling. */
function branch(audio: AudioManager, options: OneShot): void {
  oneShot(audio, { volume: 1.1, ...options }, 1.6, (out, t) => {
    thump(audio, out, t, vary(90), 0.5);
    noiseBurst(audio, out, { start: t, duration: 0.05, type: 'bandpass', frequency: vary(1100), q: 2, gain: 1 });
    noiseBurst(audio, out, { start: t + vary(0.07, 0.4), duration: 0.04, type: 'bandpass', frequency: vary(1600), q: 3, gain: 0.6 });
    noiseBurst(audio, out, { start: t + 0.12, duration: 0.6, type: 'highpass', frequency: 2500, gain: 0.08, attack: 0.1 });
  });
}

/** One slow breath through a respirator filter: in, with the valve's click, then out. */
function breathMask(audio: AudioManager, options: OneShot): void {
  oneShot(audio, { volume: 0.7, ...options }, 4.5, (out, t) => {
    noiseBurst(audio, out, { start: t, duration: 1.5, type: 'bandpass', frequency: 700, q: 4, gain: 0.35, attack: 0.6 });
    noiseBurst(audio, out, { start: t + 0.1, duration: 1.3, type: 'bandpass', frequency: 1900, q: 9, gain: 0.08, attack: 0.5 });
    noiseBurst(audio, out, { start: t + 1.75, duration: 0.012, type: 'bandpass', frequency: 2600, q: 3, gain: 0.35 });
    noiseBurst(audio, out, { start: t + 1.9, duration: 1.9, type: 'bandpass', frequency: 420, q: 3, gain: 0.4, attack: 0.25 });
    tone(audio, out, { type: 'triangle', frequency: 118, to: 96, start: t + 1.95, duration: 1.6, gain: 0.04, attack: 0.3 });
  });
}

/** A cough held in by rubber: two dull bursts. */
function coughMask(audio: AudioManager, options: OneShot): void {
  oneShot(audio, { volume: 0.8, ...options }, 1.2, (out, t) => {
    [0, 0.32].forEach((offset, i) => {
      noiseBurst(audio, out, { start: t + offset, duration: 0.18 - i * 0.04, type: 'lowpass', frequency: 520, gain: 0.7 - i * 0.2, attack: 0.01 });
      tone(audio, out, { type: 'sawtooth', frequency: vary(150), to: 110, start: t + offset, duration: 0.14, gain: 0.07 });
    });
  });
}

/** A knuckle or a stone on steel: a thud and a short ring. */
function knockMetal(audio: AudioManager, options: OneShot): void {
  oneShot(audio, { volume: 0.9, ...options }, 1.5, (out, t) => {
    thump(audio, out, t, 160, 0.5);
    [317, 589, 893, 1240].forEach((f, n) => tone(audio, out, { frequency: vary(f, 0.02), start: t, duration: 0.9 - n * 0.15, gain: 0.12 / (n + 1) }));
  });
}

/** A tin cup set down on concrete. */
function metalCup(audio: AudioManager, options: OneShot): void {
  oneShot(audio, { volume: 0.7, ...options }, 1.2, (out, t) => {
    noiseBurst(audio, out, { start: t, duration: 0.015, type: 'highpass', frequency: 3000, gain: 0.5 });
    noiseBurst(audio, out, { start: t + 0.05, duration: 0.01, type: 'highpass', frequency: 3500, gain: 0.25 });
    [1730, 2910, 4120].forEach((f, n) => tone(audio, out, { frequency: vary(f, 0.02), start: t, duration: 0.6 - n * 0.12, gain: 0.08 / (n + 1) }));
  });
}

/** An iron gate on a dry hinge: a long wavering squeal. */
function gate(audio: AudioManager, options: OneShot, soft: boolean): void {
  const length = soft ? 1.4 : 1.8;
  oneShot(audio, { volume: soft ? 0.5 : 0.8, ...options }, length + 0.3, (out, t) => {
    const ctx = audio.context;
    const wobble = new OscillatorNode(ctx, { frequency: soft ? 9 : 14 });
    const voice = new OscillatorNode(ctx, { type: 'sawtooth', frequency: soft ? 310 : 820 });
    wobble.connect(new GainNode(ctx, { gain: soft ? 25 : 60 })).connect(voice.frequency);
    voice.frequency.linearRampToValueAtTime(soft ? 260 : 1150, t + length);
    const band = new BiquadFilterNode(ctx, { type: 'bandpass', frequency: soft ? 600 : 1500, Q: 3 });
    const envelope = new GainNode(ctx, { gain: 0 });
    envelope.gain.setValueAtTime(0, t);
    envelope.gain.linearRampToValueAtTime(0.25, t + 0.15);
    envelope.gain.setValueAtTime(0.25, t + length - 0.4);
    envelope.gain.linearRampToValueAtTime(0, t + length);
    voice.connect(band).connect(envelope).connect(out);
    [wobble, voice].forEach((node) => {
      node.start(t);
      node.stop(t + length + 0.05);
    });
  });
}

/** Raymond's tune: the same four whistled notes every time. */
function whistle(audio: AudioManager, options: OneShot): void {
  const notes: [number, number][] = [
    [1175, 0.35],
    [1568, 0.35],
    [1760, 0.3],
    [1397, 0.8],
  ];
  oneShot(audio, { volume: 0.4, ...options }, 2.4, (out, t) => {
    let start = t;
    notes.forEach(([f, length]) => {
      tone(audio, out, { frequency: f * 0.995, to: f, start, duration: length, gain: 0.25, attack: 0.04 });
      noiseBurst(audio, out, { start, duration: length, type: 'bandpass', frequency: f, q: 12, gain: 0.05, attack: 0.04 });
      start += length + 0.06;
    });
  });
}

/** Hiss on a phone line. */
function staticHiss(audio: AudioManager, options: OneShot): void {
  oneShot(audio, { volume: 0.5, ...options }, 4.2, (out, t) => {
    noiseBurst(audio, out, { start: t, duration: 4, type: 'bandpass', frequency: 2400, q: 0.7, gain: 0.3, attack: 0.05 });
  });
}

/** A floorboard cracking under a foot. */
function floorboard(audio: AudioManager, options: OneShot): void {
  oneShot(audio, { volume: 1.2, ...options }, 1, (out, t) => {
    thump(audio, out, t, 120, 0.8);
    noiseBurst(audio, out, { start: t, duration: 0.09, type: 'bandpass', frequency: 450, q: 5, gain: 0.8 });
    tone(audio, out, { type: 'sawtooth', frequency: 190, to: 150, start: t + 0.02, duration: 0.25, gain: 0.12 });
  });
}

/** A loud, low hit that hangs: the one sound a real jumpscare gets. */
function hit(audio: AudioManager, options: OneShot): void {
  oneShot(audio, { volume: 1.3, ...options }, 3.2, (out, t) => {
    thump(audio, out, t, 70, 1);
    noiseBurst(audio, out, { start: t, duration: 0.6, type: 'lowpass', frequency: 900, gain: 0.8 });
    [55, 58.3, 82.4, 116.5].forEach((f) => tone(audio, out, { type: 'sawtooth', frequency: f, start: t, duration: 3, gain: 0.08, attack: 0.01 }));
  });
}

/**
 * A low swell under everything, for a moment the player thinks they have seen him. It rises
 * instead of hitting, so it reads as dread rather than a jumpscare.
 */
function lowSting(audio: AudioManager, options: OneShot): void {
  oneShot(audio, { volume: 0.9, ...options }, 4.5, (out, t) => {
    [41.2, 43.7, 61.7].forEach((f) => tone(audio, out, { type: 'triangle', frequency: f, to: f * 0.97, start: t, duration: 4, gain: 0.12, attack: 1.2 }));
    noiseBurst(audio, out, { start: t + 0.2, duration: 3.2, type: 'lowpass', frequency: 220, gain: 0.25, attack: 1.4 });
  });
}

/** Three barks close together, the way Bari barks at a stranger. */
function barkThree(audio: AudioManager, options: OneShot): void {
  [0, 0.42, 0.78].forEach((delay) => setTimeout(() => bark(audio, options), delay * 1000));
}

/** Somebody else's step, a little heavier than the player's. `drag` adds the scrape of a dragged foot. */
export function otherStep(audio: AudioManager, surface: Surface, at: Point3, drag: boolean): void {
  playFootstep(audio, surface, { at, level: 1.3 });
  if (drag) oneShot(audio, { at, volume: 0.5 }, 0.6, (out, t) => noiseBurst(audio, out, { start: t + 0.12, duration: 0.25, type: 'bandpass', frequency: 1400, q: 0.8, gain: 0.25, attack: 0.1 }));
}

export const sounds = {
  sfx_step_other: (audio: AudioManager, options: OneShot) => otherStep(audio, 'gravel', options.at ?? audio.listenerPosition, true),
  sfx_branch: branch,
  sfx_breath_mask: breathMask,
  sfx_cough_mask: coughMask,
  sfx_bell_dog: collarBell,
  sfx_whistle_raymond: whistle,
  sfx_gate_squeal: (audio: AudioManager, options: OneShot) => gate(audio, options, false),
  sfx_gate_creak_back: (audio: AudioManager, options: OneShot) => gate(audio, options, true),
  sfx_metal_cup: metalCup,
  sfx_knock_metal: knockMetal,
  sfx_static: staticHiss,
  sfx_floorboard: floorboard,
  sfx_bark: barkThree,
  sfx_growl: growl,
  sfx_hit: hit,
  sfx_sting_low: lowSting,
} satisfies Record<string, (audio: AudioManager, options: OneShot) => void>;

export type SoundId = keyof typeof sounds;

export function playSound(audio: AudioManager, id: SoundId, options: OneShot = {}): void {
  sounds[id](audio, options);
}
