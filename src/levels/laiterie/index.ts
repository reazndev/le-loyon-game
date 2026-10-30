import { defineScene } from '../../game/scene';
import { everyFrame } from '../church/everyFrame';
import { storyPhase } from '../forest_path/story';
import { fridge } from '../home/sounds';
import { loopSound, WALL } from '../inn/interior';
import { clockTick, houseCreak, nowAndThen, radio, roomTone } from '../inn/sounds';
import { stageBeats } from './beats';
import { shopBell } from './bell';
import { buildDairy } from './dairy';
import { BELL, CHRISTINE, CLOCK, DOOR, RADIO, ROOM, TANK } from './layout';
import { buildShell } from './shell';
import { buildShop } from './shop';

/**
 * The laiterie-épicerie of Leurs: the dairy where farmers bring their milk at six and six, and
 * Christine Menoud's shop beside it. Warm and dull by day, with the tank humming and the clock
 * ticking. At night the shop is shut and dark and nobody is in it.
 */

/** Just inside the door, facing in. */
const INSIDE_DOOR = { x: DOOR.x, z: ROOM.z1 - 0.75, yaw: 0 };

export const laiterieScene = defineScene({
  id: 'laiterie',
  spawns: {
    default: INSIDE_DOOR,
    from_square: INSIDE_DOOR,
  },
  atmosphere: {
    day: {
      fog: { color: 0x3a3630, near: 4, far: 18, density: 0.02, wisps: 0.05 },
      ambient: 0x342e26,
      saturation: 0.62,
      flashlight: false,
    },
    night: {
      fog: { color: 0x040506, near: 0.5, far: 12, density: 0.1, wisps: 0.05 },
      ambient: 0x0c0d10,
      saturation: 0.55,
    },
  },

  build(kit, ctx) {
    const night = ctx.state.time === 'night';
    kit.ground('wood', 0);
    buildShell(kit, night);
    buildDairy(kit, ctx);
    buildShop(kit, ctx, night);
    if (!night) kit.npc('christine').at(CHRISTINE.x, 0, CHRISTINE.z).faceYaw(CHRISTINE.yaw).watch(4).talk('christine');

    kit.door({ to: 'village_square', spawn: 'from_laiterie', w: DOOR.w, h: DOOR.h, prompt: 'Go out' }).at(DOOR.x, 0, ROOM.z1 - WALL / 2 - 0.05);

    // The tank keeps the milk cold day and night; the radio is Christine's and goes home with her.
    loopSound(kit, (audio) => roomTone(audio, 0.1));
    loopSound(kit, (audio) => fridge(audio, { x: TANK.x, y: 1, z: TANK.z }));
    loopSound(kit, (audio) => clockTick(audio, CLOCK, 0.3));
    loopSound(kit, () => nowAndThen(45, () => houseCreak(ctx.audio, { x: ROOM.x0 + Math.random() * 7, y: 2.6, z: ROOM.z0 + Math.random() * 6 }, 0.35)));
    if (!night) loopSound(kit, (audio) => radio(audio, RADIO, 0.14));

    // The bell rings as the door shuts behind the player, once the scene has faded in enough to hear it.
    let rung = false;
    everyFrame(kit, () => {
      if (rung || ctx.time < 0.35) return;
      rung = true;
      shopBell(ctx.audio, { at: BELL }, 1);
    });

    stageBeats(kit, ctx, storyPhase(ctx.state));
  },

  // The scene buses are already faded out by now, so the bell going out rings on the ui bus.
  dispose(ctx) {
    shopBell(ctx.audio, { bus: 'ui', volume: 0.3 }, 0.8);
  },
});

export const scenes = [laiterieScene];
