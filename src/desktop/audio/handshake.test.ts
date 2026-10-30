import { describe, expect, it } from 'vitest';
import { handshake } from './handshake';

describe('handshake', () => {
  const script = handshake('0848 80 80 80', '33,600');

  it('dials ten DTMF tones', () => {
    const digits = script.sounds.filter((s) => s.kind === 'tone' && s.freqs.length === 2);
    expect(digits).toHaveLength(10);
  });

  it('lasts about eighteen seconds and ends connected', () => {
    expect(script.duration).toBeGreaterThan(16);
    expect(script.duration).toBeLessThan(20);
    expect(script.status.map((s) => s.text)).toEqual([
      'Dialing...',
      'Verifying user name and password...',
      'Logging on to network...',
      'Connected at 33,600 bps',
    ]);
  });

  it('keeps every sound inside the handshake', () => {
    script.sounds.forEach((sound) => {
      const end = sound.start + ('duration' in sound ? sound.duration : 0);
      expect(end).toBeLessThanOrEqual(script.duration);
    });
  });
});
