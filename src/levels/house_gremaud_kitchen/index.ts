import type { LevelKit } from '../../game/kit/levelKit';
import { defineScene, type SceneContext } from '../../game/scene';
import { check } from '../../game/conditions';
import { scareDirector } from '../../game/scares/director';
import { lookBack } from '../../game/scares/lookBack';
import type { Placed } from '../../game/kit/builders';
import { everyFrame } from '../church/everyFrame';
import { isNight, storyPhase } from '../forest_path/story';
import { fridgeHum } from '../../game/ambient/sounds';
import { loopSound } from '../inn/interior';
import { fridgeKick, roomTone, tvMurmur } from '../inn/sounds';
import { kitchenAmbient } from './ambient';
import { buildBelongings } from './belongings';
import { kitchenClock, type PausableLoop } from './clock';
import { buildClutter } from './clutter';
import { buildFurniture, chair } from './furniture';
import { CLOCK, FRIDGE, HALL_DOOR, HIS_CHAIR, HIS_HEAD, LIVING_DOOR, NORTH, ROOM, SOUTH } from './layout';
import { placeLooks } from './lookSpots';
import { hints } from './hints';
import { greetOnArrival, INSIDE_FIRST_TIME, placeOdile } from './odile';
import { buildShell } from './shell';

/**
 * Odile Gremaud's kitchen, on days 2 and 3. Spotless, warm, and silent but for the clock and the
 * fridge. Jean-Pierre's things are where he left them. By day Odile is here and the television
 * talks to nobody in the next room; at night the house is dark but for one small lamp.
 */

const INSIDE_DOOR = { x: HALL_DOOR.x, z: SOUTH - 0.75, yaw: 0 };
/** Seconds of no clock. */
const CLOCK_STOP = 6;

export const kitchenScene = defineScene({
  id: 'house_gremaud_kitchen',
  spawns: {
    default: INSIDE_DOOR,
    from_door: INSIDE_DOOR,
  },
  atmosphere: {
    day: {
      fog: { color: 0x5e605e, near: 3, far: 14, density: 0.02, wisps: 0.05 },
      ambient: 0x38342e,
      saturation: 0.58,
      flashlight: false,
    },
    night: {
      fog: { color: 0x040405, near: 0.5, far: 10, density: 0.1, wisps: 0.05 },
      ambient: 0x0b0c0f,
      saturation: 0.5,
    },
  },

  build(kit, ctx) {
    const phase = storyPhase(ctx.state);
    const night = isNight(phase);
    const diary = kit.batch((still) => {
      buildShell(still, night);
      buildFurniture(still, night);
      buildClutter(still);
      return buildBelongings(still);
    });
    const hisChair = chair(kit, HIS_CHAIR.x, HIS_CHAIR.z, HIS_CHAIR.yaw);
    const diaryThere = () => !ctx.state.hasItem('gremaud_diary');
    everyFrame(kit, () => (diary.object.visible = diaryThere()));
    placeLooks(kit, ctx, night, diaryThere);

    if (!night) {
      const odile = placeOdile(kit);
      if (check(INSIDE_FIRST_TIME, ctx.state)) greetOnArrival(kit, ctx, odile);
      loopSound(kit, (audio) => tvMurmur(audio, { x: ROOM.x0 - 1.4, y: 1, z: LIVING_DOOR.z - 0.4 }, 0.2));
    }

    const clock = kitchenClock(ctx.audio, { x: CLOCK.x, y: CLOCK.y, z: NORTH + 0.05 });
    loopSound(kit, () => clock);
    loopSound(kit, (audio) => fridgeHum(audio, { x: FRIDGE.x, y: 0.4, z: NORTH + 0.2 }));
    loopSound(kit, (audio) => roomTone(audio, 0.1));
    kitchenAmbient(kit, ctx, night, clock);

    stageBeats(kit, ctx, clock, hisChair);
    hints(kit);
  },
});

/**
 * kit_clock_stop: the first time the player looks for a moment at where he would sit, the clock
 * stops. Six seconds of nothing where the tick should be, then it goes on. Never explained.
 * kit_fridge_kick: once, the fridge's compressor knocks in loudly in the quiet. kit_chair_moved:
 * once, his chair is pulled out while the player looks away. The cat jumps down from it, or Odile
 * pushes it with her foot; nobody says.
 */
export function stageBeats(kit: LevelKit, ctx: SceneContext, clock: PausableLoop, hisChair: Placed): void {
  kit.use(
    scareDirector([
      {
        id: 'kit_clock_stop',
        when: [{ after: 4 }, { look: { ...HIS_HEAD, angle: 12, within: 4.5, hold: 1.4 } }],
        do: [{ run: () => clock.pause() }, { after: CLOCK_STOP, run: () => clock.resume() }],
        set: 'kit_clock_stop',
      },
      {
        id: 'kit_fridge_kick',
        when: { after: 25 },
        do: [{ run: (c) => fridgeKick(c.audio, { x: FRIDGE.x, y: 0.4, z: NORTH + 0.3 }) }],
        set: 'kit_fridge_kick',
      },
    ]),
  );
  const seat = hisChair.object;
  const pullOut = () => {
    seat.position.x += 0.22;
    seat.rotation.y += (18 * Math.PI) / 180;
  };
  // It stays where it was left on later visits.
  if (ctx.state.hasFlag('kit_chair_moved')) return pullOut();
  lookBack(kit, ctx, {
    at: { x: seat.position.x, y: 0.6, z: seat.position.z },
    within: 5,
    if: () => ctx.time > 20,
    change: () => {
      pullOut();
      ctx.state.setFlag('kit_chair_moved');
    },
  });
}

export const scenes = [kitchenScene];
