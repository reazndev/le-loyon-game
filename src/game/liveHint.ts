import { checkStory } from '../content';
import type { Condition, StateView } from './conditions';

/** A clue for the top-right corner, shown while it applies to where the player is and what is going on. */
export interface LiveHint {
  text: string;
  /** Story state that must hold. */
  if?: Condition;
  /** Only within `r` meters of this spot. */
  near?: { x: number; z: number; r: number };
  /** Anything else the scene knows, such as the torch being on or the watchman being close. */
  when?: () => boolean;
}

/**
 * The clue that fits right now, or null. A clue tied to a spot beats one for the whole scene,
 * and among equals the first one the level registered wins, so levels list the urgent ones first.
 */
export function pickHint(hints: readonly LiveHint[], state: StateView, at: { x: number; z: number }): string | null {
  const applies = (hint: LiveHint) =>
    checkStory(hint.if, state) &&
    (!hint.near || Math.hypot(at.x - hint.near.x, at.z - hint.near.z) <= hint.near.r) &&
    (hint.when?.() ?? true);
  const live = hints.filter(applies);
  return (live.find((hint) => hint.near) ?? live[0])?.text ?? null;
}
