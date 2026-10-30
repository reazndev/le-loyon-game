import { everyFrame } from '../../game/ambient/schedule';
import type { LevelKit } from '../../game/kit/levelKit';
import type { SceneContext } from '../../game/scene';
import type { StoryPhase } from '../forest_path/story';
import type { Kp3Door } from './index';

type Spot = { x: number; z: number };

export interface FortLayout {
  cupboard: Spot;
  /** The K.P. 3 door behind the cupboard. */
  door: Spot;
  battery: Spot;
  /** The valley chart on the guard room wall. */
  chart: Spot;
  kp3: Kp3Door;
}

/** Seconds at the cupboard without progress before the clue says plainly what to do. */
const STUCK = 25;

/** The clue under the goal line: the cupboard puzzle, the knock, and the way out. */
export function hints(kit: LevelKit, ctx: SceneContext, phase: StoryPhase, { cupboard, door, battery, chart, kp3 }: FortLayout): void {
  const lights = kit.use((k) => k.world.lights);
  const atCupboard = { ...cupboard, r: 2.5 };
  const atDoor = { ...door, r: 2.5 };
  const stuck = lingering(kit, ctx, atCupboard, () => ctx.state.hasFlag('looked_at_dust'));
  const searching = { notFlag: ['looked_at_dust', 'found_hidden_door'] };
  const swept = { flag: 'looked_at_dust', notFlag: 'found_hidden_door' };
  const knocking = { item: 'bunker_key', notFlag: 'met_marc' };
  const atTheDoor = (test: () => boolean) => () => kp3.revealed && test();

  kit.hint("It's pitch dark in here. Turn your torch back on.", { when: () => !lights.flashlightOn });
  kit.hint('Go through the K.P. 3 door. The tunnel out is at the back of the room.', { if: { flag: 'met_marc' }, point: door });

  if (phase === 'day2' || phase === 'night3') {
    kit.hint('Look at the tall cupboard, then at the dust at its feet.', { if: searching, near: atCupboard, when: () => stuck() > STUCK, point: cupboard });
    kit.hint('This end of the room is cleaner than the rest.', { if: searching, near: atCupboard, point: cupboard });
    kit.hint('Push the cupboard. It rolls aside.', { if: swept, near: atCupboard, when: () => stuck() > STUCK, point: cupboard });
    kit.hint('The dust is swept in an arc, as if the cupboard swung.', { if: swept, near: atCupboard, point: cupboard });
    kit.hint('This battery is new. Follow its wires along the wall.', { if: { notFlag: 'found_hidden_door' }, near: { ...battery, r: 2.5 }, point: cupboard });
    kit.hint('Search the rooms off the corridor. The bunk room is on the right.', { if: { notFlag: 'found_hidden_door' }, point: cupboard });
  }

  if (phase === 'night3') {
    kit.hint('Roll the cupboard aside again.', { if: { flag: ['found_hidden_door', 'cupboard_restored'], notFlag: 'met_marc' }, near: atDoor, when: () => !kp3.revealed, point: cupboard });
    kit.hint('The light under the door went out. You can still use the key.', { if: knocking, near: atDoor, when: atTheDoor(() => kp3.knock === 'wrong'), point: door });
    kit.hint('Now wait, and listen.', { if: knocking, near: atDoor, when: atTheDoor(() => kp3.knock === 'none' && kp3.knocks >= 4) });
    kit.hint('Three quick knocks, a slow count of three, then one.', { if: knocking, near: atDoor, when: atTheDoor(() => kp3.knock === 'none'), point: door });
    kit.hint('K.P. 3 is behind the cupboard, at the far end of the bunk room.', { if: { flag: 'found_hidden_door', notFlag: 'met_marc' }, point: door });
  }

  if (phase === 'day2') {
    const photo = { flag: 'found_hidden_door', item: 'polaroid_camera', notItem: 'photo_bunker_door' };
    kit.hint('Take a photo of the door while you are here.', { if: photo, near: atDoor, when: () => kp3.revealed, point: door });
    kit.hint('Locked, and you have no key. Leave it for now.', { if: { flag: 'found_hidden_door', notItem: 'bunker_key' }, near: atDoor });
  }
  if (phase === 'day3') {
    kit.hint('The chart on the guard room wall shows the slope above the fort.', { if: { flag: 'read_gremaud_letter', notFlag: ['read_chart_larch', 'found_forest_grave'] }, point: chart });
    kit.hint('The track to the larch starts outside, on the right of the barn.', { if: { flag: 'read_gremaud_letter', notFlag: 'found_forest_grave' } });
  }
  kit.hint('The way out is back up the corridor, through the gas lock.');
}

/** Seconds spent within `spot` since `progress` last changed, counted only while play runs. */
function lingering(kit: LevelKit, ctx: SceneContext, spot: Spot & { r: number }, progress: () => unknown): () => number {
  let seconds = 0;
  let last = progress();
  everyFrame(kit, (dt) => {
    const now = progress();
    if (now !== last) seconds = 0;
    last = now;
    const p = ctx.player.position;
    if (!ctx.paused && Math.hypot(p.x - spot.x, p.z - spot.z) <= spot.r) seconds += dt;
  });
  return () => seconds;
}
