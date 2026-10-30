import type { AudioManager, Bus, Point3 } from '../../engine/audio/audioManager';

/** Field recordings in `public/assets/audio/wild/<animal>_<take>.ogg`, and how many takes each has. Sources in docs/credits.md. */
const takes = { owl: 2, fox: 2, deer: 3, crow: 3, raven: 1, buzzard: 3 } as const;

export type Animal = keyof typeof takes;

const url = (animal: Animal, take: number) => `${import.meta.env.BASE_URL}assets/audio/wild/${animal}_${take}.ogg`;

export interface CallOptions {
  at?: Point3;
  volume?: number;
  bus?: Bus;
}

/** One call from `animal`: a random take, a little higher or lower each time so repeats don't match. */
export function animalCall(audio: AudioManager, animal: Animal, options: CallOptions = {}): void {
  const take = 1 + Math.floor(Math.random() * takes[animal]);
  audio.play(url(animal, take), {
    bus: options.bus ?? 'ambience',
    volume: options.volume ?? 0.6,
    rate: 0.94 + Math.random() * 0.12,
    ...(options.at ? { at: options.at, refDistance: 3 } : {}),
  });
}

/** Fetches every take of these animals now, so the first call lands on time. */
export function preloadAnimals(audio: AudioManager, animals: readonly Animal[]): void {
  animals.forEach((animal) => Array.from({ length: takes[animal] }, (_, i) => audio.load(url(animal, i + 1)).catch(() => undefined)));
}
