import type { LevelKit } from '../../game/kit/levelKit';
import type { Beat, ScareAction } from '../../game/scares/beats';
import { scareDirector, type ScareDirector } from '../../game/scares/director';
import { otherStep } from '../../game/scares/sounds';
import type { SceneContext } from '../../game/scene';
import { lookPoint } from './beats';
import { height, markers } from './layout';
import { unspent } from './spent';
import { isNight, type StoryPhase } from './story';

const { for1_ahead, for1_ahead_exit, for1_ahead_again_from, for1_ahead_again_to, for1_fork_steps_from, for1_fork_steps_to } = markers;

/**
 * Slow uneven steps walking away between two points: one foot heavier than the other, the gap
 * longer after the heavy one, fading as they go. Data for a beat.
 */
export function stepsAway(from: { x: number; z: number }, to: { x: number; z: number }, count: number): ScareAction[] {
  let after = 0;
  return Array.from({ length: count }, (_, i) => {
    const t = i / (count - 1);
    const heavy = i % 2 === 0;
    const at = { x: from.x + (to.x - from.x) * t, y: 1, z: from.z + (to.z - from.z) * t };
    const action: ScareAction = { after, run: (ctx) => otherStep(ctx.audio, 'grass', at, heavy) };
    after += heavy ? 1.35 : 0.95;
    return action;
  });
}

/**
 * The forest path beats of docs/script/07-scares.md. Night 1 follows the figure from the
 * cemetery: seen twice far ahead on the path, then lost at the shrine fork, where only its steps
 * go on uphill. Walking back after the fort, a cough far behind. Night 3 has footsteps that keep
 * pace. Between them, long stretches of nothing and the random sounds of the night. `extra` adds
 * beats staged elsewhere, such as the heifer's on day 2.
 */
export function stageForestPath(kit: LevelKit, ctx: SceneContext, phase: StoryPhase, extra: Beat[] = []): ScareDirector {
  const night1 = phase === 'night1';
  const beats: Beat[] = [...extra];
  if (night1) {
    beats.push(
      {
        id: 'for1_ahead',
        when: { enter: { ...markers.for1_ahead_trigger, r: 2.5 } },
        if: { flag: 'first_sighting' },
        do: [{ silence: 18 }, { figure: { at: for1_ahead, face: for1_ahead.yaw, vanish: 'never', near: 8.5, leave: [for1_ahead_exit] } }],
      },
      {
        id: 'for1_ahead_again',
        when: { enter: { ...markers.for1_ahead_again_trigger, r: 2.5 } },
        do: [
          {
            figure: {
              at: for1_ahead_again_from,
              face: for1_ahead_again_from.yaw - 90,
              walk: [for1_ahead_again_to],
              near: 7,
              leave: [for1_ahead_again_to],
            },
          },
        ],
      },
      {
        id: 'for1_fork_steps',
        when: { enter: { ...markers.for1_shrine, r: 4 } },
        if: { flag: 'first_sighting', notFlag: 'found_bunker' },
        do: [{ silence: 16 }, ...stepsAway(for1_fork_steps_from, for1_fork_steps_to, 12).map((step) => ({ ...step, after: (step.after ?? 0) + 2 }))],
      },
      {
        id: 'for1_cough',
        when: { enter: { ...markers.for1_cough_trigger, r: 3 } },
        if: { flag: 'bunker_door_wedged' },
        do: [{ sound: 'sfx_cough_mask', at: markers.for1_cough_source, volume: 1.4 }],
      },
    );
  }
  if (isNight(phase))
    beats.push({
      id: 'for1_shrine',
      when: { look: { ...lookPoint(markers.for1_shrine, height), within: 5, hold: 0.8 } },
      do: [{ silence: 7 }],
    });
  if (phase === 'night3')
    beats.push({
      id: 'for3n_follow',
      when: { enter: { ...markers.for3n_follow, r: 3 } },
      do: [{ stalk: { surface: 'grass', steps: 14, distance: 8 } }],
    });
  return kit.use(scareDirector(unspent(ctx.state, beats), isNight(phase) ? { random: { surface: 'grass' } } : {}));
}
