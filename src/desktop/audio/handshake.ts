/** The modem handshake as a timeline of sounds and status lines, in seconds from the dial. */

export type ModemSound =
  | { kind: 'click'; start: number }
  | { kind: 'tone'; start: number; duration: number; freqs: number[]; gain: number; wobble?: number }
  | { kind: 'fsk'; start: number; duration: number; freqs: [number, number]; baud: number; gain: number }
  | { kind: 'probe'; start: number; duration: number; gain: number }
  | { kind: 'hiss'; start: number; duration: number; gain: number; center: number; q: number };

export interface Handshake {
  sounds: ModemSound[];
  status: { at: number; text: string }[];
  duration: number;
}

const dtmf: Record<string, [number, number]> = {
  '1': [697, 1209], '2': [697, 1336], '3': [697, 1477],
  '4': [770, 1209], '5': [770, 1336], '6': [770, 1477],
  '7': [852, 1209], '8': [852, 1336], '9': [852, 1477],
  '0': [941, 1336], '*': [941, 1209], '#': [941, 1477],
};

/** Swiss telephone tones: dial tone and ringback are both 425 Hz. */
const SWISS_TONE = 425;
const DIGIT_ON = 0.09;
const DIGIT_GAP = 0.07;

/** About 18 seconds: dial tone, the number, two rings, then the answer tone, probing, and training. */
export function handshake(number: string, speed: string): Handshake {
  const digits = [...number].filter((c) => c in dtmf);
  const dialStart = 1.6;
  const digitSounds: ModemSound[] = digits.map((digit, i) => ({
    kind: 'tone',
    start: dialStart + i * (DIGIT_ON + DIGIT_GAP),
    duration: DIGIT_ON,
    freqs: dtmf[digit]!,
    gain: 0.22,
  }));
  const dialed = dialStart + digits.length * (DIGIT_ON + DIGIT_GAP);
  const ring = dialed + 1;
  const answer = ring + 4.1;
  const train = answer + 5.2;
  const sounds: ModemSound[] = [
    { kind: 'click', start: 0 },
    { kind: 'tone', start: 0.15, duration: 1.3, freqs: [SWISS_TONE], gain: 0.2 },
    ...digitSounds,
    { kind: 'tone', start: ring, duration: 1, freqs: [SWISS_TONE], gain: 0.12 },
    { kind: 'tone', start: ring + 3, duration: 0.8, freqs: [SWISS_TONE], gain: 0.12 },
    // The answer tone, with the slow amplitude wobble of V.8 modems.
    { kind: 'tone', start: answer, duration: 2.6, freqs: [2100], gain: 0.2, wobble: 15 },
    { kind: 'fsk', start: answer + 1.7, duration: 0.9, freqs: [1650, 1850], baud: 300, gain: 0.12 },
    { kind: 'fsk', start: answer + 2.6, duration: 0.7, freqs: [980, 1180], baud: 300, gain: 0.16 },
    { kind: 'probe', start: answer + 3.5, duration: 0.3, gain: 0.05 },
    { kind: 'probe', start: answer + 4.0, duration: 0.3, gain: 0.05 },
    { kind: 'fsk', start: answer + 4.4, duration: 0.7, freqs: [1200, 2400], baud: 40, gain: 0.14 },
    { kind: 'hiss', start: train, duration: 1.5, gain: 0.9, center: 1800, q: 0.6 },
    { kind: 'tone', start: train, duration: 1.5, freqs: [1829], gain: 0.05 },
    { kind: 'hiss', start: train + 1.5, duration: 1.3, gain: 0.75, center: 1300, q: 0.9 },
    { kind: 'hiss', start: train + 2.8, duration: 1.1, gain: 0.35, center: 2100, q: 0.5 },
    { kind: 'click', start: train + 4.0 },
  ];
  const duration = train + 4.5;
  return {
    sounds,
    status: [
      { at: 0, text: 'Dialing...' },
      { at: train, text: 'Verifying user name and password...' },
      { at: train + 2.6, text: 'Logging on to network...' },
      { at: duration, text: `Connected at ${speed} bps` },
    ],
    duration,
  };
}
