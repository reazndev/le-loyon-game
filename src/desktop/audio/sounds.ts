import type { AudioManager } from '../../engine/audio/audioManager';
import { click, noiseBurst, thump } from '../../engine/audio/generators';

/** The dry plastic click of the mouse button. */
export function mouseClick(audio: AudioManager): void {
  click(audio, { bus: 'ui', volume: 0.3 });
}

/** The hard disk seeking: a quick run of ticks and soft thuds, as when a program loads. */
export function diskSeek(audio: AudioManager, seconds = 0.6): void {
  const output = audio.output({ bus: 'sfx', volume: 0.25 });
  const count = Math.round(seconds * 14);
  for (let i = 0; i < count; i++) {
    const at = audio.now + (i / count) * seconds + Math.random() * 0.03;
    noiseBurst(audio, output.input, { start: at, duration: 0.008, type: 'bandpass', frequency: 2600 + Math.random() * 1500, q: 3, gain: 0.5 });
    if (Math.random() < 0.35) thump(audio, output.input, at, 70 + Math.random() * 30, 0.25);
  }
  setTimeout(() => output.release(0), (seconds + 0.5) * 1000);
}

/** A short two-note chime for message boxes. */
export function chime(audio: AudioManager): void {
  const ctx = audio.context;
  const output = audio.output({ bus: 'ui', volume: 0.18 });
  [880, 659].forEach((frequency, i) => {
    const start = audio.now + i * 0.11;
    const oscillator = new OscillatorNode(ctx, { type: 'triangle', frequency });
    const envelope = new GainNode(ctx, { gain: 0 });
    envelope.gain.setValueAtTime(0, start);
    envelope.gain.linearRampToValueAtTime(0.8, start + 0.005);
    envelope.gain.exponentialRampToValueAtTime(0.001, start + 0.5);
    oscillator.connect(envelope).connect(output.input);
    oscillator.start(start);
    oscillator.stop(start + 0.55);
  });
  setTimeout(() => output.release(0), 900);
}
