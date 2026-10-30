import type { AudioManager, Bus, Point3 } from '../../engine/audio/audioManager';

/**
 * Recordings in `public/assets/audio/<folder>/<name>_<take>.ogg`, and how many takes each has.
 * Animal calls are in `wild`, leaves and bushes in `rustle`. Sources in docs/credits.md.
 */
const takes = { owl: 2, fox: 2, deer: 3, crow: 3, raven: 1, buzzard: 3, bush: 4, leaves: 8 } as const;
const RUSTLES = new Set(['bush', 'leaves']);

export type Animal = 'owl' | 'fox' | 'deer' | 'crow' | 'raven' | 'buzzard';
/** Something pushing through a bush, or leaves stirred, for movement in the undergrowth. */
export type Rustle = 'bush' | 'leaves';
type Take = Animal | Rustle;

const url = (name: Take, take: number) => `${import.meta.env.BASE_URL}assets/audio/${RUSTLES.has(name) ? 'rustle' : 'wild'}/${name}_${take}.ogg`;

export interface CallOptions {
  at?: Point3;
  volume?: number;
  bus?: Bus;
}

/** One call from `animal`: a random take, a little higher or lower each time so repeats don't match. */
export function animalCall(audio: AudioManager, animal: Animal, options: CallOptions = {}): void {
  playTake(audio, animal, options);
}

/** One rustle from the undergrowth, a random take. */
export function rustle(audio: AudioManager, kind: Rustle, options: CallOptions = {}): void {
  playTake(audio, kind, options);
}

function playTake(audio: AudioManager, name: Take, options: CallOptions): void {
  const take = 1 + Math.floor(Math.random() * takes[name]);
  audio.play(url(name, take), {
    bus: options.bus ?? 'ambience',
    volume: options.volume ?? 0.6,
    rate: 0.94 + Math.random() * 0.12,
    ...(options.at ? { at: options.at, refDistance: 3 } : {}),
  });
}

/** Fetches every take of these now, so the first one lands on time. */
export function preloadRecordings(audio: AudioManager, names: readonly Take[]): void {
  names.forEach((name) => Array.from({ length: takes[name] }, (_, i) => audio.load(url(name, i + 1)).catch(() => undefined)));
}
