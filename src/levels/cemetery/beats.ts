import { dread } from '../../engine/audio/generators';
import type { SoundHandle } from '../../engine/audio/audioManager';
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
import { BACK_GATE, BACK_Z, CHASSOT_BEDS, chassotGrave, FRONT_GATE, FRONT_Z, SIGHTING, type Grave } from './layout';
import { FirstMeeting } from './watchman';

/** A beat that only fires when the scene calls `scares.fire`. */
const MANUAL = { after: Number.POSITIVE_INFINITY };

/**
 * The figure only appears to a reporter at least this far from where it stands. That is past where
 * the night fog hides him, so he comes out of it as the reporter walks toward the back wall.
 */
export const SIGHTING_FROM = 13;
/** How long the cemetery must be silent before the dog, and how long before it comes anyway. */
const BUILD_SECONDS = 45;
const LATEST_SECONDS = 110;
const SILENCE_FADE = 60;
/** Seconds he stands looking back once seen, long enough for his eyes to light and go dark. */
const STARE_SECONDS = 6;
/** His walk into the forest, meters per second: two thirds of his usual slow pace, so the reporter can follow. */
const LEAVE_SPEED = 0.4;
/** Seconds from the figure turning away to the back gate creaking open on its own. */
const GATE_CREAK_AFTER = 4;
/** Seconds the music holds after he turns away, and how long it then takes to fade. */
const MUSIC_HOLD = 20;
const MUSIC_FADE = 12;

/** What the night 1 figure tells the scene. `nightOne` fills them in; other nights leave them empty. */
interface SightingHooks {
  shown(): void;
  left(): void;
}

const cemeteryBeats = (hooks: SightingHooks): Beat[] => [
  {
    id: 'cem1_back_wall',
    when: MANUAL,
    do: [
      { silence: 22 },
      {
        figure: {
          at: SIGHTING,
          vanish: 'never',
          // The wall and the shut gate keep the reporter further off than this; it is only a fallback.
          near: 4,
          stare: STARE_SECONDS,
          eyes: true,
          speed: LEAVE_SPEED,
          leave: [
            { x: SIGHTING.x - 0.3, z: SIGHTING.z - 3.5 },
            { x: SIGHTING.x - 0.9, z: SIGHTING.z - 8 },
            { x: SIGHTING.x - 1.6, z: SIGHTING.z - 14 },
          ],
          onShow: () => hooks.shown(),
          onLeave: () => hooks.left(),
        },
      },
    ],
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

export type Figure = 'absent' | 'standing' | 'leaving';

export interface Staging {
  scares: ScareDirector;
  /** After any grave is read. */
  read(grave: Grave): void;
  /** Night 1: whether the figure stands in the trees past the back wall, has turned into the forest, or isn't there. */
  figure(): Figure;
  /** What the dig site tells the beats. Night 2 only; the scene adds the patrol's part. */
  dig: Pick<DigHooks, 'stageDone' | 'letterRead' | 'outAfterBox'>;
}

/**
 * The scare beats of 07-scares.md for the cemetery. Night 1 builds a minute of silence to the dog,
 * then the figure in the trees past the back wall. Night 2 has the step on the gravel, the gate found open, and
 * the breath behind the wall. Random sounds run at night, except on night 1 before Raymond.
 */
export function stageCemetery(kit: LevelKit, ctx: SceneContext, phase: StoryPhase, gate: BackGate): Staging {
  const { state } = ctx;
  const quietNight = phase === 'night1' && !state.hasFlag('met_raymond');
  const random = phase.startsWith('night') && !quietNight;
  const sighting: SightingHooks = { shown: () => undefined, left: () => undefined };
  const scares = kit.use(scareDirector(cemeteryBeats(sighting), random ? { random: { surface: 'gravel' } } : {}));
  const staging: Staging = {
    scares,
    read: () => undefined,
    figure: () => 'absent',
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
  if (phase === 'night1') nightOne(kit, ctx, staging, gate, sighting);
  return staging;
}

function nightOne(kit: LevelKit, ctx: SceneContext, staging: Staging, gate: BackGate, sighting: SightingHooks): void {
  const { state, player, audio } = ctx;
  const meeting = state.hasFlag('met_raymond') ? null : new FirstMeeting(kit, ctx);
  let silenceSince: number | null = null;
  let raymondGoneAt: number | null = meeting ? null : 0;
  let restored = false;
  let sightingAt: number | null = null;
  let leftAt: number | null = null;
  let creaked = false;
  let music: SoundHandle | null = null;
  const sounds = kit.use((k) => k.world.sounds);
  sighting.shown = () => (music = sounds.track(dread(audio, { swell: 8 })));
  sighting.left = () => (leftAt = ctx.time);

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

  staging.figure = () => (sightingAt === null || state.hasFlag('first_sighting') ? 'absent' : leftAt !== null ? 'leaving' : 'standing');
  staging.read = (grave) => {
    startSilence();
    if (builtUp() && grave.row >= 2 && grave.row <= 4 && facingAwayFromGate()) bark();
  };

  everyFrame(kit, () => {
    if (ctx.paused) return;
    const fromSighting = Math.hypot(player.position.x - SIGHTING.x, player.position.z - SIGHTING.z);
    // He turns away only after the reporter has looked at him, so the back gate creaking open and
    // the reporter's reaction, which sets first_sighting, never come for a figure nobody saw.
    if (leftAt !== null && !creaked && ctx.time - leftAt > GATE_CREAK_AFTER) {
      creaked = true;
      gate.set(true);
      playSound(audio, 'sfx_gate_creak_back', { at: { x: BACK_GATE.x, y: 1, z: BACK_Z } });
      setTimeout(() => void playNode(ctx, 'sighting_1'), 1500);
    }
    if (music && leftAt !== null && ctx.time - leftAt > MUSIC_HOLD) {
      music.stop(MUSIC_FADE);
      music = null;
    }
    // The silence starts at the first grave read tonight, or soon after arriving anyway.
    if (ctx.time > 30) startSilence();
    const allRead = state.hasFlag('read_grave_menoud') && state.hasFlag('read_grave_gremaud') && state.hasFlag('read_grave_chassot');
    // The notebook tells the reporter to wait once all three are read, so he comes whichever way they face.
    if ((allRead && builtUp()) || (silenceSince !== null && ctx.time - silenceSince > LATEST_SECONDS)) bark();
    if (raymondGoneAt === null || sightingAt !== null || state.hasFlag('first_sighting')) return;
    if (allRead && ctx.time - raymondGoneAt > 12 && fromSighting > SIGHTING_FROM) {
      staging.scares.fire('cem1_back_wall');
      sightingAt = ctx.time;
    } else if (!restored && ctx.time - raymondGoneAt > 35) {
      restored = true;
      audio.fadeBus('ambience', audio.busLevel('ambience'), 6);
    }
  });
}
