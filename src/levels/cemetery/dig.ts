import type { NodeId } from '../../content';
import type { StateView } from '../../game/conditions';

/**
 * The rules of puzzle P5 that don't depend on the scene: how long each stage of digging and
 * refilling takes, how deep the hole is, and what the reporter can do at the grave right now.
 */

export const DIG_SECONDS = 15;
export const REFILL_SECONDS = 12;
export const DIG_STAGES = 5;
export const REFILL_STAGES = 3;
/** From this stage on the hole is waist deep: the reporter digs from inside and climbing out takes a while. */
export const IN_HOLE_STAGE = 3;
export const CLIMB_OUT_SECONDS = 3;
export const CLIMB_IN_SECONDS = 1.2;

/** Depth of the hole in meters after each dig stage. At stage 5 the floor is the coffin lid. */
const DIG_DEPTHS = [0, 0.3, 0.65, 1.0, 1.35, 1.6] as const;
/** Depth after each refill stage: the lid back on, half full, level. */
const REFILL_DEPTHS = [1.6, 1.1, 0.55, 0] as const;

export function holeDepth(state: StateView): number {
  if (state.hasFlag('grave_refilled')) return 0;
  const refill = state.count('refill_stage');
  if (refill > 0) return REFILL_DEPTHS[Math.min(refill, REFILL_STAGES)]!;
  return DIG_DEPTHS[Math.min(state.count('dig_stage'), DIG_STAGES)]!;
}

/** The grave is open: dug at least once and not filled in again. */
export const holeOpen = (state: StateView): boolean => state.count('dig_stage') >= 1 && !state.hasFlag('grave_refilled');

/** Raymond's torch would find it: open and not under the tarp. */
export const holeVisible = (state: StateView): boolean => holeOpen(state) && !state.hasFlag('tarp_over_hole');

/** The coffin lies open and the box is still in it. */
export const boxInCoffin = (state: StateView): boolean => state.hasFlag('opened_coffin') && !state.hasItem('bunker_key');

export type GraveAction =
  /** Hold to dig the next stage. */
  | 'dig'
  /** Hold to throw earth back. */
  | 'refill'
  | 'climb_in'
  | 'lift_lid'
  | 'take_box'
  | null;

/** What the one interaction at Marc's grave does now, for a reporter `inHole` or standing at the edge. */
export function graveAction(state: StateView, inHole: boolean): GraveAction {
  if (!state.hasItem('shovel') || state.hasFlag('tarp_over_hole') || state.hasFlag('grave_refilled')) return null;
  const stage = state.count('dig_stage');
  if (state.hasFlag('opened_coffin')) {
    if (boxInCoffin(state)) return inHole ? 'take_box' : 'climb_in';
    return inHole ? null : 'refill';
  }
  if (stage < IN_HOLE_STAGE) return inHole ? null : 'dig';
  if (!inHole) return 'climb_in';
  return stage < DIG_STAGES ? 'dig' : 'lift_lid';
}

/** Seconds of holding the action for one stage. */
export const stageSeconds = (action: 'dig' | 'refill'): number => (action === 'dig' ? DIG_SECONDS : REFILL_SECONDS);

/**
 * Progress through one held stage. Letting go pauses it; the progress is kept until the stage
 * completes, when `hold` returns true and the clock starts again for the next stage.
 */
export class StageClock {
  private held = 0;

  constructor(private seconds: number) {}

  /** Starts over for a stage of a different length, such as refilling after digging. */
  reset(seconds: number): void {
    this.seconds = seconds;
    this.held = 0;
  }

  get progress(): number {
    return this.held / this.seconds;
  }

  hold(dt: number): boolean {
    this.held += dt;
    if (this.held < this.seconds) return false;
    this.held = 0;
    return true;
  }
}

const digNodes = ['dig_chassot_1', 'dig_chassot_2', 'dig_chassot_3', 'dig_chassot_4', 'dig_chassot_5'] as const satisfies NodeId[];
const refillNodes = ['refill_1', 'refill_2', 'refill_3'] as const satisfies NodeId[];

/** The narration node for a finished stage, from 1. */
export const digNode = (stage: number): NodeId => digNodes[stage - 1]!;
export const refillNode = (stage: number): NodeId => refillNodes[stage - 1]!;
