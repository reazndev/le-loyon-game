import type { LevelKit } from '../../game/kit/levelKit';
import type { Beat } from '../../game/scares/beats';
import { scareDirector, type ScareDirector } from '../../game/scares/director';
import { playSound } from '../../game/scares/sounds';
import type { SceneContext } from '../../game/scene';
import { everyFrame } from '../church/everyFrame';
import { playNode } from '../forest_path/play';
import type { StoryPhase } from '../forest_path/story';
import type { BackGate } from './backGate';
import type { DigHooks } from './digSite';
import { BACK_GATE, BACK_Z, CHASSOT_BEDS, chassotGrave, FRONT_GATE, FRONT_Z, type Grave } from './layout';
import { FirstMeeting } from './watchman';

/** A beat that only fires when the scene calls `scares.fire`. */
const MANUAL = { after: Number.POSITIVE_INFINITY };

/** Where Le Loyon stands on night 1: against the back wall beside the Chassot plot. */
export const SIGHTING = { x: chassotGrave.x + 2.7, z: BACK_Z + 0.7 };
/** How long the cemetery must be silent before the dog, and how long before it comes anyway. */
const BUILD_SECONDS = 45;
const LATEST_SECONDS = 110;
const SILENCE_FADE = 60;

const beats: Beat[] = [
  {
    id: 'cem1_back_wall',
    when: MANUAL,
    do: [
      { silence: 22 },
      {
        figure: {
          at: SIGHTING,
          face: 180,
          vanish: 'never',
          near: 8,
          leave: [
            { x: BACK_GATE.x - 1.5, z: BACK_Z + 0.6 },
            { x: BACK_GATE.x, z: BACK_Z - 0.5 },
            { x: BACK_GATE.x + 0.5, z: BACK_Z - 14 },
          ],
        },
      },
    ],
    set: 'first_sighting',
  },
  {
    id: 'cem2_gravel_step',
    when: MANUAL,
    do: [{ sound: 'sfx_step_other', at: { x: CHASSOT_BEDS.marc.x + 1.2, z: CHASSOT_BEDS.marc.z + 2.6 }, volume: 0.9, after: 1.2 }],
  },
  {
    id: 'cem2_breath',
    when: MANUAL,
    do: [{ sound: 'sfx_breath_mask', at: { x: chassotGrave.x + 1.5, z: BACK_Z - 3.5 }, volume: 0.3, after: 2 }],
  },
];

export interface Staging {
  scares: ScareDirector;
  /** After any grave is read. */
  read(grave: Grave): void;
  /** What the dig site tells the beats. Night 2 only; the scene adds the patrol's part. */
  dig: Pick<DigHooks, 'stageDone' | 'letterRead' | 'outAfterBox'>;
}

/**
 * The scare beats of 07-scares.md for the cemetery. Night 1 builds a minute of silence to the dog,
 * then the figure at the back wall. Night 2 has the step on the gravel, the gate found open, and
 * the breath behind the wall. Random sounds run at night, except on night 1 before Raymond.
 */
export function stageCemetery(kit: LevelKit, ctx: SceneContext, phase: StoryPhase, gate: BackGate): Staging {
  const { state } = ctx;
  const quietNight = phase === 'night1' && !state.hasFlag('met_raymond');
  const random = phase.startsWith('night') && !quietNight;
  const scares = kit.use(scareDirector(beats, random ? { random: { surface: 'gravel' } } : {}));
  const staging: Staging = {
    scares,
    read: () => undefined,
    dig: {
      stageDone: (stage) => {
        if (stage === 4) scares.fire('cem2_gravel_step');
      },
      letterRead: () => scares.fire('cem2_breath'),
      // While the reporter was down in the hole, someone came in and went out by the back gate.
      outAfterBox: () => {
        gate.set(true);
        void playNode(ctx, 'coffin_after');
      },
    },
  };
  if (phase === 'night1') nightOne(kit, ctx, staging, gate);
  return staging;
}

function nightOne(kit: LevelKit, ctx: SceneContext, staging: Staging, gate: BackGate): void {
  const { state, player, audio } = ctx;
  const meeting = state.hasFlag('met_raymond') ? null : new FirstMeeting(kit, ctx);
  let silenceSince: number | null = null;
  let raymondGoneAt: number | null = meeting ? null : 0;
  let restored = false;
  let sightingAt: number | null = null;
  let creaked = false;

  const facingAwayFromGate = () => {
    const f = player.forward();
    return f.x * (FRONT_GATE.x - player.position.x) + f.z * (FRONT_Z - player.position.z) < 0;
  };
  const startSilence = () => {
    if (silenceSince !== null || !meeting) return;
    silenceSince = ctx.time;
    audio.fadeBus('ambience', 0, SILENCE_FADE);
  };
  const bark = () => {
    if (!meeting || raymondGoneAt !== null || meeting.gone || dogStarted) return;
    dogStarted = true;
    void meeting.arrive().then(() => (raymondGoneAt = ctx.time));
  };
  let dogStarted = false;
  const builtUp = () => silenceSince !== null && ctx.time - silenceSince >= BUILD_SECONDS;

  staging.read = (grave) => {
    startSilence();
    if (builtUp() && grave.row >= 2 && grave.row <= 4 && facingAwayFromGate()) bark();
  };

  everyFrame(kit, () => {
    if (ctx.paused) return;
    const fromSighting = Math.hypot(player.position.x - SIGHTING.x, player.position.z - SIGHTING.z);
    // Once the reporter walks toward it, it turns and goes out by the back gate, which creaks.
    if (sightingAt !== null && !creaked && fromSighting < 9) {
      creaked = true;
      setTimeout(() => {
        gate.set(true);
        playSound(audio, 'sfx_gate_creak_back', { at: { x: BACK_GATE.x, y: 1, z: BACK_Z } });
      }, 9000);
    }
    // The silence starts at the first grave read tonight, or soon after arriving anyway.
    if (ctx.time > 30) startSilence();
    if (silenceSince !== null && ctx.time - silenceSince > LATEST_SECONDS && facingAwayFromGate()) bark();
    if (raymondGoneAt === null || state.hasFlag('first_sighting')) return;
    const allRead = state.hasFlag('read_grave_menoud') && state.hasFlag('read_grave_gremaud') && state.hasFlag('read_grave_chassot');
    if (allRead && ctx.time - raymondGoneAt > 12 && fromSighting > 11) {
      staging.scares.fire('cem1_back_wall');
      sightingAt = ctx.time;
    } else if (!restored && ctx.time - raymondGoneAt > 35) {
      restored = true;
      audio.fadeBus('ambience', audio.busLevel('ambience'), 6);
    }
  });
}
