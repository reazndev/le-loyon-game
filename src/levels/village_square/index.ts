import { dialogues, holds } from '../../content';
import type { LevelKit } from '../../game/kit/levelKit';
import { defineScene, type SceneContext } from '../../game/scene';
import { isNight, storyPhase, type StoryPhase } from '../forest_path/story';
import { villageAmbience, villageAtmosphere } from './atmosphere';
import { stageBeats } from './beats';
import { churchFront, doorHouses, garage, gremaud, inn, laiterie, outlyingHouses, presbytery } from './buildings';
import { BUS_STOP, FOUNTAIN, GREMAUD_GATE, HOUSE_1, HOUSE_2, spawns } from './layout';
import { bicycle } from './props';
import { arrival, departure } from './postbus';
import { fountainWater, televisionThroughWall } from './sounds';
import { exits, ground, streetFurniture } from './streets';

/**
 * Place du village. The fountain, the PostBus stop, the phone box, the memorial, the church
 * front, the inn, the laiterie, the garage, the Gremaud house, and the road through. The bus
 * drops the reporter here on day 1, and the stop is the way home until Marc has been met.
 */
export const villageSquareScene = defineScene({
  id: 'village_square',
  spawns,
  atmosphere: villageAtmosphere,

  build(kit, ctx) {
    const { state } = ctx;
    const arriving = !state.hasFlag('arrived');
    if (arriving) {
      // The prologue ends at night at home; Leurs begins on Tuesday at 16:20.
      state.time = 'day';
      if (state.count('day') === 0) state.setCount('day', 1);
    }
    const phase = storyPhase(state);
    const night = isNight(phase);

    kit.ground('grass');
    ground(kit);
    const church = churchFront(kit, ctx, night);
    const abbe = presbytery(kit, night);
    inn(kit, night);
    const home = gremaud(kit, night);
    kit.exit({ w: 1, d: 1.8, to: 'house_gremaud', spawn: 'from_square' }).at(GREMAUD_GATE.x + 0.4, 0, GREMAUD_GATE.z);
    laiterie(kit, night);
    garage(kit, night);
    const houseTwo = doorHouses(kit, ctx, night);
    outlyingHouses(kit, night);
    exits(kit);
    villagers(kit, ctx, phase);

    let lift = (): Promise<void> => Promise.resolve();
    const street = streetFurniture(kit, ctx, night, () => lift());
    lift = stageBeats(kit, ctx, phase, {
      curtain: home.curtain,
      houseTwoLight: houseTwo.upstairs,
      phoneLamp: street.phoneLamp,
      presbyteryLamp: night ? abbe.lamp : null,
    });

    const ambience = villageAmbience(kit, ctx, {
      bell: church.bell,
      held: arriving,
      layers: [
        () => fountainWater(ctx.audio, { x: FOUNTAIN.x - 1.4, y: 0.8, z: FOUNTAIN.z }),
        ...(night ? [] : [() => televisionThroughWall(ctx.audio, { x: HOUSE_1.x + 3.6, y: 1.4, z: HOUSE_1.z + 2.4 })]),
      ],
    });
    if (arriving) arrival(kit, ctx, ambience);
    timetable(kit, ctx);
  },
});

/**
 * The timetable at the stop. From day 1 until Marc has been met, it is also the way home: the
 * last bus comes up out of the fog and the driver asks once. The leave ending follows.
 */
function timetable(kit: LevelKit, ctx: SceneContext): void {
  const bus = departure(kit, ctx);
  let leaving = false;
  kit
    .hotspot({
      prompt: 'Read the timetable',
      radius: 0.8,
      enabled: () => ctx.state.hasFlag('arrived') && !ctx.state.hasFlag('met_marc') && !leaving,
      onInteract: async () => {
        await ctx.dialogue(dialogues.square_busstop);
        if (!ctx.state.hasFlag('ending_leave')) return;
        leaving = true;
        await bus();
      },
    })
    .at(BUS_STOP.x - 1.6, 0, BUS_STOP.z - 0.8);
}

/**
 * Who is out of doors. People in Leurs stay inside in November; the child's bicycle is the only
 * sign of the child, and on day 2 it lies in the road. Raymond stands by the fountain on the
 * morning of day 2 with Bari, after a night up at the cemetery.
 */
function villagers(kit: LevelKit, ctx: SceneContext, phase: StoryPhase): void {
  const leaning = phase === 'day1';
  const bike = bicycle(kit);
  if (leaning) bike.at(HOUSE_2.x + 3.6, 0, HOUSE_2.z - HOUSE_2.d / 2 - 0.25).rotY(90);
  else bike.at(-14, 0.05, 9.6).rotY(70);
  if (!leaning) bike.object.rotation.z = Math.PI / 2 - 0.08;

  if (phase === 'day2' && !holds('has_shovel', ctx.state)) {
    kit.npc('raymond').at(-2.2, 0, 1.6).faceYaw(200).watch(5).talk('raymond_day2');
    kit.npc('bari').at(-1.2, 0, 2.2).faceYaw(240);
  }
}

export const scenes = [villageSquareScene];
