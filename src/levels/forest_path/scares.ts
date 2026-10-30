import type { LevelKit } from '../../game/kit/levelKit';
import type { Beat, ScareAction } from '../../game/scares/beats';
import { scareDirector, type ScareDirector } from '../../game/scares/director';
import { otherStep } from '../../game/scares/sounds';
import type { SceneContext } from '../../game/scene';
import { lookPoint } from './beats';
import { height, markers, toFort, toStream } from './layout';
import { wireSnag } from './sounds';
import { oncePerGame, unspent } from './spent';
import { isNight, type StoryPhase } from './story';
import { startle } from '../../game/scares/startles';
import { decoySighting } from '../../game/scares/decoys';
import { beside } from './trail';

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

/** The boot catches in the wire: a clank at the shin, a stumble down, and the view pulled to the ground. */
function snag(ctx: SceneContext): void {
  const { player } = ctx;
  wireSnag(ctx.audio, { x: player.position.x, y: player.position.y + 0.3, z: player.position.z });
  const crouched = player.crouched;
  player.crouched = true;
  player.pitch -= 0.15;
  setTimeout(() => (player.crouched = crouched), 700);
}

const ground = (p: { x: number; z: number }, up = 0) => ({ x: p.x, y: height(p.x, p.z) + up, z: p.z });

/** Shifts a run of actions `seconds` later. */
const later = (actions: ScareAction[], seconds: number): ScareAction[] => actions.map((action) => ({ ...action, after: (action.after ?? 0) + seconds }));

/**
 * Night beats where the torch gives out. By the stream a branch snaps by the snagged tarp and two
 * steps go off in the dark; the light comes back on the tarp, still hanging there. Near the fort
 * on night 3, four slow steps go off through the spruce, and a branch sweeps the face as the
 * light catches. Each plays once in the game.
 */
function darkBeats(phase: StoryPhase): Beat[] {
  const cape = markers.fp_cape;
  const stream: Beat = {
    id: 'fp_torch_stream',
    when: { enter: { ...markers.fp_torch_stream, r: 2 } },
    do: [{ torch: 3 }, { after: 1, startle: 'crack', from: ground(cape, 1.6) }, ...later(stepsAway(cape, beside(toStream, 31, 6), 2), 1.8)],
  };
  const fort: Beat = {
    id: 'fp_torch_fort',
    when: { enter: { ...markers.fp_torch_fort, r: 2 } },
    do: [{ torch: 3.2 }, ...later(stepsAway(beside(toFort, 24, -6), beside(toFort, 27, -10), 4), 0.6), { after: 3.4, brush: 'branch' }],
  };
  return [stream, ...(phase === 'night3' ? [fort] : [])].map(oncePerGame);
}

/**
 * The forest path beats of docs/script/07-scares.md. Night 1 follows the figure from the
 * cemetery: seen twice far ahead on the path, then lost at the shrine fork, where only its steps
 * go on uphill. Walking back after the fort, a cough far behind. Night 3 has footsteps that keep
 * pace. Any night, the tarp by the stream reads as a man, and the torch gives out (`darkBeats`).
 * Once, by day or night, wire on the fort path catches the boot. Between them, long stretches
 * of nothing and the random sounds of the night. `extra` adds
 * beats staged elsewhere, such as the heifer's on day 2.
 */
export function stageForestPath(kit: LevelKit, ctx: SceneContext, phase: StoryPhase, extra: Beat[] = []): ScareDirector {
  const night1 = phase === 'night1';
  const beats: Beat[] = [
    ...extra,
    oncePerGame({ id: 'fp_wire_snag', when: { enter: { ...markers.fp_wire_snag, r: 1.2 } }, do: [{ run: snag }] }),
  ];
  // A roe deer bedded down beside the path bolts as the reporter comes level with it.
  if (isNight(phase)) beats.push(startle('path_deer', 'deer', { x: -1.2, z: 16, r: 3 }, { x: 4.3, y: 0, z: 16.4 }));
  // One for each stretch of path, so the first walk through the wood keeps the player on edge.
  beats.push(
    startle('path_entry_crows', 'crows', { x: 0.6, z: 27, r: 3 }, { x: -3.5, y: 5, z: 26 }),
    startle('path_hare', 'hare', { x: 1, z: 9, r: 2.5 }, { x: 3.5, y: 0, z: 8.5 }),
    isNight(phase)
      ? startle('fort_owl', 'owl', { x: 6.5, z: -10.5, r: 3 }, { x: 10, y: 6, z: -9 })
      : startle('fort_crows', 'crows', { x: 6.5, z: -10.5, r: 3 }, { x: 10, y: 6, z: -9 }),
  );
  if (isNight(phase))
    beats.push(
      startle('stream_fox', 'fox', { x: -13, z: -4, r: 3 }, { x: -12, y: 0, z: -8 }),
      decoySighting('cape', 'snagged_cape', { ...markers.fp_cape, y: height(markers.fp_cape.x, markers.fp_cape.z) }, { ...markers.fp_cape_seen_from, r: 6 }),
      ...darkBeats(phase),
    );
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
