import type { SceneContext } from '../game/scene';
import { Computer } from './computer';
import { forumStage, type ForumStage } from './forum';
import { homeSetup, innSetup, BOARD_URL } from './setup';

export { Computer } from './computer';
export { forumStage, type ForumStage } from './forum';

/** The reporter's home PC for the prologue. Keep one per scene so it stays connected between sittings. */
export function createHomeComputer(ctx: SceneContext): Computer {
  return new Computer(ctx, homeSetup, 0);
}

export interface InnComputerOptions {
  /** Board stage to show. Default: computed from `day` and the story flags with `forumStage`. */
  stage?: Exclude<ForumStage, 0>;
  /** Taskbar time at power on, "HH:MM". Default: a time that fits the stage. */
  clock?: string;
  /** Runs with the message number of each board post the player opens. The stage 5 post "you" is 503. */
  onRead?: (postId: string) => void;
}

const innClock: Record<Exclude<ForumStage, 0>, string> = { 1: '17:45', 2: '08:20', 3: '16:40', 4: '08:50', 5: '19:20' };

/**
 * Sits the player at the old computer in the inn's stübli. It dials up on the house line with
 * the full modem handshake, then opens Navigator on the Alpine Anomalies board at the stage
 * that matches the story so far. Opening the board sets `forum_seen_<stage>`.
 *
 * Resolves when the player stands up: Back on an empty desktop, or Start > Shut Down. The modem
 * hangs up then, so the house phone is free again.
 *
 * ```ts
 * import { openInnComputer } from '../../desktop';
 *
 * kit.box({ w: 0.4, h: 0.36, d: 0.4 }).at(x, 0.76, z).interact({
 *   prompt: 'Use the computer',
 *   onInteract: async () => {
 *     let readYou = false;
 *     await openInnComputer(ctx, { onRead: (id) => (readYou ||= id === '503') });
 *     // The player is standing again. On stage 5, start the doorway scene if readYou.
 *   },
 * });
 * ```
 */
export async function openInnComputer(ctx: SceneContext, options: InnComputerOptions = {}): Promise<void> {
  const stage = options.stage ?? forumStage(ctx.state);
  const pc = new Computer(ctx, innSetup(options.clock ?? innClock[stage]), stage);
  if (options.onRead) pc.onPostRead = options.onRead;
  const sitting = pc.sit();
  pc.dialUp.dial(() => pc.launch(() => pc.browser.open(BOARD_URL), 1));
  await sitting;
  pc.hangUp();
}
