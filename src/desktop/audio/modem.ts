import type { AudioManager, SoundHandle } from '../../engine/audio/audioManager';
import { noiseBurst } from '../../engine/audio/generators';
import { seeded } from '../gfx/pixels';
import type { Handshake, ModemSound } from './handshake';

/**
 * Plays a handshake through a telephone-band filter and a small overdriven speaker, the way a
 * modem's monitor speaker sounded.
 */
export function playHandshake(audio: AudioManager, script: Handshake): SoundHandle {
  const ctx = audio.context;
  const output = audio.output({ bus: 'sfx', volume: 0.55 });
  const highpass = new BiquadFilterNode(ctx, { type: 'highpass', frequency: 300, Q: 0.7 });
  const lowpass = new BiquadFilterNode(ctx, { type: 'lowpass', frequency: 3400, Q: 0.7 });
  const speaker = new WaveShaperNode(ctx, { curve: softClip(), oversample: '2x' });
  highpass.connect(lowpass).connect(speaker).connect(output.input);

  const t0 = audio.now + 0.05;
  const nodes = script.sounds.flatMap((sound) => schedule(audio, sound, t0, highpass));
  return {
    stop: (fade = 0.05) => {
      output.release(fade);
      nodes.forEach((node) => {
        try {
          node.stop(audio.now + fade + 0.05);
        } catch {
          // Nodes that have not started yet throw on an earlier stop time in some browsers.
        }
      });
    },
  };
}

function schedule(audio: AudioManager, sound: ModemSound, t0: number, destination: AudioNode): AudioScheduledSourceNode[] {
  const ctx = audio.context;
  const start = t0 + sound.start;
  switch (sound.kind) {
    case 'click':
      noiseBurst(audio, destination, { start, duration: 0.02, type: 'bandpass', frequency: 1400, q: 1.5, gain: 0.9 });
      return [];
    case 'tone': {
      const envelope = gate(ctx, start, sound.duration, sound.gain, destination);
      if (sound.wobble) {
        const lfo = new OscillatorNode(ctx, { frequency: sound.wobble });
        lfo.connect(new GainNode(ctx, { gain: sound.gain * 0.25 })).connect(envelope.gain);
        lfo.start(start);
        lfo.stop(start + sound.duration);
        return [lfo, ...tones(ctx, sound.freqs, start, sound.duration, envelope)];
      }
      return tones(ctx, sound.freqs, start, sound.duration, envelope);
    }
    case 'fsk': {
      const envelope = gate(ctx, start, sound.duration, sound.gain, destination);
      const oscillator = new OscillatorNode(ctx, { frequency: sound.freqs[0] });
      const random = seeded(Math.round(sound.start * 1000));
      for (let t = 0; t < sound.duration; t += 1 / sound.baud) {
        oscillator.frequency.setValueAtTime(sound.freqs[random() < 0.5 ? 0 : 1], start + t);
      }
      oscillator.connect(envelope);
      oscillator.start(start);
      oscillator.stop(start + sound.duration);
      return [oscillator];
    }
    case 'probe': {
      const envelope = gate(ctx, start, sound.duration, sound.gain, destination);
      const freqs = Array.from({ length: 24 }, (_, i) => 150 * (i + 1));
      return tones(ctx, freqs, start, sound.duration, envelope);
    }
    case 'hiss': {
      const envelope = gate(ctx, start, sound.duration, sound.gain, destination);
      const source = ctx.createBufferSource();
      source.buffer = audio.noise;
      source.loop = true;
      source.connect(new BiquadFilterNode(ctx, { type: 'bandpass', frequency: sound.center, Q: sound.q })).connect(envelope);
      source.start(start, Math.random());
      source.stop(start + sound.duration);
      return [source];
    }
  }
}

function gate(ctx: AudioContext, start: number, duration: number, gain: number, destination: AudioNode): GainNode {
  const envelope = new GainNode(ctx, { gain: 0 });
  envelope.gain.setValueAtTime(0, start);
  envelope.gain.linearRampToValueAtTime(gain, start + 0.008);
  envelope.gain.setValueAtTime(gain, start + duration - 0.008);
  envelope.gain.linearRampToValueAtTime(0, start + duration);
  envelope.connect(destination);
  return envelope;
}

function tones(ctx: AudioContext, freqs: number[], start: number, duration: number, destination: AudioNode): OscillatorNode[] {
  return freqs.map((frequency) => {
    const oscillator = new OscillatorNode(ctx, { frequency, type: 'sine' });
    oscillator.connect(destination);
    oscillator.start(start);
    oscillator.stop(start + duration);
    return oscillator;
  });
}

function softClip(): Float32Array<ArrayBuffer> {
  const curve = new Float32Array(1024);
  for (let i = 0; i < curve.length; i++) {
    const x = (i / (curve.length - 1)) * 2 - 1;
    curve[i] = Math.tanh(x * 2.2) / Math.tanh(2.2);
  }
  return curve;
}
