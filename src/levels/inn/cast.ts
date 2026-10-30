import type { NodeId } from '../../content';
import type { LevelKit } from '../../game/kit/levelKit';
import type { SceneContext } from '../../game/scene';
import { everyFrame } from '../church/everyFrame';
import { cafeLit, type InnDressing } from './dressing';
import { placeSetting } from './furniture';
import { loopSound } from './interior';
import { CORNER_TABLE, COUNTER, TABLES } from './layout';
import { tvMurmur } from './sounds';

/** Who is in the café, by the table in 02-village.md. */
export function placeCafeCast(kit: LevelKit, ctx: SceneContext, dressing: InnDressing): void {
  const { state } = ctx;
  if (!cafeLit(dressing)) return;
  kit.npc('monique').at(2.5, 0, COUNTER.z - 0.4).faceYaw(180).watch(4).talk('monique');

  if (dressing.day === 1 && !dressing.endingMorning) {
    // Gilles at the counter with a glass of white.
    kit.npc('gilles').at(1.45, 0, COUNTER.z + 0.62).faceYaw(0).watch(3).talk('gilles');
    placeSetting(kit, 1.45, COUNTER.z + 0.12, 'wine', COUNTER.h);
    return;
  }
  if (dressing.day === 2 && !dressing.eveningTwo && !state.hasFlag('heifer_found')) {
    const table = TABLES[3];
    kit.npc('bernard').at(table.x, 0, table.z - 0.65).faceYaw(180).watch(3).talk('bernard');
    placeSetting(kit, table.x, table.z - 0.15, 'coffee');
  }
  const raymondHere = dressing.eveningTwo || (dressing.day === 3 && !dressing.endingMorning);
  if (!raymondHere) return;
  kit.npc('raymond').at(CORNER_TABLE.x - 0.62, 0, CORNER_TABLE.z).faceYaw(-90).watch(3).talk(raymondLine(ctx, dressing));
  thermos(kit, CORNER_TABLE.x - 0.15, CORNER_TABLE.z + 0.1);
  if (dressing.day !== 3 || !state.hasFlag('grave_left_open')) return;
  // Gilles with him, talking low. They stop when the reporter comes in.
  kit.npc('gilles').at(CORNER_TABLE.x + 0.62, 0, CORNER_TABLE.z).faceYaw(90).talk('gilles');
  const talk = loopSound(kit, (audio) => tvMurmur(audio, { x: CORNER_TABLE.x, y: 1.3, z: CORNER_TABLE.z }, 0.35));
  let talking = true;
  everyFrame(kit, () => {
    if (talking && ctx.time > 1.6) {
      talking = false;
      talk.stop(0.4);
    }
  });
}

function raymondLine(ctx: SceneContext, dressing: InnDressing): NodeId {
  if (dressing.day === 2) return 'raymond_day2';
  return ctx.state.hasFlag('grave_left_open') ? 'raymond_day3_open' : 'raymond_day3_refilled';
}

function thermos(kit: LevelKit, x: number, z: number): void {
  kit.cylinder({ r: 0.045, h: 0.3, sides: 8 }).color(0x4a5a4a).at(x, 0.772, z);
  kit.cylinder({ r: 0.05, h: 0.07, sides: 8 }).color(0x8a8a84).at(x + 0.14, 0.772, z - 0.05);
}
