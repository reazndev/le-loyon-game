import type { LevelKit } from '../../game/kit/levelKit';
import type { SceneContext } from '../../game/scene';
import type { Beat } from '../../game/scares/beats';
import { scareDirector } from '../../game/scares/director';
import type { StoryPhase } from '../forest_path/story';
import { shopBell } from './bell';
import { BACK_CORNER, BELL } from './layout';

/** How long the player faces into the shop, back to the door, before the draft comes. */
const BACK_TURNED = 25;
/** The bell barely moves in a draft. */
const DRAFT_SWING = 0.2;

/**
 * The laiterie by day is safe and dull, and that is its job. One quiet false beat on day 2 or 3:
 * after the player has stood a while facing into the shop, the door bell gives one small knock,
 * as if from a draft. Nobody is there. At night the shop is shut and nothing happens.
 */
export function laiterieBeats(phase: StoryPhase, ringDraft: () => void): Beat[] {
  if (phase !== 'day2' && phase !== 'day3') return [];
  return [
    {
      id: 'lai_bell_draft',
      // Facing the far corner from the door means the door is behind. The look only counts
      // outside dialogue, so talking to Christine doesn't run the clock.
      when: { look: { ...BACK_CORNER, angle: 50, hold: BACK_TURNED } },
      do: [{ run: ringDraft }],
      set: 'lai_bell_draft',
    },
  ];
}

export function stageBeats(kit: LevelKit, ctx: SceneContext, phase: StoryPhase): void {
  const beats = laiterieBeats(phase, () => shopBell(ctx.audio, { at: BELL, volume: 0.35 }, DRAFT_SWING));
  if (beats.length) kit.use(scareDirector(beats));
}
