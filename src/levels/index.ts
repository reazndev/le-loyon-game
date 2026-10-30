import type { Scene } from '../game/scene';

/**
 * Every area folder exports `scenes` from its index.ts. Collecting them with a glob lets
 * area authors add scenes without editing a shared list.
 */
const modules = import.meta.glob<{ scenes: Scene[] }>('./*/index.ts', { eager: true });

export const allScenes: Scene[] = Object.values(modules).flatMap((module) => module.scenes ?? []);
