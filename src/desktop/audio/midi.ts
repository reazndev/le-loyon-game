import type { AudioManager, SoundHandle } from '../../engine/audio/audioManager';
import { noiseBurst, thump } from '../../engine/audio/generators';
import { bass, frequency, lead, parseTrack, stepsPerBar, tuneTempo, type NoteEvent } from './tune';

const BARS = 8;

/** Loops the homepage tune on cheap-sounding square and triangle voices until stopped. */
export function playTune(audio: AudioManager): SoundHandle {
  const output = audio.output({ bus: 'music', volume: 0.32 });
  // A small sound card: everything through one dull low-pass.
  const card = new BiquadFilterNode(audio.context, { type: 'lowpass', frequency: 2600, Q: 0.4 });
  card.connect(output.input);
  const stepSeconds = 60 / tuneTempo / 2;
  const loopSeconds = stepSeconds * stepsPerBar * BARS;
  const leadNotes = parseTrack(lead);
  const bassNotes = parseTrack(bass);
  let loopStart = audio.now + 0.1;
  let timer: ReturnType<typeof setTimeout>;

  const scheduleLoop = () => {
    voice(audio, card, leadNotes, loopStart, stepSeconds, 'square', 0.09);
    voice(audio, card, bassNotes, loopStart, stepSeconds, 'triangle', 0.22);
    drums(audio, card, loopStart, stepSeconds);
    loopStart += loopSeconds;
    timer = setTimeout(scheduleLoop, (loopStart - audio.now - 0.5) * 1000);
  };
  scheduleLoop();

  return {
    stop: (fade = 0.05) => {
      clearTimeout(timer);
      output.release(fade);
    },
  };
}

function voice(
  audio: AudioManager,
  destination: AudioNode,
  notes: NoteEvent[],
  start: number,
  step: number,
  type: OscillatorType,
  gain: number,
): void {
  const ctx = audio.context;
  notes.forEach((note) => {
    const on = start + note.step * step;
    const off = on + note.steps * step * 0.92;
    const oscillator = new OscillatorNode(ctx, { type, frequency: frequency(note.midi) });
    const envelope = new GainNode(ctx, { gain: 0 });
    envelope.gain.setValueAtTime(0, on);
    envelope.gain.linearRampToValueAtTime(gain, on + 0.006);
    envelope.gain.setTargetAtTime(gain * 0.6, on + 0.02, 0.15);
    envelope.gain.setTargetAtTime(0, off, 0.02);
    oscillator.connect(envelope).connect(destination);
    oscillator.start(on);
    oscillator.stop(off + 0.15);
  });
}

function drums(audio: AudioManager, destination: AudioNode, start: number, step: number): void {
  for (let i = 0; i < BARS * stepsPerBar; i++) {
    const at = start + i * step;
    noiseBurst(audio, destination, { start: at, duration: 0.025, type: 'highpass', frequency: 7000, gain: 0.05 });
    if (i % 4 === 0) thump(audio, destination, at, 110, 0.5);
    if (i % 4 === 2) noiseBurst(audio, destination, { start: at, duration: 0.09, type: 'bandpass', frequency: 1800, q: 0.8, gain: 0.18 });
  }
}
