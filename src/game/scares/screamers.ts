import type { Beat, Trigger } from './beats';

/**
 * A loud jumpscare: a face fills the screen for under a second with a scream. Fires once per
 * game, `after` seconds in the scene unless another trigger is given.
 */
export function screamer(id: string, when: Trigger | number): Beat {
  return { id: `screamer_${id}`, when: typeof when === 'number' ? { after: when } : when, do: [{ screamer: true }], set: `screamer_${id}` };
}
