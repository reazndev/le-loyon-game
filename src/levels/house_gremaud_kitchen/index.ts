import type { LevelKit } from '../../game/kit/levelKit';
import { defineScene, type SceneContext } from '../../game/scene';
import { check } from '../../game/conditions';
import { scareDirector } from '../../game/scares/director';
import { everyFrame } from '../church/everyFrame';
import { isNight, storyPhase, type StoryPhase } from '../forest_path/story';
import { fridge } from '../home/sounds';
import { loopSound } from '../inn/interior';
import { roomTone, tvMurmur } from '../inn/sounds';
import { buildBelongings } from './belongings';
import { kitchenClock, type PausableLoop } from './clock';
import { buildFurniture } from './furniture';
import { CLOCK, FRIDGE, HALL_DOOR, HIS_HEAD, LIVING_DOOR, NORTH, ROOM, SOUTH } from './layout';
import { placeLooks } from './lookSpots';
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
    buildShell(kit, night);
    buildFurniture(kit, night);
    const diary = buildBelongings(kit);
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
    loopSound(kit, (audio) => fridge(audio, { x: FRIDGE.x, y: 0.4, z: NORTH + 0.2 }));
    loopSound(kit, (audio) => roomTone(audio, 0.1));

    stageBeats(kit, ctx, phase, clock);
  },
});

/**
 * kit_clock_stop: the first time the player looks for a moment at where he would sit, the clock
 * stops. Six seconds of nothing where the tick should be, then it goes on. Never explained.
 */
export function stageBeats(kit: LevelKit, _ctx: SceneContext, _phase: StoryPhase, clock: PausableLoop): void {
  kit.use(
    scareDirector([
      {
        id: 'kit_clock_stop',
        when: [{ after: 4 }, { look: { ...HIS_HEAD, angle: 12, within: 4.5, hold: 1.4 } }],
        do: [{ run: () => clock.pause() }, { after: CLOCK_STOP, run: () => clock.resume() }],
        set: 'kit_clock_stop',
      },
    ]),
  );
}

export const scenes = [kitchenScene];
