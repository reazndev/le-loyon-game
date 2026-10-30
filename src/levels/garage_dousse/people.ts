import { Vector3 } from 'three';
import type { LevelKit } from '../../game/kit/levelKit';
import type { NpcBuilder } from '../../game/kit/npc';
import type { SceneContext } from '../../game/scene';
import { everyFrame } from '../church/everyFrame';
import { houseCreak } from '../inn/sounds';
import type { GarageCast } from './cast';
import { YANNICK_LEFT } from './cast';
import { BENCH, DOOR, INSIDE_DOOR, LIFT, ROOM, STOOL, SUMP } from './layout';

const BRAKE_DISC = new Vector3(BENCH.x - 0.6, BENCH.h, BENCH.z + 0.08);
const UNDER_FIAT = { x: LIFT.x + 0.15, z: SUMP.z + 0.4 };
const SUMP_POINT = new Vector3(SUMP.x, SUMP.y - 0.1, SUMP.z);
/** Round the pit and the lift to the side door. */
const WAY_OUT = [
  { x: -0.4, z: -4.3 },
  { x: 0.2, z: 2.6 },
  { x: INSIDE_DOOR.x - 0.2, z: INSIDE_DOOR.z },
  { x: DOOR.x, z: ROOM.z1 - 0.2 },
];
const WALK_OFF_FAST = 1.6;

export function placeCast(kit: LevelKit, ctx: SceneContext, cast: GarageCast): void {
  if (cast.gilles) kit.npc('gilles').at(-0.45, 0, BENCH.z + 0.75).faceYaw(165).watch(4).talk('gilles');
  if (!cast.yannick) return;

  // At the bench he sits on his stool; under the Fiat he stands.
  const atBench = cast.yannick === 'bench';
  const spot = atBench ? STOOL : UNDER_FIAT;
  const yannick = kit.npc('yannick').at(spot.x, 0, spot.z).faceYaw(0).talk('yannick');
  if (atBench) yannick.sit(STOOL.h);
  // He keeps his eyes on his work, except while he answers.
  const work = atBench ? BRAKE_DISC : SUMP_POINT;
  const body = yannick.character;
  everyFrame(kit, () => {
    if (body.walking) body.lookAt = null;
    else body.lookAt ??= work;
  });
  if (cast.yannickLeaves) walkOutAfterTalking(kit, ctx, yannick);
}

/** Day 3: "He walks off fast, hands in his pockets." Out of the side door, and gone. */
function walkOutAfterTalking(kit: LevelKit, ctx: SceneContext, yannick: NpcBuilder): void {
  const body = yannick.character;
  let talked = false;
  let gone = false;
  everyFrame(kit, () => {
    if (gone) return;
    if (body.turnToLook) talked = true;
    else if (talked && !ctx.paused) {
      gone = true;
      ctx.state.setFlag(YANNICK_LEFT);
      void body.walk(WAY_OUT, { speed: WALK_OFF_FAST }).then(() => {
        houseCreak(ctx.audio, { x: DOOR.x, y: 1, z: ROOM.z1 }, 0.6);
        body.root.visible = false;
        // Out of reach too, so his Talk prompt doesn't hang in the doorway.
        body.position.set(0, 0, 60);
      });
    }
  });
}
