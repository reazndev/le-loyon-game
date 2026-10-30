import { writeSave } from '../../game/save';
import type { SceneContext } from '../../game/scene';
import { SLEEP_SLOT } from '../cemetery/caught';
import { playNode } from '../forest_path/play';
import { showTitleCard } from '../home/titleCard';
import { RADIATOR } from './layout';
import { radiatorKnock } from './sounds';
import { bedOutcome, mornings } from './story';

/** Where the story's days and nights turn over: after supper, after Yannick, and in room 3's bed. */

const wait = (seconds: number) => new Promise((resolve) => setTimeout(resolve, seconds * 1000));

/** Set before the inn reloads after supper, so the meal is still on the table. */
let mealJustEaten = false;

/** Whether the inn is loading straight after supper. Reading it clears it. */
export function takeMealJustEaten(): boolean {
  const eaten = mealJustEaten;
  mealJustEaten = false;
  return eaten;
}

/** Night `night` begins: the outdoor areas turn dark and the inn reloads closed for the night. */
export function fallNight(ctx: SceneContext, night: number, spawn: string, afterSupper: boolean): void {
  mealJustEaten = afterSupper;
  ctx.state.setCount('night', night);
  ctx.state.time = 'night';
  ctx.goTo('inn', spawn);
}

/** The bed in room 3: a refusal, or sleep through to the next morning. */
export async function lieDown(ctx: SceneContext): Promise<void> {
  const { state } = ctx;
  const outcome = bedOutcome(state);
  if (outcome.kind === 'refuse') return 'node' in outcome ? playNode(ctx, outcome.node) : ctx.say(outcome.line);

  const firstNight = state.count('night') === 1;
  await playNode(ctx, 'room_bed_night');
  const dark = showTitleCard(ctx, []);
  if (firstNight) radiatorRhythm(ctx);
  await wait(firstNight ? 7.5 : 4);
  const [date, time] = mornings[outcome.wake]!;
  const card = showTitleCard(ctx, [date, time]);
  dark.close();

  if (outcome.leftOpen) state.setFlag('grave_left_open');
  state.setCount('night', 0);
  state.setCount('day', outcome.wake);
  state.time = 'day';
  wakeUp(ctx);
  await wait(3.5);
  ctx.goTo('inn');
  await wait(1);
  card.close();
}

/** Saves the morning as the slot "Continue from the last sleep" returns to: room 3, the default spawn. */
export function wakeUp(ctx: SceneContext): void {
  writeSave(localStorage, SLEEP_SLOT, { ...ctx.state.snapshot(), scene: 'inn' });
}

/**
 * inn_radiator: as the reporter lies down on the first night, the radiator knocks three times,
 * a pause, then once. Monique said it knocks. The same rhythm opens the door of K.P. 3.
 */
function radiatorRhythm(ctx: SceneContext): void {
  [1.6, 2.3, 3.0, 5.1].forEach((at) => setTimeout(() => radiatorKnock(ctx.audio, RADIATOR), at * 1000));
}

/**
 * Friday at dawn, back from the fort: a black card with the date, then room 3, where the
 * reporter writes the piece out by hand before going down to the phone.
 */
export async function endingMorning(ctx: SceneContext, deskPose: { x: number; y: number; z: number; yaw: number }): Promise<void> {
  const [date, time] = mornings[4]!;
  const card = showTitleCard(ctx, [date, time]);
  await wait(3.2);
  ctx.player.place(deskPose.x, deskPose.y, deskPose.z, deskPose.yaw);
  card.close();
  await wait(1.2);
  await ctx.say([
    'I sit at the little table under the roof and write it all down. Names. Dates. The coffin. The larch. His voice through the steel.',
    'By eight the notebook is full. The phone is downstairs, in the back room.',
  ]);
  wakeUp(ctx);
}
