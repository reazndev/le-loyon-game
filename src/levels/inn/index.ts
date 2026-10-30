import { openInnComputer } from '../../desktop';
import type { LevelKit } from '../../game/kit/levelKit';
import { defineScene, type SceneContext } from '../../game/scene';
import { everyFrame } from '../church/everyFrame';
import { innAmbient } from './ambient';
import { stageBeats } from './beats';
import { buildCafe } from './cafe';
import { placeCafeCast } from './cast';
import { innClutter } from './clutter';
import { hints } from './hints';
import { veilleur } from './veilleur';
import { cafeLit, dressInn, type InnDressing } from './dressing';
import { loopSound } from './interior';
import { CAFE, FRONT_DOOR, KITCHEN_DOOR, ROOM3_DESK, SCREEN, SEAT, STUBLI, UPPER } from './layout';
import { InnPhone } from './phone';
import { clockTick, cutlery, houseCreak, nowAndThen, radio, roomTone, tvMurmur } from './sounds';
import { innStage } from './story';
import { buildStubli } from './stubli';
import { endingMorning, fallNight, lieDown, takeMealJustEaten } from './turns';
import { buildUpstairs, lookOutOfRoom3 } from './upstairs';

/**
 * Auberge de la Croix-Blanche. The café with its six tables and Monique at the counter, the
 * stübli with Yannick's computer and the phone, and room 3 upstairs. The inn turns the story:
 * supper starts nights 1 and 2, Yannick behind the reporter in the stübli starts night 3, the
 * bed in room 3 ends nights 1 and 2, and the phone in the stübli ends the game.
 */

const FROM_SQUARE = { x: FRONT_DOOR.x, z: CAFE.z1 - 0.8, yaw: 0 };
/** Waking in room 3, between the bed and the door. Also where "Continue from the last sleep" starts. */
const ROOM3_WAKE = { x: 7.55, y: UPPER, z: -8.55, yaw: -110 };

export const innScene = defineScene({
  id: 'inn',
  spawns: {
    default: ROOM3_WAKE,
    room3: ROOM3_WAKE,
    from_square: FROM_SQUARE,
    supper: { x: -0.6, z: 1.85, yaw: 0 },
    stubli: { x: -6.2, z: 2.1, yaw: -100 },
  },
  atmosphere: {
    day: {
      fog: { color: 0x2c2822, near: 5, far: 20, density: 0.015, wisps: 0 },
      ambient: 0x4a4640,
      saturation: 0.66,
      flashlight: false,
    },
    night: {
      fog: { color: 0x050506, near: 2.5, far: 14, density: 0.04, wisps: 0 },
      ambient: 0x18181d,
      saturation: 0.55,
      // The torch Monique lent is in the reporter's hand whenever it's night.
    },
  },

  build(kit, ctx) {
    const { state } = ctx;
    // The first day may begin before anyone counted it.
    if (state.count('day') === 0) state.setCount('day', 1);
    const arrivingAtDawn = state.hasFlag('met_marc') && state.count('day') < 4;
    if (arrivingAtDawn) {
      state.setCount('day', 4);
      state.setCount('night', 0);
    }
    const dressing = dressInn(state);
    const justAte = takeMealJustEaten();

    const tvScreen = buildCafe(kit, ctx, dressing, justAte);
    const curtain = innClutter(kit, dressing);
    placeCafeCast(kit, ctx, dressing);
    const scares = stageBeats(kit, ctx, dressing);
    const phone = new InnPhone(kit, ctx, dressing, scares);
    const showYannick = veilleur(kit, ctx, scares);
    buildStubli(kit, dressing, { useComputer: () => void sitAtComputer(ctx, dressing, showYannick) });
    buildUpstairs(kit, ctx, dressing, { onBed: () => void lieDown(ctx), onWindow: () => void lookOutOfRoom3(ctx) });
    kit.door({ to: 'village_square', spawn: 'from_inn', w: FRONT_DOOR.w, h: FRONT_DOOR.h, prompt: 'Go out' }).at(FRONT_DOOR.x, 0, CAFE.z1 + 0.02);

    sounds(kit, dressing);
    innAmbient(kit, ctx, dressing, { tvScreen, curtain });
    turnTheDay(kit, ctx, dressing, (moniqueHere) => phone.ring(moniqueHere), arrivingAtDawn);
    hints(kit, ctx, dressing, () => phone.isRinging);
  },
});

/**
 * Watches for the moments the story turns over inside the inn: supper eaten, the editor's call
 * due, and the reporter back at dawn.
 */
function turnTheDay(kit: LevelKit, ctx: SceneContext, dressing: InnDressing, ring: (moniqueHere: boolean) => void, arrivingAtDawn: boolean): void {
  const { state } = ctx;
  const supper = !dressing.supper ? null : dressing.day === 1 ? ({ flag: 'dinner_day1', night: 1 } as const) : ({ flag: 'dinner_day2', night: 2 } as const);
  let started = false;
  let callDue = false;
  everyFrame(kit, () => {
    if (!started) {
      started = true;
      const fromOutside = Math.hypot(ctx.player.position.x - FROM_SQUARE.x, ctx.player.position.z - FROM_SQUARE.z) < 0.3;
      callDue = fromOutside && dressing.day === 3 && !dressing.night && !state.hasFlag('editor_called');
      if (arrivingAtDawn) void endingMorning(ctx, { x: ROOM3_DESK.x + 0.2, y: UPPER, z: ROOM3_DESK.z + 0.95, yaw: -75 });
    }
    if (callDue && ctx.time > 3 && !ctx.paused) {
      callDue = false;
      ring(cafeLit(dressing));
    }
    // Monique's supper starts the night once the reporter has finished eating.
    if (supper && !ctx.paused && state.hasFlag(supper.flag) && state.count('night') === 0) fallNight(ctx, supper.night, 'supper', true);
  });
}

/** Sits the reporter down at Yannick's machine. On the third evening, "turn around". */
async function sitAtComputer(ctx: SceneContext, dressing: InnDressing, showYannick: () => void): Promise<void> {
  const stage = innStage(ctx.state, dressing.eveningThree);
  ctx.player.place(SEAT.x, 0, SEAT.z, SEAT.yaw);
  ctx.player.camera.lookAt(SCREEN.x, SCREEN.y, SCREEN.z);
  let readYou = false;
  await openInnComputer(ctx, { stage, onRead: (id) => (readYou ||= id === '503') });
  if (stage === 5 && readYou && !ctx.state.hasFlag('met_veilleur')) showYannick();
}

/** Clocks, the television through the kitchen door, cutlery by day, and the house creaking at night. */
function sounds(kit: LevelKit, dressing: InnDressing): void {
  const lit = cafeLit(dressing);
  const kitchen = { x: KITCHEN_DOOR.x, y: 1.3, z: CAFE.z0 - 0.6 };
  loopSound(kit, (audio) => roomTone(audio, 0.1));
  loopSound(kit, (audio) => clockTick(audio, { x: CAFE.x0 + 0.15, y: 2.05, z: 0.6 }, 0.32));
  loopSound(kit, (audio) => clockTick(audio, { x: STUBLI.x0 + 0.3, y: 1.9, z: STUBLI.z0 + 0.2 }, 0.12));
  if (dressing.night) loopSound(kit, (audio) => radio(audio, kitchen, 0.07));
  else loopSound(kit, (audio) => tvMurmur(audio, kitchen, 0.22));
  if (lit) {
    loopSound(kit, (audio) => nowAndThen(14, () => cutlery(audio, { x: (Math.random() - 0.5) * 8, y: 0.8, z: (Math.random() - 0.5) * 6 }, 0.35)));
  } else {
    // At night the house settles: a board on the stairs, a beam upstairs, the floor of the café.
    const spots = [
      { x: -1.7, y: 1.4, z: -6 },
      { x: 2, y: UPPER + 1, z: -8.7 },
      { x: -2, y: 0.2, z: 1 },
      { x: 4, y: UPPER + 2, z: -9 },
    ];
    loopSound(kit, (audio) => nowAndThen(dressing.night ? 11 : 18, () => houseCreak(audio, spots[Math.floor(Math.random() * spots.length)]!, 0.5)));
  }
}

export const scenes = [innScene];
