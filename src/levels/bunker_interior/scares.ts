import type { Point3 } from '../../engine/audio/audioManager';
import { waterDrop } from '../../game/ambient/sounds';
import type { Beat, Zone } from '../../game/scares/beats';
import { startle } from '../../game/scares/startles';
import { playSound } from '../../game/scares/sounds';
import type { SceneContext } from '../../game/scene';
import type { BeatMarker } from '../forest_path/beats';
import { castorScreech, steelDoorShut } from '../forest_path/sounds';
import { oncePerGame } from '../forest_path/spent';
import { phoneRing } from '../village_square/sounds';

/** A beat that only fires when the scene calls `scares.fire`, after something the player did. */
const MANUAL = { after: Number.POSITIVE_INFINITY };

/**
 * Runs `work` after `seconds` of wall time. The director's own clock stops while a dialogue is
 * open; sounds the narration describes as they happen ("Then something. Breathing?") need this.
 */
const meanwhile = (seconds: number, work: () => void) => void setTimeout(work, seconds * 1000);

const point = (marker: BeatMarker): Point3 => ({ x: marker.x, y: marker.y ?? 1, z: marker.z });

export interface FortParts {
  markers: Record<'bun2_cupboard_screech_echo' | 'bun2_door_listen' | 'bun3_logbook_cup' | 'bun3_phone' | 'bun3_drum' | 'bun3_knock', BeatMarker>;
  /** Where the cupboard screeches from. */
  cupboard: Point3;
  /** One mask slides off the heap. */
  slideMask(): void;
  /** Marc's voice through the steel, after a right knock. */
  voice(): void;
}

/**
 * The outer rooms' beats from 07-scares.md, all set off by what the player does: the mirror,
 * turning to leave the masks, the cupboard, listening and knocking at K.P. 3, the phone crank,
 * the fuel drum, closing the logbook's answer. Between them the drip in the next room and the random sounds of the fort.
 */
export function fortBeats(ctx: SceneContext, parts: FortParts): Beat[] {
  const { audio } = ctx;
  const { markers } = parts;
  return [
    { id: 'bun2_mirror', when: MANUAL, do: [{ silence: 6 }] },
    {
      id: 'bun2_masks',
      when: MANUAL,
      do: [{ run: parts.slideMask }, { silence: 8, after: 0.8 }],
    },
    {
      id: 'bun2_cupboard_screech',
      when: MANUAL,
      do: [
        { run: () => castorScreech(audio, parts.cupboard) },
        { silence: 12, after: 0.5 },
        // Too late for an echo, and from the wrong side of the fort.
        { after: 5.5, run: () => castorScreech(audio, point(markers.bun2_cupboard_screech_echo), { volume: 0.22, length: 1.3 }) },
      ],
    },
    {
      id: 'bun2_door_listen',
      when: MANUAL,
      do: [{ run: () => meanwhile(2.2, () => playSound(audio, 'sfx_breath_mask', { at: point(markers.bun2_door_listen), volume: 0.22 })) }],
    },
    { id: 'bun3_masks', when: MANUAL, do: [{ silence: 8 }] },
    // Set down somewhere deeper in, once. It is real; the player only learns that in Marc's room.
    { id: 'bun3_logbook_cup', when: MANUAL, set: 'fort_logbook_cup', do: [{ after: 1.4, sound: 'sfx_metal_cup', at: markers.bun3_logbook_cup, volume: 0.5 }] },
    { id: 'bun3_phone', when: MANUAL, do: [{ after: 1.8, run: () => phoneRing(audio, point(markers.bun3_phone)) }] },
    { id: 'bun3_drum_answer', when: MANUAL, do: [{ silence: 10 }, { after: 3.5, sound: 'sfx_knock_metal', at: markers.bun3_drum, volume: 0.35 }] },
    { id: 'bun3_drum_silence', when: MANUAL, do: [{ silence: 10 }] },
    {
      id: 'bun3_knock_right',
      when: MANUAL,
      do: [
        { silence: 14 },
        { after: 4, sound: 'sfx_breath_mask', at: markers.bun3_knock, volume: 0.45 },
        { after: 8.5, run: parts.voice },
      ],
    },
    { id: 'bun3_knock_wrong', when: MANUAL, do: [{ silence: 10 }] },
  ];
}

/** A stretch of the main corridor, wall to wall, at `z`. */
const corridor = (z: number): Zone => ({ x: 0, z, w: 1.8, d: 1.2 });

/**
 * The fort playing tricks in the dark, each once in the game. In the gas lock a drop off the
 * lintel finds the collar. Rats run across the beam in the corridor. At night the fort's outer
 * door bangs shut in the wind far behind, and further in the torch dies while a breath comes
 * faintly from the casemate end. By day the torch dies near the casemate instead, and rats scatter
 * round the reporter's feet in the dark.
 */
export function darkBeats(ctx: SceneContext, night: boolean): Beat[] {
  const { audio, player } = ctx;
  const collar = () => {
    const eye = player.camera.position;
    waterDrop(audio, { x: eye.x, y: eye.y - 0.25, z: eye.z }, 1.1);
    ctx.blink();
  };
  const atNight: Beat[] = [
    { id: 'bun_door_slam', when: { enter: corridor(-14) }, do: [{ run: () => steelDoorShut(audio, { x: 0, y: 1.2, z: 1 }, 1.3) }, { after: 0.4, silence: 8 }] },
    { id: 'bun_torch_breath', when: { enter: corridor(-25) }, do: [{ torch: 3.5 }, { after: 1.3, sound: 'sfx_breath_mask', at: { x: 0, z: -40 }, volume: 0.16 }] },
  ];
  const byDay: Beat[] = [{ id: 'bun_torch_rats', when: { enter: corridor(-36.5) }, do: [{ torch: 2.8 }, { after: 0.8, startle: 'rats', from: { x: 0.3, y: 0.1, z: -37.5 } }] }];
  const drip: Beat = { id: 'bun_collar_drip', when: { enter: { x: 0, z: -9.8, w: 1.8, d: 1.6 } }, do: [{ run: collar }] };
  return [...[drip, ...(night ? atNight : byDay)].map(oncePerGame), startle('corridor_rats', 'rats', corridor(-19.5), { x: 0.4, y: 0.1, z: -22.5 })];
}
