import { dialogues, holds } from '../../content';
import { createHomeComputer } from '../../desktop';
import type { SoundHandle } from '../../engine/audio/audioManager';
import type { ScreenHandle } from '../../game/gameUi';
import { defineScene, type Scene } from '../../game/scene';
import { bed, desk, DESK, doorSide, rainStreaks, ROOM, SCREEN, walls, westWall, window } from './room';
import { fridgeHum, rain } from '../../game/ambient/sounds';
import { flatAmbience } from './ambience';
import { clutter, curtains } from './clutter';
import { computerHum } from './sounds';
import { showTitleCard } from './titleCard';

const STAND = { x: DESK.x, z: DESK.z + 1.15, yaw: 0 };
/** Seconds the player looks at the monitor before the desktop fills the frame. */
const FIRST_LOOK = 1.6;
const SIT_DOWN = 0.35;
const START_ITEMS = ['notebook', 'polaroid_camera', 'pocket_money'];

/**
 * The prologue: the reporter's flat at 23:10 on Monday 16 November 1998, rain on the window.
 * The player starts at the computer. Once the village is found, "Pack and go" in the Start menu
 * (or the door) ends the prologue and takes the bus to Leurs.
 */
export const homeScene: Scene = (() => {
  let cleanup: (() => void)[] = [];
  let tick: (dt: number) => void = () => undefined;

  return defineScene({
    id: 'home',
    spawns: { default: STAND },
    atmosphere: {
      day: interior(),
      night: interior(),
    },

    build(kit, ctx) {
      const computer = createHomeComputer(ctx);
      const sounds: SoundHandle[] = [
        rain(ctx.audio, { at: { x: 1, y: 1.5, z: -ROOM.halfD - 0.3 } }),
        fridgeHum(ctx.audio, { x: -ROOM.halfW - 0.8, y: 0.8, z: 1.2 }),
      ];
      const hum = computerHum(ctx.audio, { x: DESK.x, y: 0.9, z: DESK.z });
      let seated = false;
      let leaving = false;
      let firstLook = !ctx.state.hasFlag('pro_done');
      let card: ScreenHandle | null = null;

      const sitDown = async (delay: number) => {
        seated = true;
        const camera = ctx.player.camera;
        camera.position.set(DESK.x, 1.16, DESK.z + 0.82);
        camera.lookAt(SCREEN.x, SCREEN.y, SCREEN.z);
        await computer.sit(delay);
        seated = false;
        if (!leaving) ctx.player.place(STAND.x, 0, STAND.z, STAND.yaw);
      };

      const packAndGo = async () => {
        if (leaving) return;
        leaving = true;
        if (seated) {
          await computer.powerOff();
          screen.screen(false);
          hum.stop(0.1);
        }
        ctx.state.setFlag('pro_done');
        START_ITEMS.forEach((item) => ctx.state.giveItem(item));
        ctx.state.setCount('film_shots', 10);
        card = showTitleCard(ctx, ['Tuesday 17 November 1998', '16:20']);
        await new Promise((resolve) => setTimeout(resolve, 4500));
        ctx.goTo('village_square', 'bus_stop');
      };
      computer.onPackAndGo = () => void packAndGo();

      walls(kit);
      window(kit, () => void ctx.dialogue(dialogues.home_window));
      const streaks = rainStreaks(kit);
      const screen = desk(kit, () => void sitDown(SIT_DOWN), () => !seated && !leaving);
      bed(kit);
      westWall(kit);
      clutter(kit);
      flatAmbience(kit, ctx, curtains(kit));
      const ready = () => holds('pro_knows_village', ctx.state);
      doorSide(kit, {
        onDoor: () => (ready() ? void packAndGo() : void ctx.dialogue(dialogues.home_bag)),
        onCoat: () => void ctx.dialogue(dialogues.home_coat),
        onBag: () => void ctx.dialogue(ready() ? dialogues.home_bag_ready : dialogues.home_bag),
      });

      const atStart = () => Math.hypot(ctx.player.position.x - STAND.x, ctx.player.position.z - STAND.z) < 0.05;
      tick = (dt: number) => {
        streaks(dt);
        if (firstLook && ctx.time > 0) {
          firstLook = false;
          if (atStart()) void sitDown(FIRST_LOOK);
        }
      };
      cleanup = [
        () => sounds.forEach((sound) => sound.stop(0.5)),
        () => hum.stop(0.3),
        () => card?.close(),
        () => computer.hangUp(),
        () => seated && computer.stand(),
      ];
    },

    update(dt) {
      tick(dt);
    },

    dispose() {
      cleanup.forEach((run) => run());
      cleanup = [];
    },
  });
})();

/** A dark room lit by the desk lamp, the monitor, and the street lamp outside. */
function interior(): Scene['atmosphere']['night'] {
  return {
    fog: { color: 0x050608, near: 3, far: 14, density: 0.02, wisps: 0 },
    ambient: 0x15161b,
    saturation: 0.7,
    flashlight: false,
  };
}

export const scenes = [homeScene];
