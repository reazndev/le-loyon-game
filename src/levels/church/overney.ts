import { MathUtils, Vector3 } from 'three';
import type { Waypoint } from '../../engine/characters/motion';
import type { LevelKit } from '../../game/kit/levelKit';
import type { SceneContext } from '../../game/scene';
import { dialogues } from '../../content';
import { overneySpot, sealDue, type AbbeSpot } from './abbe';
import { everyFrame } from './everyFrame';
import { abbeSpots, SACRISTY } from './layout';

/** Kneeling is faked by sinking him into the floor behind the kneeler. */
const KNEEL_DEPTH = 0.42;

/** The way from the nave up through the rail gap, past the altar, to the sacristy door. */
const throughChancel: Waypoint[] = [
  { x: 0.3, z: -9.8 },
  { x: 0.3, z: -12 },
  { x: -2.0, z: -14.2 },
  { x: -2.4, z: -16.2 },
];
const intoSacristy: Waypoint[] = [
  { x: -2.5, z: -16.8 },
  { x: -2.5, z: -17.8 },
];

/** The walks between spots that the story asks for; a null target means into the sacristy and out of sight. */
function routeBetween(from: AbbeSpot, to: AbbeSpot | null): Waypoint[] {
  const side = from === 'candles' || from === 'kneeling' ? [{ x: 2.3, z: -8.6 }] : [];
  if (to === 'sacristy') return [...side, ...throughChancel, ...intoSacristy, abbeSpots.sacristy];
  if (to === 'sacristy_door') return [...side, ...throughChancel, abbeSpots.sacristy_door];
  if (to === 'office') return [...intoSacristy, { x: 2.9, z: -17.75 }, { x: 2.9, z: -19.4 }, { x: 4.3, z: -19.4 }, abbeSpots.office];
  return [...side, ...throughChancel, ...intoSacristy];
}

/**
 * Abbé Overney, where the story puts him. He follows `overneySpot` as flags change, walking
 * between spots once no dialogue is open, and he speaks about the seal when the player comes out
 * of the sacristy with the register read.
 */
export function placeAbbe(kit: LevelKit, ctx: SceneContext): void {
  let spot = overneySpot(ctx.state);
  if (!spot) return;
  const start = abbeSpots[spot];
  const abbe = kit.npc('overney').at(start.x, 0, start.z).faceYaw(start.yaw).watch(4).talk('overney');
  const character = abbe.character;
  let walking = false;
  const prayer = new Vector3(abbeSpots.kneeling.x + 1.2, 0.9, abbeSpots.kneeling.z);

  everyFrame(kit, () => {
    if (spot === 'kneeling' && !walking && !ctx.paused) {
      character.root.position.y -= KNEEL_DEPTH;
      character.lookAt = prayer;
    }
    const next = overneySpot(ctx.state);
    if (walking || ctx.paused || next === spot || !spot) return;
    const from = spot;
    spot = next;
    walking = true;
    character.lookAt = null;
    void character.walk(routeBetween(from, next)).then(() => {
      walking = false;
      if (next) character.face(MathUtils.degToRad(abbeSpots[next].yaw));
      else abbe.object.visible = false;
    });
  });

  kit
    .trigger({ w: SACRISTY.x1 - SACRISTY.x0 - 0.6, d: SACRISTY.z1 - SACRISTY.z0 - 0.6 })
    .at((SACRISTY.x0 + SACRISTY.x1) / 2, 0, (SACRISTY.z0 + SACRISTY.z1) / 2)
    .onExit(() => {
      if (!sealDue(ctx.state) || ctx.player.position.z < SACRISTY.z1) return;
      character.face(ctx.player.position);
      void ctx.dialogue(dialogues.overney);
    });
}
