import { defineScene } from '../../game/scene';
import { WALL, loopSound } from '../inn/interior';
import { nowAndThen, roomTone } from '../inn/sounds';
import { isNight, storyPhase } from '../forest_path/story';
import { garageAmbient } from './ambient';
import { stageBeats } from './beats';
import { garageCast } from './cast';
import { buildClutter } from './clutter';
import { buildFiatOnLift } from './fiat';
import { DOOR, INSIDE_DOOR, LIFT, PIT, RADIO, ROOM, SUMP } from './layout';
import { buildLights } from './lights';
import { narration } from './narration';
import { placeCast } from './people';
import { buildPostcard } from './postcard';
import { buildBench, buildCalendar, buildDrums, buildRadioShelf, buildTyres } from './props';
import { ShelfRadio } from './radio';
import { buildShell } from './shell';
import { oilDrip } from './sounds';

/**
 * Garage Dousse, the village mechanic: a pit, a Fiat 127 up on the lift, the bench with the
 * 1979 postcard from Calvi pinned over it, and a radio playing low. Yannick works here by day;
 * Gilles from day 2. At night it is shut, dark, and empty but for the drip from the sump.
 */
export const garageScene = defineScene({
  id: 'garage_dousse',
  spawns: {
    default: INSIDE_DOOR,
    from_square: INSIDE_DOOR,
  },
  atmosphere: {
    day: {
      fog: { color: 0x3c3e3c, near: 5, far: 20, density: 0.015, wisps: 0.05 },
      ambient: 0x4c4e4c,
      saturation: 0.5,
      flashlight: false,
    },
    night: {
      fog: { color: 0x030405, near: 0.5, far: 12, density: 0.12, wisps: 0.1 },
      ambient: 0x0a0b0e,
      saturation: 0.45,
    },
  },

  build(kit, ctx) {
    const phase = storyPhase(ctx.state);
    const open = !isNight(phase);

    kit.batch((still) => {
      buildShell(still, !open);
      buildLights(still, ctx, open);
      buildFiatOnLift(still);
      buildBench(still);
      buildDrums(still);
      buildTyres(still);
      buildRadioShelf(still, open);
      buildPostcard(still, ctx);
      buildClutter(still);
      buildCalendar(still).interact({ prompt: 'Look at the calendar', radius: 0.3, onInteract: () => ctx.say(narration.calendar) });
    });
    garageAmbient(kit, ctx, open);
    placeCast(kit, ctx, garageCast(phase, ctx.state));

    kit.door({ to: 'village_square', spawn: 'from_garage', w: DOOR.w, h: DOOR.h, prompt: 'Go out' }).at(DOOR.x, 0, ROOM.z1 - WALL / 2 - 0.05);

    kit.hotspot({ prompt: 'Look at the Fiat', radius: 0.5, onInteract: () => ctx.say(narration.fiat) }).at(LIFT.x - 0.9, 0, LIFT.z + 1.6);
    kit.hotspot({ prompt: 'Look into the pit', radius: 0.5, onInteract: () => ctx.say(narration.pit) }).at(PIT.x, 0, PIT.z + 1.4);
    kit.hotspot({ prompt: 'Look at the radio', radius: 0.3, onInteract: () => ctx.say(open ? narration.radioOn : narration.radioOff) }).at(RADIO.x, 0, RADIO.z);

    loopSound(kit, (audio) => roomTone(audio, open ? 0.1 : 0.16));
    loopSound(kit, () => nowAndThen(open ? 2.4 : 3.5, () => oilDrip(ctx.audio, { x: SUMP.x, y: 0.1, z: SUMP.z })));
    if (!open) return;
    // The strip lights' hum, and the radio turned low.
    kit.ambience('drone', { volume: 0.04 });
    const radio = new ShelfRadio(ctx.audio, RADIO).on();
    loopSound(kit, () => radio);
    stageBeats(kit, ctx, phase, radio);
  },
});

export const scenes = [garageScene];
